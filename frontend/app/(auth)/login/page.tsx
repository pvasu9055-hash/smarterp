'use client';
import { useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';

const floatingCards = [
  { top: '8%', left: '5%', label: 'Sales Today', value: '₹1,24,500', change: '+12.4%', color: '#2ecc71' },
  { top: '22%', right: '2%', label: 'GST Payable', value: '₹18,240', change: 'CGST+SGST', color: '#4f7cff' },
  { top: '52%', left: '2%', label: 'Stock Items', value: '1,847', change: '23 low stock', color: '#f39c12' },
  { top: '68%', right: '4%', label: 'Outstanding', value: '₹3,42,000', change: '14 parties', color: '#e74c3c' },
  { top: '38%', left: '8%', label: 'Purchase', value: '₹87,320', change: 'This month', color: '#9b59b6' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.login(email, password);
      if (response.success) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.location.href = '/companies';
      } else {
        setError(response.message || 'Invalid credentials');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#08080f', fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* LEFT - Animated Panel */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #0a0a18 0%, #08080f 60%, #0d0a18 100%)',
        borderRight: '1px solid #1a1a2e'
      }}>

        {/* Animated grid background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(#1a1a2e22 1px, transparent 1px), linear-gradient(90deg, #1a1a2e22 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)'
        }} />

        {/* Glow orbs */}
        <div style={{
          position: 'absolute', width: '500px', height: '500px',
          background: 'radial-gradient(circle, #4f7cff08 0%, transparent 65%)',
          top: '-100px', left: '-100px', animation: 'pulse 4s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: '400px', height: '400px',
          background: 'radial-gradient(circle, #7c4fff06 0%, transparent 65%)',
          bottom: '-50px', right: '-50px'
        }} />

        {/* Logo top left */}
        <div style={{ position: 'absolute', top: '32px', left: '40px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
          <div style={{
            width: '36px', height: '36px', background: 'linear-gradient(135deg, #4f7cff, #7c4fff)',
            borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '800', fontSize: '17px', color: '#fff'
          }}>S</div>
          <span style={{ fontWeight: '700', fontSize: '17px', color: '#e2e2f0' }}>SmartERP</span>
        </div>

        {/* Center hero text */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', textAlign: 'center',
          width: '80%', zIndex: 10
        }}>
          <div style={{
            display: 'inline-block', background: '#4f7cff14', border: '1px solid #4f7cff25',
            color: '#4f7cff', fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em',
            textTransform: 'uppercase', padding: '5px 14px', borderRadius: '20px', marginBottom: '20px'
          }}>Enterprise Accounting Platform</div>

          <h1 style={{
            fontSize: '48px', fontWeight: '800', lineHeight: '1.1',
            color: '#e2e2f0', marginBottom: '16px', letterSpacing: '-0.03em'
          }}>
            Your business.<br />
            <span style={{
              background: 'linear-gradient(135deg, #4f7cff 0%, #7c4fff 50%, #4f7cff 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Fully in control.</span>
          </h1>
          <p style={{ color: '#55557a', fontSize: '15px', lineHeight: '1.7' }}>
            Tally-inspired ERP for modern Indian businesses.<br />GST · Inventory · Billing · Accounts
          </p>
        </div>

        {/* Floating data cards */}
        <style>{`
          @keyframes floatUp { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
          @keyframes floatDown { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(8px); } }
          @keyframes fadeInUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
          @keyframes pulse { 0%,100% { opacity:0.5; transform: scale(1); } 50% { opacity:1; transform: scale(1.05); } }
          @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        `}</style>

        {floatingCards.map((card, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: card.top, left: (card as any).left, right: (card as any).right,
            background: 'rgba(14, 14, 24, 0.85)',
            backdropFilter: 'blur(12px)',
            border: `1px solid ${card.color}22`,
            borderRadius: '12px', padding: '14px 18px',
            minWidth: '170px', zIndex: 10,
            animation: `${i % 2 === 0 ? 'floatUp' : 'floatDown'} ${2.5 + i * 0.4}s ease-in-out infinite`,
            boxShadow: `0 4px 24px ${card.color}10`
          }}>
            <div style={{ fontSize: '10px', color: '#55557a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{card.label}</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#e2e2f0', marginBottom: '4px' }}>{card.value}</div>
            <div style={{ fontSize: '11px', color: card.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', background: card.color, borderRadius: '50%', display: 'inline-block', animation: 'blink 2s infinite' }} />
              {card.change}
            </div>
          </div>
        ))}

        {/* Bottom ticker */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          borderTop: '1px solid #1a1a2e', padding: '12px 40px',
          display: 'flex', gap: '32px', background: 'rgba(8,8,15,0.8)', backdropFilter: 'blur(10px)'
        }}>
          {[
            { label: 'Vouchers Today', val: '247' },
            { label: 'Active Companies', val: '3' },
            { label: 'GST Compliance', val: '100%' },
            { label: 'Uptime', val: '99.9%' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#3a3a5a' }}>{s.label}</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#4f7cff' }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT - Login Form */}
      <div style={{
        width: '460px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '60px 48px', background: '#09090f'
      }}>
        <div style={{ width: '100%' }}>
          <div style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#e2e2f0', marginBottom: '6px', letterSpacing: '-0.02em' }}>
              Welcome back
            </h2>
            <p style={{ color: '#55557a', fontSize: '14px' }}>Sign in to continue to SmartERP</p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6666aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Email Address
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" required
                style={{ width: '100%', background: '#0f0f1c', border: '1px solid #22223a', color: '#e2e2f0', borderRadius: '9px', padding: '13px 15px', fontSize: '14px', outline: 'none', transition: 'all 0.15s', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#4f7cff'; e.target.style.boxShadow = '0 0 0 3px #4f7cff15'; }}
                onBlur={e => { e.target.style.borderColor = '#22223a'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6666aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Password
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••" required
                style={{ width: '100%', background: '#0f0f1c', border: '1px solid #22223a', color: '#e2e2f0', borderRadius: '9px', padding: '13px 15px', fontSize: '14px', outline: 'none', transition: 'all 0.15s', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = '#4f7cff'; e.target.style.boxShadow = '0 0 0 3px #4f7cff15'; }}
                onBlur={e => { e.target.style.borderColor = '#22223a'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {error && (
              <div style={{ background: '#1a0808', border: '1px solid #e74c3c33', color: '#e74c3c', padding: '12px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px' }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? '#1a2040' : 'linear-gradient(135deg, #4f7cff 0%, #6a5aff 100%)',
              color: '#fff', border: 'none', borderRadius: '9px',
              fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.01em', transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 4px 20px #4f7cff30'
            }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#3a3a5a' }}>
            No account?{' '}
            <a href="/register" style={{ color: '#4f7cff', textDecoration: 'none', fontWeight: '600' }}>Create one free</a>
          </p>

          {/* Shortcuts hint */}
          <div style={{ marginTop: '40px', padding: '16px', background: '#0d0d1a', border: '1px solid #1a1a2e', borderRadius: '10px' }}>
            <p style={{ fontSize: '10px', color: '#3a3a5a', textAlign: 'center', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Shortcuts</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[['F8', 'Sales'], ['F9', 'Purchase'], ['Alt+L', 'Ledger'], ['Ctrl+Q', 'Logout'], ['F1', 'Company'], ['Alt+B', 'Balance']].map(([k, d]) => (
                <div key={k} style={{ textAlign: 'center' }}>
                  <div style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: '5px', padding: '4px 6px', fontSize: '11px', color: '#6666aa', fontFamily: 'monospace', marginBottom: '3px' }}>{k}</div>
                  <div style={{ fontSize: '10px', color: '#2a2a4a' }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}