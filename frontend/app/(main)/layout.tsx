'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const menuItems = [
  { icon: '⊞', label: 'Dashboard', href: '/dashboard' },
  { icon: '📒', label: 'Ledgers', href: '/ledgers' },
  { icon: '👥', label: 'Groups', href: '/groups' },
  { icon: '📦', label: 'Stock Items', href: '/stock-items' },
  { icon: '🧾', label: 'Vouchers', href: '/vouchers' },
  { icon: '🛒', label: 'Purchase', href: '/purchase' },
  { icon: '💰', label: 'Sales', href: '/sales' },
  { icon: '📊', label: 'Reports', href: '/reports' },
  { icon: '🏛️', label: 'GST', href: '/gst' },
  { icon: '🏢', label: 'Companies', href: '/companies' },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [company, setCompany] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const c = localStorage.getItem('selectedCompany');
    const u = localStorage.getItem('user');
    if (c) setCompany(JSON.parse(c));
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d0d14', color: '#e2e2f0', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      
      {/* Sidebar */}
      <div style={{
        width: '220px', minHeight: '100vh', background: '#0a0a10',
        borderRight: '1px solid #1e1e2e', display: 'flex', flexDirection: 'column',
        position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1e1e2e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', background: 'linear-gradient(135deg, #4f7cff, #7c4fff)',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: '700', color: '#fff'
            }}>S</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#fff' }}>SmartERP</div>
              <div style={{ fontSize: '10px', color: '#555570', letterSpacing: '0.05em' }}>ENTERPRISE</div>
            </div>
          </div>
        </div>

        {/* Company */}
        {company && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e1e2e', background: '#0f0f1a' }}>
            <div style={{ fontSize: '10px', color: '#555570', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Active Company</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#a0a0c0' }}>{company.name}</div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const active = pathname === item.href;
            return (
              <div
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '7px', marginBottom: '2px',
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: active ? '#1a1a2e' : 'transparent',
                  color: active ? '#4f7cff' : '#8888a8',
                  borderLeft: active ? '2px solid #4f7cff' : '2px solid transparent',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = '#13131f'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '15px' }}>{item.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: active ? '600' : '400' }}>{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1e1e2e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f7cff, #7c4fff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: '700', color: '#fff'
            }}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#c0c0d8' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: '10px', color: '#555570' }}>{user?.email || ''}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', background: 'transparent', border: '1px solid #2a2a3e',
            color: '#8888a8', borderRadius: '6px', padding: '7px',
            fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s'
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e74c3c'; (e.currentTarget as HTMLElement).style.color = '#e74c3c'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2a2a3e'; (e.currentTarget as HTMLElement).style.color = '#8888a8'; }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{
          height: '52px', background: '#0a0a10', borderBottom: '1px solid #1e1e2e',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 50
        }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '12px', color: '#555570' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#555570', background: '#13131f', border: '1px solid #1e1e2e', padding: '4px 10px', borderRadius: '4px' }}>
              FY 2024-25
            </span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}