'use client';
import { useState } from 'react';
import { authAPI } from '@/lib/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const response = await authAPI.register({ name, email, password });
      if (response.success) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.location.href = '/companies';
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#08080f', fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* LEFT PANEL */}
      <div style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(160deg, #0a0a18 0%, #08080f 60%, #0d0a18 100%)',
        borderRight: '1px solid #1a1a2e'
      }}>
        <style>{`
          @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          @keyframes floatDown { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        `}</style>

        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(#1a1a2e22 1px, transparent 1px), linear-gradient(90deg, #1a1a2e22 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)'
        }} />

        {/* Glow orbs */}
        <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, #4f7cff08 0%, transparent 65%)', top: '-100px', left: '-100px' }} />
        <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, #7c4fff06 0%, transparent 65%)', bottom: '-50px', right: '-50px' }} />

        {/* Logo */}
        <div style={{ position: 'absolute', top: '32px', left: '40px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #4f7cff, #7c4fff)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '17px', color: '#fff' }}>S</div>
          <span style={{ fontWeight: '700', fontSize: '17px', color: '#e2e2f0' }}>SmartERP</span>
        </div>

        {/* Center hero */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '80%', zIndex: 10 }}>
          <div style={{ display: 'inline-block', background: '#2ecc7114', border: '1px solid #2ecc7125', color: '#2ecc71', fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '20px', marginBottom: '20px' }}>
            Join SmartERP Today
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1.1', color: '#e2e2f0', marginBottom: '16px', letterSpacing: '-0.03em' }}>
            Start managing<br />
            <span style={{ background: 'linear-gradient(135deg, #2ecc71 0%, #4f7cff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              smarter today.
            </span>
          </h1>
          <p style={{ color: '#55557a', fontSize: '15px', lineHeight: '1.7' }}>
            Set up your account in seconds.<br />Manage up to 5 companies for free.
          </p>

          {/* Benefits */}
          <div style={{ marginTop: '40px', display: 'inline-flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
            {[
              { icon: '✓', text: 'Full GST billing & invoicing', color: '#2ecc71' },
              { icon: '✓', text: 'Inventory & stock management', color: '#4f7cff' },
              { icon: '✓', text: 'Balance sheet & P&L reports', color: '#f39c12' },
              { icon: '✓', text: 'Keyboard-first workflow like Tally', color: '#9b59b6' },
            ].map(b => (
              <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: b.color + '22', border: `1px solid ${b.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: b.color, fontWeight: '700' }}>{b.icon}</div>
                <span style={{ fontSize: '13px', color: '#8888a8' }}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating cards */}
        {[
          { top: '10%', left: '4%', label: 'Companies', value: 'Up to 5', color: '#4f7cff', anim: 'floatUp 3s ease-in-out infinite' },
          { top: '20%', right: '3%', label: 'GST Ready', value: '100%', color: '#2ecc71', anim: 'floatDown 2.5s ease-in-out infinite' },
          { top: '70%', left: '3%', label: 'Voucher Types', value: '8 Types', color: '#f39c12', anim: 'floatUp 3.5s ease-in-out infinite' },
          { top: '75%', right: '4%', label: 'Reports', value: '12+', color: '#9b59b6', anim: 'floatDown 3s ease-in-out infinite' },
        ].map((card, i) => (
          <div key={i} style={{
            position: 'absolute', top: card.top, left: (card as any).left, right: (card as any).right,
            background: 'rgba(14,14,24,0.85)', backdropFilter: 'blur(12px)',
            border: `1px solid ${card.color}22`, borderRadius: '12px', padding: '14px 18px',
            minWidth: '150px', zIndex: 10, animation: card.anim,
            boxShadow: `0 4px 24px ${card.color}10`
          }}>
            <div style={{ fontSize: '10px', color: '#55557a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{card.label}</div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#e2e2f0', marginBottom: '4px' }}>{card.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', background: card.color, borderRadius: '50%', display: 'inline-block', animation: 'blink 2s infinite' }} />
              <span style={{ fontSize: '11px', color: card.color }}>Available</span>
            </div>
          </div>
        ))}

        {/* Bottom ticker */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderTop: '1px solid #1a1a2e', padding: '12px 40px', display: 'flex', gap: '32px', background: 'rgba(8,8,15,0.8)', backdropFilter: 'blur(10px)' }}>
          {[['Free Forever', '✓'], ['No Credit Card', '✓'], ['GST Compliant', '✓'], ['Indian Business', '✓']].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#2ecc71' }}>{v}</span>
              <span style={{ fontSize: '11px', color: '#3a3a5a' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width: '460px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', background: '#09090f' }}>
        <div style={{ width: '100%' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#e2e2f0', marginBottom: '6px', letterSpacing: '-0.02em' }}>Create account</h2>
            <p style={{ color: '#55557a', fontSize: '14px' }}>Set up your SmartERP account in seconds</p>
          </div>

          <form onSubmit={handleRegister}>
            {[
              { label: 'Full Name', type: 'text', val: name, set: setName, placeholder: 'Your full name' },
              { label: 'Email Address', type: 'email', val: email, set: setEmail, placeholder: 'you@company.com' },
              { label: 'Password', type: 'password', val: password, set: setPassword, placeholder: '••••••••••' },
              { label: 'Confirm Password', type: 'password', val: confirmPassword, set: setConfirmPassword, placeholder: '••••••••••' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6666aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{f.label}</label>
                <input
                  type={f.type} value={f.val} onChange={e => f.set(e.target.value)}
                  placeholder={f.placeholder} required
                  style={{ width: '100%', background: '#0f0f1c', border: '1px solid #22223a', color: '#e2e2f0', borderRadius: '9px', padding: '13px 15px', fontSize: '14px', outline: 'none', transition: 'all 0.15s', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = '#4f7cff'; e.target.style.boxShadow = '0 0 0 3px #4f7cff15'; }}
                  onBlur={e => { e.target.style.borderColor = '#22223a'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            ))}

            {error && (
              <div style={{ background: '#1a0808', border: '1px solid #e74c3c33', color: '#e74c3c', padding: '12px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px' }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? '#1a2040' : 'linear-gradient(135deg, #2ecc71 0%, #4f7cff 100%)',
              color: '#fff', border: 'none', borderRadius: '9px',
              fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 20px #2ecc7130', marginTop: '8px'
            }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#3a3a5a' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#4f7cff', textDecoration: 'none', fontWeight: '600' }}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}