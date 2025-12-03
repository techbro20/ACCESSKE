import json
import socketio
from typing import Dict
import redis.asyncio as aioredis
import redis as sync_redis

from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.config import get_settings
from ..core.database import SessionLocal, get_db
from ..core.security import get_current_user
from ..models.chat import ChatMessage
from ..models.user import User, UserRole


class MessageEdit(BaseModel):
    text: str

settings = get_settings()

# Create Socket.IO server with Redis adapter for pub/sub
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=settings.cors_origins,
    logger=True,
    engineio_logger=True
)

# Redis connection for pub/sub
redis_client: aioredis.Redis | None = None

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Store user sessions
user_sessions: Dict[str, str] = {}  # user_id -> session_id


def publish_to_redis_sync(channel: str, data: dict):
    """Publish event to Redis channel for broadcasting (sync version for use in sync endpoints)"""
    sync_redis_client = sync_redis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True
    )
    sync_redis_client.publish(channel, json.dumps(data))
    sync_redis_client.close()


async def get_redis():
    """Get or create Redis connection"""
    global redis_client
    if redis_client is None:
        redis_client = await aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True
        )
    return redis_client


@sio.event
async def connect(sid, environ, auth):
    """Handle Socket.IO connection"""
    try:
        user_id = auth.get('user_id') if auth else None
        if not user_id:
            print(f"Connection rejected: No user_id in auth")
            return False
        
        # Verify user exists
        db: Session = SessionLocal()
        try:
            user = db.get(User, user_id)
            if not user:
                print(f"Connection rejected: User {user_id} not found")
                return False
            
            # Store session
            user_sessions[user_id] = sid
            await sio.save_session(sid, {'user_id': user_id, 'user_name': f"{user.first_name} {user.last_name}"})
            
            # Join user to their personal room and broadcast room
            await sio.enter_room(sid, f"user_{user_id}")
            await sio.enter_room(sid, "chat_room")
            
            print(f"Socket.IO connected: user {user_id} ({user.first_name} {user.last_name})")
            
            # Send welcome message
            await sio.emit('connected', {
                'type': 'connected',
                'message': 'Connected to chat',
                'sender': 'System'
            }, room=sid)
            
            return True
        finally:
            db.close()
    except Exception as e:
        print(f"Error in connect handler: {e}")
        return False


@sio.event
async def disconnect(sid):
    """Handle Socket.IO disconnection"""
    try:
        session = await sio.get_session(sid)
        user_id = session.get('user_id')
        if user_id:
            user_sessions.pop(user_id, None)
            print(f"Socket.IO disconnected: user {user_id}")
    except Exception as e:
        print(f"Error in disconnect handler: {e}")


@sio.event
async def message(sid, data):
    """Handle incoming chat messages"""
    try:
        session = await sio.get_session(sid)
        user_id = session.get('user_id')
        user_name = session.get('user_name', 'Anonymous')
        
        if not user_id:
            await sio.emit('error', {'message': 'Not authenticated'}, room=sid)
            return
        
        text = data.get('text') or data.get('message', '')
        if not text or not text.strip():
            return
        
        # Save message to database
        db: Session = SessionLocal()
        try:
            user = db.get(User, user_id)
            if not user:
                return
            
            chat = ChatMessage(
                sender_id=user.id,
                sender_name=f"{user.first_name} {user.last_name}",
                text=text.strip()
            )
            db.add(chat)
            db.commit()
            db.refresh(chat)
            
            # Broadcast message to all connected clients
            message_data = {
                'id': str(chat.id),
                'sender': user.first_name,
                'sender_id': str(user.id),
                'text': text.strip(),
                'timestamp': chat.created_at.isoformat(),
            }
            
            # Publish to Redis channel for cross-instance messaging
            # Redis listener will broadcast to all clients (prevents duplication)
            redis = await get_redis()
            await redis.publish('chat_messages', json.dumps(message_data))
            
            print(f"Message from {user_id}: {text[:50]}")
        finally:
            db.close()
    except Exception as e:
        print(f"Error handling message: {e}")
        await sio.emit('error', {'message': 'Failed to send message'}, room=sid)


async def redis_listener():
    """Listen for messages and events from Redis pub/sub"""
    redis = await get_redis()
    pubsub = redis.pubsub()
    await pubsub.subscribe('chat_messages', 'chat_events')
    
    async for message in pubsub.listen():
        if message['type'] == 'message':
            try:
                channel = message['channel'].decode() if isinstance(message['channel'], bytes) else message['channel']
                data = json.loads(message['data'])
                
                # Handle chat messages
                if channel == 'chat_messages':
                    await sio.emit('message', data, room='chat_room')
                
                # Handle chat events (edit, delete, clear)
                elif channel == 'chat_events':
                    event_type = data.get('event')
                    event_data = data.get('data', {})
                    if event_type == 'message_updated':
                        await sio.emit('message_updated', event_data, room='chat_room')
                    elif event_type == 'message_deleted':
                        await sio.emit('message_deleted', event_data, room='chat_room')
                    elif event_type == 'messages_cleared':
                        await sio.emit('messages_cleared', event_data, room='chat_room')
            except Exception as e:
                print(f"Error processing Redis message: {e}")


@router.get("/messages")
def get_chat_messages(
  limit: int = 50,
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db),
):
  """Get recent chat messages"""
  messages = (
    db.execute(
      select(ChatMessage)
      .order_by(ChatMessage.created_at.desc())
      .limit(limit)
    )
    .scalars()
    .all()
  )
  return [
    {
      "id": msg.id,
      "sender": msg.sender_name,
      "sender_id": msg.sender_id,
      "text": msg.text,
      "timestamp": msg.created_at.isoformat(),
    }
    for msg in reversed(messages)  # Return in chronological order
  ]


@router.put("/messages/{message_id}")
def edit_message(
  message_id: str,
  payload: MessageEdit,
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db),
):
  """Edit a message (only if sent within 1 minute by the sender)"""
  message = db.get(ChatMessage, message_id)
  if not message:
    raise HTTPException(status_code=404, detail="Message not found")
  
  # Check if user is the sender
  if message.sender_id != current_user.id:
    raise HTTPException(status_code=403, detail="You can only edit your own messages")
  
  # Check if message was sent within the last minute
  now = datetime.now(timezone.utc)
  time_diff = now - message.created_at
  if time_diff > timedelta(minutes=1):
    raise HTTPException(status_code=400, detail="Message can only be edited within 1 minute of sending")
  
  # Update message
  message.text = payload.text.strip()
  db.commit()
  db.refresh(message)
  
  # Broadcast update to all clients via Redis
  message_data = {
    'event': 'message_updated',
    'data': {
      'id': str(message.id),
      'sender': message.sender_name,
      'sender_id': str(message.sender_id),
      'text': message.text,
      'timestamp': message.created_at.isoformat(),
      'edited': True
    }
  }
  
  # Publish to Redis - listener will broadcast to all clients
  publish_to_redis_sync('chat_events', message_data)
  
  return {
    "id": message.id,
    "sender": message.sender_name,
    "sender_id": message.sender_id,
    "text": message.text,
    "timestamp": message.created_at.isoformat(),
  }


@router.delete("/messages/{message_id}")
def delete_message(
  message_id: str,
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db),
):
  """Delete a message (sender or admin)"""
  message = db.get(ChatMessage, message_id)
  if not message:
    raise HTTPException(status_code=404, detail="Message not found")
  
  # Check if user is the sender or admin
  if message.sender_id != current_user.id and current_user.role != UserRole.ADMIN:
    raise HTTPException(status_code=403, detail="You can only delete your own messages")
  
  db.delete(message)
  db.commit()
  
  # Broadcast deletion to all clients via Redis
  delete_data = {
    'event': 'message_deleted',
    'data': {'id': message_id}
  }
  publish_to_redis_sync('chat_events', delete_data)
  
  return {"success": True}


@router.delete("/messages")
def clear_all_messages(
  current_user: User = Depends(get_current_user),
  db: Session = Depends(get_db),
):
  """Clear all messages (admin only)"""
  if current_user.role != UserRole.ADMIN:
    raise HTTPException(status_code=403, detail="Only admins can clear all messages")
  
  db.query(ChatMessage).delete()
  db.commit()
  
  # Broadcast clear to all clients via Redis
  clear_data = {
    'event': 'messages_cleared',
    'data': {}
  }
  publish_to_redis_sync('chat_events', clear_data)
  
  return {"success": True}
