'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Voucher {
  id: string;
  voucher_number: string;
  voucher_type: string;
  date: string;
  party_name: string;
  net_amount: number;
}

export default function VouchersPage() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  const company = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('selectedCompany') || '{}') : {};
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token') : '';

  useEffect(() => {
    if (!company.id) { window.location.href = '/companies'; return; }
    fetchVouchers();
  }, [filterType]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const url = `http://localhost:5000/api/vouchers/${company.id}${filterType ? `?type=${filterType}` : ''}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setVouchers(data.data);
    } finally { setLoading(false); }
  };

  const totalPurchase = vouchers.filter(v => v.voucher_type === 'purchase').reduce((s, v) => s + Number(v.net_amount), 0);
  const totalSales = vouchers.filter(v => v.voucher_type === 'sales').reduce((s, v) => s + Number(v.net_amount), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#e2e2f0', marginBottom: '4px' }}>Vouchers</h1>
          <p style={{ color: '#555570', fontSize: '13px' }}>Purchase and Sales transactions</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => router.push('/vouchers/purchase')} style={{ background: '#f39c1222', color: '#f39c12', border: '1px solid #f39c1244', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            + Purchase (F9)
          </button>
          <button onClick={() => router.push('/vouchers/sales')} style={{ background: '#2ecc7122', color: '#2ecc71', border: '1px solid #2ecc7144', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            + Sales (F8)
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Total Vouchers', value: vouchers.length, color: '#4f7cff', bg: '#0d1533' },
          { label: 'Total Purchase', value: `₹${totalPurchase.toLocaleString('en-IN')}`, color: '#f39c12', bg: '#1e1200' },
          { label: 'Total Sales', value: `₹${totalSales.toLocaleString('en-IN')}`, color: '#2ecc71', bg: '#0a2015' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: '10px', padding: '18px' }}>
            <div style={{ fontSize: '11px', color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '26px', fontWeight: '700', color: '#e2e2f0' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['', 'purchase', 'sales'].map(t => (
          <button key={t} onClick={() => setFilterType(t)} style={{
            background: filterType === t ? '#4f7cff' : 'transparent',
            color: filterType === t ? '#fff' : '#8888a8',
            border: `1px solid ${filterType === t ? '#4f7cff' : '#2a2a3e'}`,
            borderRadius: '6px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer'
          }}>{t === '' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
              {['Voucher No', 'Type', 'Date', 'Party', 'Net Amount'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: '#555570', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#555570' }}>Loading...</td></tr>
            ) : vouchers.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#3a3a5a' }}>No vouchers yet. Create a Purchase or Sales voucher →</td></tr>
            ) : vouchers.map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid #1a1a2a' }}>
                <td style={{ padding: '12px 16px', color: '#4f7cff', fontSize: '13px', fontWeight: '600', fontFamily: 'monospace' }}>{v.voucher_number}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: v.voucher_type === 'purchase' ? '#f39c1222' : '#2ecc7122', color: v.voucher_type === 'purchase' ? '#f39c12' : '#2ecc71', border: `1px solid ${v.voucher_type === 'purchase' ? '#f39c1244' : '#2ecc7144'}`, borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize' }}>{v.voucher_type}</span>
                </td>
                <td style={{ padding: '12px 16px', color: '#8888a8', fontSize: '13px' }}>{v.date ? new Date(v.date).toLocaleDateString('en-IN') : '—'}</td>
                <td style={{ padding: '12px 16px', color: '#e2e2f0', fontSize: '13px' }}>{v.party_name || '—'}</td>
                <td style={{ padding: '12px 16px', color: '#e2e2f0', fontSize: '13px', fontWeight: '600' }}>₹{Number(v.net_amount).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}