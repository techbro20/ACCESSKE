import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { registerAPI } from '../../api/auth';
import { colors } from '../../theme/colors';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token');
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    inviteToken: inviteToken || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inviteToken) {
      setForm(prev => ({ ...prev, inviteToken }));
    }
  }, [inviteToken]);

  function update(k: string, v: string) {
    setForm({ ...form, [k]: v });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerAPI(form);
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
          maxWidth: '500px',
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
            Create Account
          </h2>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Join the ACCES Kenya Alumni community
          </p>
          {inviteToken && (
            <div
              style={{
                marginTop: '15px',
                padding: '10px',
                background: '#e3f2fd',
                border: `1px solid ${colors.blue}`,
                borderRadius: '6px',
                fontSize: '13px',
                color: colors.blue
              }}
            >
              ✓ Registering with invite link
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
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
                First Name
              </label>
              <input
                value={form.firstName}
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
                onChange={(e) => update('firstName', e.target.value)}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.blue;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
                placeholder="John"
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
                Last Name
              </label>
              <input
                value={form.lastName}
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
                onChange={(e) => update('lastName', e.target.value)}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = colors.blue;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
                placeholder="Doe"
              />
            </div>
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
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
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
              onChange={(e) => update('email', e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.blue;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
              placeholder="john.doe@example.com"
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
              value={form.password}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid #e0e0e0`,
                borderRadius: '6px',
                fontSize: '16px',
                transition: 'border-color 0.3s ease',
                boxSizing: 'border-box'
              }}
              onChange={(e) => update('password', e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = colors.blue;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
              placeholder="Minimum 6 characters"
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
              background: loading ? '#ccc' : colors.red,
              color: colors.beige,
              padding: '14px',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : `0 4px 6px rgba(193, 18, 31, 0.3)`
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 6px 12px rgba(193, 18, 31, 0.4)`;
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 6px rgba(193, 18, 31, 0.3)`;
              }
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Already have an account?{' '}
              <Link
                to="/login"
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
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
