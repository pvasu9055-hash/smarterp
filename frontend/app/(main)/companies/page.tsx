'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { companyAPI } from '@/lib/api';

interface Company { id: string; name: string; gstin: string; city: string; state: string; }

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', city: '', state: '', pincode: '', gstin: '' });

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    try {
      const r = await companyAPI.getCompanies(token);
      if (r.success) setCompanies(r.data);
    } finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;
    const r = await companyAPI.createCompany(token, formData);
    if (r.success) {
      setCompanies([...companies, r.data]);
      setFormData({ name: '', address: '', city: '', state: '', pincode: '', gstin: '' });
      setShowForm(false);
    }
  };

  const handleSelect = (company: Company) => {
    localStorage.setItem('selectedCompany', JSON.stringify(company));
    window.location.href = '/dashboard';
  };

  if (loading) return <div style={{ color: '#555570' }}>Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#e2e2f0', marginBottom: '4px' }}>Companies</h1>
          <p style={{ color: '#555570', fontSize: '13px' }}>Select a company to start working · Max 5 companies</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: '#4f7cff', color: '#fff', border: 'none',
          borderRadius: '8px', padding: '9px 18px', fontSize: '13px',
          fontWeight: '600', cursor: 'pointer'
        }}>+ New Company</button>
      </div>

      {/* Company Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {companies.map((c) => (
          <div key={c.id} style={{
            background: '#11111a', border: '1px solid #1e1e2e',
            borderRadius: '12px', padding: '24px', cursor: 'pointer',
            transition: 'all 0.15s'
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4f7cff44'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1e1e2e'; }}
          >
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f7cff22, #7c4fff22)',
              border: '1px solid #4f7cff33',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: '700', color: '#4f7cff',
              marginBottom: '16px'
            }}>{c.name[0]}</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#e2e2f0', marginBottom: '6px' }}>{c.name}</div>
            <div style={{ fontSize: '12px', color: '#555570', marginBottom: '4px' }}>{c.city}{c.state ? `, ${c.state}` : ''}</div>
            {c.gstin && <div style={{ fontSize: '11px', color: '#3a3a5a', marginBottom: '16px', fontFamily: 'monospace' }}>GSTIN: {c.gstin}</div>}
            <button onClick={() => handleSelect(c)} style={{
              width: '100%', background: '#1a2a5a', border: '1px solid #4f7cff44',
              color: '#4f7cff', borderRadius: '7px', padding: '8px',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s'
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#4f7cff'; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#1a2a5a'; (e.currentTarget as HTMLElement).style.color = '#4f7cff'; }}
            >Open Company →</button>
          </div>
        ))}
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ background: '#11111a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '28px', maxWidth: '560px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#e2e2f0', marginBottom: '20px' }}>Create New Company</h2>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              {[
                { label: 'Company Name *', key: 'name', full: true },
                { label: 'Address', key: 'address', full: true },
                { label: 'City', key: 'city' },
                { label: 'State', key: 'state' },
                { label: 'Pincode', key: 'pincode' },
                { label: 'GSTIN', key: 'gstin' },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.full ? '1 / -1' : 'auto' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#555570', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{f.label}</label>
                  <input
                    value={(formData as any)[f.key]}
                    onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                    required={f.key === 'name'}
                    style={{ background: '#0d0d14', border: '1px solid #2a2a3e', color: '#e2e2f0', borderRadius: '7px', padding: '9px 12px', width: '100%', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="submit" style={{ flex: 1, background: '#4f7cff', color: '#fff', border: 'none', borderRadius: '7px', padding: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Create Company</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, background: 'transparent', color: '#8888a8', border: '1px solid #2a2a3e', borderRadius: '7px', padding: '10px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}