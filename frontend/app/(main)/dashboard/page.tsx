'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const modules = [
  { label: 'Masters', sub: 'Ledger · Group · Stock · Units', href: '/ledgers', color: '#4f7cff', icon: '📒' },
  { label: 'Transactions', sub: 'Sales · Purchase · Journal · Receipt', href: '/vouchers', color: '#2ecc71', icon: '🧾' },
  { label: 'Inventory', sub: 'Stock In · Stock Out · Transfer', href: '/stock-items', color: '#f39c12', icon: '📦' },
  { label: 'GST', sub: 'CGST · SGST · IGST · GSTR', href: '/gst', color: '#9b59b6', icon: '🏛️' },
  { label: 'Reports', sub: 'Balance Sheet · P&L · Trial Balance', href: '/reports', color: '#e74c3c', icon: '📊' },
  { label: 'Banking', sub: 'Transactions · Reconciliation', href: '/banking', color: '#1abc9c', icon: '🏦' },
];

const stats = [
  { label: 'Total Ledgers', value: '0', color: '#4f7cff', bg: '#0d1533', icon: '📒' },
  { label: 'Stock Items', value: '0', color: '#2ecc71', bg: '#0a2015', icon: '📦' },
  { label: 'Vouchers', value: '0', color: '#f39c12', bg: '#1e1200', icon: '🧾' },
  { label: 'Outstanding', value: '₹0', color: '#e74c3c', bg: '#1e0a0a', icon: '💰' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [company, setCompany] = useState<any>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const c = localStorage.getItem('selectedCompany');
    if (!c) { window.location.href = '/companies'; return; }
    setCompany(JSON.parse(c));
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!company) return null;

  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes floatDown { 0%,100%{transform:translateY(0)} 50%{transform:translateY(6px)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes shimmer { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .mod-card:hover { border-color: var(--c) !important; background: #14141f !important; transform: translateY(-2px); }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important; }
      `}</style>

      {/* Hero section */}
      <div style={{
        position: 'relative', borderRadius: '16px', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0d0d1f 0%, #0a0a18 50%, #0f0d1f 100%)',
        border: '1px solid #1e1e2e', padding: '40px 40px 36px', marginBottom: '24px'
      }}>
        {/* Grid bg */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(#1a1a2e18 1px, transparent 1px), linear-gradient(90deg, #1a1a2e18 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse at 30% 50%, black 20%, transparent 70%)'
        }} />
        {/* Glow */}
        <div style={{
          position: 'absolute', width: '300px', height: '300px',
          background: 'radial-gradient(circle, #4f7cff0a 0%, transparent 70%)',
          top: '-50px', left: '-50px', pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              display: 'inline-block', background: '#4f7cff14', border: '1px solid #4f7cff25',
              color: '#4f7cff', fontSize: '10px', fontWeight: '600', letterSpacing: '0.12em',
              textTransform: 'uppercase', padding: '4px 12px', borderRadius: '20px', marginBottom: '16px'
            }}>Gateway of SmartERP</div>
            <h1 style={{
              fontSize: '36px', fontWeight: '800', lineHeight: '1.1',
              color: '#e2e2f0', marginBottom: '8px', letterSpacing: '-0.02em'
            }}>
              {company.name}
            </h1>
            <p style={{ color: '#55557a', fontSize: '14px' }}>
              Financial Year 2024-25 &nbsp;·&nbsp; {time.toLocaleTimeString('en-IN')}
            </p>
          </div>

          {/* Live ticker */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { label: 'Status', val: 'Active', color: '#2ecc71' },
              { label: 'GST', val: 'Filed', color: '#4f7cff' },
              { label: 'Sync', val: 'Live', color: '#f39c12' },
            ].map(s => (
              <div key={s.label} style={{
                background: '#11111f', border: `1px solid ${s.color}22`,
                borderRadius: '10px', padding: '12px 16px', textAlign: 'center',
                animation: 'floatUp 3s ease-in-out infinite'
              }}>
                <div style={{ fontSize: '10px', color: '#55557a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{s.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color, animation: 'blink 2s infinite' }} />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: s.color }}>{s.val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
        {stats.map((s, i) => (
          <div key={s.label} className="stat-card" style={{
            background: s.bg, border: `1px solid ${s.color}18`,
            borderRadius: '12px', padding: '22px',
            animation: `floatUp ${2.5 + i * 0.3}s ease-in-out infinite`,
            transition: 'all 0.2s', cursor: 'default'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>{s.label}</div>
              <span style={{ fontSize: '18px' }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#e2e2f0', letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: s.color, animation: 'blink 2s infinite' }} />
              <span style={{ fontSize: '11px', color: '#3a3a5a' }}>Updated live</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modules */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: '700', color: '#55557a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Modules</h2>
          <span style={{ fontSize: '11px', color: '#3a3a5a' }}>Click to open · Use keyboard shortcuts</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
          {modules.map((m) => (
            <div key={m.label} className="mod-card" onClick={() => router.push(m.href)}
              style={{
                background: '#0f0f1a', border: '1px solid #1e1e2e',
                borderRadius: '12px', padding: '22px', cursor: 'pointer',
                transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                '--c': m.color + '55'
              } as any}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '3px', height: '100%',
                background: `linear-gradient(180deg, ${m.color}, ${m.color}44)`,
                borderRadius: '3px 0 0 3px'
              }} />
              <div style={{ paddingLeft: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{m.icon}</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#e2e2f0' }}>{m.label}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#55557a', lineHeight: '1.5' }}>{m.sub}</div>
              </div>
              <div style={{
                position: 'absolute', bottom: '14px', right: '16px',
                fontSize: '18px', color: m.color + '33', fontWeight: '800'
              }}>→</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom shortcuts bar */}
      <div style={{
        marginTop: '24px', padding: '16px 24px', background: '#0d0d1a',
        border: '1px solid #1a1a2e', borderRadius: '12px',
        display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '11px', color: '#3a3a5a', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Keys</span>
        {[['F8','Sales'],['F9','Purchase'],['Alt+L','Ledger'],['Alt+G','Group'],['Ctrl+Q','Logout'],['F1','Company']].map(([k,d]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ background: '#13131f', border: '1px solid #2a2a3e', borderRadius: '4px', padding: '2px 7px', fontSize: '11px', color: '#6666aa', fontFamily: 'monospace' }}>{k}</span>
            <span style={{ fontSize: '11px', color: '#3a3a5a' }}>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}