import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/sections';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({ username, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
        <BookOpen size={24} style={{ color: '#92400e' }} />
        <span style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '22px', fontWeight: 700, color: '#242424', letterSpacing: '-0.01em' }}>
          Interview Notes
        </span>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '16px', border: '1px solid #e8dfd0', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: '36px' }}>
        <h1 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: '24px', fontWeight: 700, color: '#1c1c1c', marginBottom: '6px', letterSpacing: '-0.02em' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: '14px', color: '#a8a29e', marginBottom: '28px' }}>
          Sign in to your notes
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Username */}
          <div>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoFocus
              required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#92400e'}
              onBlur={e => e.target.style.borderColor = '#e0dbd2'}
            />
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ ...inputStyle, paddingRight: '42px' }}
                onFocus={e => e.target.style.borderColor = '#92400e'}
                onBlur={e => e.target.style.borderColor = '#e0dbd2'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a8a29e', display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '13px', color: '#dc2626' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !username || !password}
            style={{ marginTop: '4px', padding: '11px', background: '#92400e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: isLoading || !username || !password ? 'not-allowed' : 'pointer', opacity: isLoading || !username || !password ? 0.65 : 1, transition: 'opacity 0.15s' }}
            onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#78350f'; }}
            onMouseLeave={e => e.currentTarget.style.background = '#92400e'}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b6b6b', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e0dbd2', borderRadius: '8px', fontSize: '14px', color: '#1c1c1c', background: '#fff', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' };
