'use client';
import { useEffect, useState } from 'react';

interface Group {
  id: string;
  name: string;
  type: string;
  parent_name: string;
}

const NATURE_COLORS: any = {
  asset: '#4f7cff',
  liability: '#e74c3c',
  income: '#2ecc71',
  expense: '#f39c12',
  assets: '#4f7cff',
  liabilities: '#e74c3c',
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ name: '', nature: 'assets', parent_group_id: '' });

  const company = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('selectedCompany') || '{}') : {};
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token') : '';

  useEffect(() => {
    if (!company.id) { window.location.href = '/companies'; return; }
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/groups/${company.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setGroups(data.data);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:5000/api/groups/${company.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.success) {
      fetchGroups();
      setShowForm(false);
      setFormData({ name: '', nature: 'assets', parent_group_id: '' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this group?')) return;
    await fetch(`http://localhost:5000/api/groups/${company.id}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchGroups();
  };

  const filtered = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  const inputStyle = {
    width: '100%', background: '#0d0d14', border: '1px solid #2a2a3e',
    color: '#e2e2f0', borderRadius: '7px', padding: '9px 12px',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box' as any
  };

  const labelStyle = {
    display: 'block', fontSize: '11px', color: '#555570',
    textTransform: 'uppercase' as any, letterSpacing: '0.08em', marginBottom: '6px'
  };

  if (loading) return <div style={{ color: '#555570', padding: '40px' }}>Loading groups...</div>;

  return (
    <div>
      <style>{`.grp-row:hover { background: #13131f !important; }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#e2e2f0', marginBottom: '4px' }}>Groups</h1>
          <p style={{ color: '#555570', fontSize: '13px' }}>Chart of accounts — Assets, Liabilities, Income, Expenses</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{
          background: '#4f7cff', color: '#fff', border: 'none',
          borderRadius: '8px', padding: '9px 18px', fontSize: '13px',
          fontWeight: '600', cursor: 'pointer'
        }}>+ New Group (Alt+G)</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Assets', color: '#4f7cff', bg: '#0d1533' },
          { label: 'Liabilities', color: '#e74c3c', bg: '#1e0a0a' },
          { label: 'Income', color: '#2ecc71', bg: '#0a2015' },
          { label: 'Expenses', color: '#f39c12', bg: '#1e1200' },
        ].map(s => {
          const count = groups.filter(g => g.type?.toLowerCase().includes(s.label.toLowerCase().slice(0, -1))).length;
          return (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#e2e2f0' }}>{count}</div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: '320px' }} />
      </div>

      {/* Table */}
      <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
              {['Group Name', 'Nature', 'Parent Group', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: '#555570', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#3a3a5a' }}>No groups found.</td></tr>
            ) : filtered.map(g => (
              <tr key={g.id} className="grp-row" style={{ borderBottom: '1px solid #1a1a2a', transition: 'background 0.15s' }}>
                <td style={{ padding: '12px 16px', color: '#e2e2f0', fontSize: '13px', fontWeight: '500' }}>{g.name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    background: (NATURE_COLORS[g.type] || '#555570') + '22',
                    color: NATURE_COLORS[g.type] || '#555570',
                    border: `1px solid ${NATURE_COLORS[g.type] || '#555570'}33`,
                    borderRadius: '20px', padding: '3px 10px', fontSize: '11px',
                    fontWeight: '600', textTransform: 'capitalize'
                  }}>{g.type}</span>
                </td>
                <td style={{ padding: '12px 16px', color: '#8888a8', fontSize: '12px' }}>{g.parent_name || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <button onClick={() => handleDelete(g.id)} style={{
                    background: '#2a0a0a', color: '#e74c3c', border: '1px solid #e74c3c33',
                    borderRadius: '5px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer'
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#11111a', border: '1px solid #2a2a3e', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#e2e2f0' }}>Create New Group</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: 'none', color: '#555570', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Group Name *</label>
                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={inputStyle} placeholder="e.g. Fixed Assets, Current Assets" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Nature *</label>
                <select value={formData.nature} onChange={e => setFormData({ ...formData, nature: e.target.value })} style={inputStyle}>
                  <option value="assets">Assets</option>
                  <option value="liabilities">Liabilities</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Parent Group (optional)</label>
                <select value={formData.parent_group_id} onChange={e => setFormData({ ...formData, parent_group_id: e.target.value })} style={inputStyle}>
                  <option value="">None</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ flex: 1, background: '#4f7cff', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Create Group</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, background: 'transparent', color: '#8888a8', border: '1px solid #2a2a3e', borderRadius: '8px', padding: '12px', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}