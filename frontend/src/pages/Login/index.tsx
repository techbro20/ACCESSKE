import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAPI } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginAPI(email, password);
      login(res.user, res.token);
      // Redirect based on role
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${colors.beige} 0%, #ffffff 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          padding: '40px',
          width: '100%',
          maxWidth: '450px',
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${colors.red} 0%, ${colors.blue} 100%)`,
            borderRadius: '12px 12px 0 0'
          }}
        />

        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.blue,
            textDecoration: 'none',
            marginBottom: '30px',
            fontSize: '14px',
            fontWeight: 500,
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.red;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.blue;
          }}
        >
          ← Back to Home
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2
            style={{
              color: colors.black,
              fontSize: '32px',
              fontWeight: 700,
              marginBottom: '8px'
            }}
          >
            Welcome Back
          </h2>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Sign in to your ACCES Alumni account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: colors.black,
                fontWeight: 500,
                fontSize: '14px'
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid #e0e0e0`,
                borderRadius: '6px',
                fontSize: '16px',
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.blue;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                color: colors.black,
                fontWeight: 500,
                fontSize: '14px'
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid #e0e0e0`,
                borderRadius: '6px',
                fontSize: '16px',
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.blue;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div
              style={{
                background: '#fee',
                border: `1px solid ${colors.red}`,
                color: colors.red,
                padding: '12px',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#ccc' : colors.blue,
              color: colors.beige,
              padding: '14px',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : `0 4px 6px rgba(0, 48, 73, 0.3)`
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 12px rgba(0, 48, 73, 0.4)`;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 6px rgba(0, 48, 73, 0.3)`;
              }
            }}
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: colors.blue,
                  textDecoration: 'none',
                  fontWeight: 600
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.red;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.blue;
                }}
              >
                Register here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
