'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Ledger {
  id: string;
  name: string;
  ledger_type: string;
  group_name: string;
  current_balance: number;
  current_balance_type: string;
  phone: string;
  gstin: string;
  city: string;
}

interface Group {
  id: string;
  name: string;
  nature: string;
}

const LEDGER_TYPES = [
  { value: 'customer', label: 'Customer' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'bank', label: 'Bank' },
  { value: 'cash', label: 'Cash' },
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

const TYPE_COLORS: any = {
  customer: '#4f7cff',
  supplier: '#2ecc71',
  bank: '#f39c12',
  cash: '#1abc9c',
  expense: '#e74c3c',
  income: '#9b59b6',
};

export default function LedgersPage() {
  const router = useRouter();
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [editLedger, setEditLedger] = useState<Ledger | null>(null);
  const [formData, setFormData] = useState({
    name: '', ledger_type: 'customer', group_id: '',
    phone: '', email: '', address: '', city: '', state: '',
    pincode: '', gstin: '', pan: '', opening_balance: '0',
    opening_balance_type: 'Dr', gst_registration_type: 'regular'
  });

  const company = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('selectedCompany') || '{}')
    : {};
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token') : '';

  useEffect(() => {
    if (!company.id) { window.location.href = '/companies'; return; }
    fetchLedgers();
    fetchGroups();
  }, []);

  const fetchLedgers = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/ledgers/${company.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setLedgers(data.data);
    } finally { setLoading(false); }
  };

  const fetchGroups = async () => {
    const res = await fetch(`http://localhost:5000/api/groups/${company.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setGroups(data.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editLedger
      ? `http://localhost:5000/api/ledgers/${company.id}/${editLedger.id}`
      : `http://localhost:5000/api/ledgers/${company.id}`;
    const method = editLedger ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.success) {
      fetchLedgers();
      setShowForm(false);
      setEditLedger(null);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ledger?')) return;
    await fetch(`http://localhost:5000/api/ledgers/${company.id}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchLedgers();
  };

  const handleEdit = (ledger: any) => {
    setEditLedger(ledger);
    setFormData({
      name: ledger.name, ledger_type: ledger.ledger_type, group_id: ledger.group_id,
      phone: ledger.phone || '', email: ledger.email || '', address: ledger.address || '',
      city: ledger.city || '', state: ledger.state || '', pincode: ledger.pincode || '',
      gstin: ledger.gstin || '', pan: ledger.pan || '',
      opening_balance: ledger.opening_balance || '0',
      opening_balance_type: ledger.opening_balance_type || 'Dr',
      gst_registration_type: ledger.gst_registration_type || 'regular'
    });
    setShowForm(true);
  };

  const resetForm = () => setFormData({
    name: '', ledger_type: 'customer', group_id: '',
    phone: '', email: '', address: '', city: '', state: '',
    pincode: '', gstin: '', pan: '', opening_balance: '0',
    opening_balance_type: 'Dr', gst_registration_type: 'regular'
  });

  const filtered = ledgers.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterType === '' || l.ledger_type === filterType)
  );

  const inputStyle = {
    width: '100%', background: '#0d0d14', border: '1px solid #2a2a3e',
    color: '#e2e2f0', borderRadius: '7px', padding: '9px 12px',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box' as any
  };

  const labelStyle = {
    display: 'block', fontSize: '11px', color: '#555570',
    textTransform: 'uppercase' as any, letterSpacing: '0.08em', marginBottom: '6px'
  };

  if (loading) return <div style={{ color: '#555570', padding: '40px' }}>Loading ledgers...</div>;

  return (
    <div>
      <style>{`
        .ledger-row:hover { background: #13131f !important; }
        .action-btn:hover { opacity: 1 !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#e2e2f0', marginBottom: '4px' }}>Ledgers</h1>
          <p style={{ color: '#555570', fontSize: '13px' }}>Manage customers, suppliers, banks and expense accounts</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditLedger(null); resetForm(); }} style={{
          background: '#4f7cff', color: '#fff', border: 'none',
          borderRadius: '8px', padding: '9px 18px', fontSize: '13px',
          fontWeight: '600', cursor: 'pointer'
        }}>+ New Ledger (Alt+L)</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '10px', marginBottom: '20px' }}>
        {LEDGER_TYPES.map(t => {
          const count = ledgers.filter(l => l.ledger_type === t.value).length;
          return (
            <div key={t.value} onClick={() => setFilterType(filterType === t.value ? '' : t.value)}
              style={{
                background: filterType === t.value ? TYPE_COLORS[t.value] + '22' : '#11111a',
                border: `1px solid ${filterType === t.value ? TYPE_COLORS[t.value] + '44' : '#1e1e2e'}`,
                borderRadius: '10px', padding: '14px', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center'
              }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: TYPE_COLORS[t.value] }}>{count}</div>
              <div style={{ fontSize: '11px', color: '#555570', marginTop: '2px' }}>{t.label}</div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          placeholder="Search ledgers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: '320px' }}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
              {['Ledger Name', 'Type', 'Group', 'Phone', 'GSTIN', 'Balance', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: '#555570', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#3a3a5a', fontSize: '14px' }}>
                No ledgers found. Create your first ledger →
              </td></tr>
            ) : filtered.map(l => (
              <tr key={l.id} className="ledger-row" style={{ borderBottom: '1px solid #1a1a2a', transition: 'background 0.15s' }}>
                <td style={{ padding: '12px 16px', color: '#e2e2f0', fontSize: '13px', fontWeight: '500' }}>{l.name}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: TYPE_COLORS[l.ledger_type] + '22', color: TYPE_COLORS[l.ledger_type], border: `1px solid ${TYPE_COLORS[l.ledger_type]}33`, borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize' }}>
                    {l.ledger_type}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#8888a8', fontSize: '12px' }}>{l.group_name}</td>
                <td style={{ padding: '12px 16px', color: '#8888a8', fontSize: '12px' }}>{l.phone || '—'}</td>
                <td style={{ padding: '12px 16px', color: '#8888a8', fontSize: '12px', fontFamily: 'monospace' }}>{l.gstin || '—'}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: l.current_balance_type === 'Dr' ? '#4f7cff' : '#2ecc71' }}>
                  ₹{Number(l.current_balance || 0).toLocaleString('en-IN')} {l.current_balance_type}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="action-btn" onClick={() => handleEdit(l)} style={{ background: '#1a2a5a', color: '#4f7cff', border: '1px solid #4f7cff33', borderRadius: '5px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', opacity: 0.8 }}>Edit</button>
                    <button className="action-btn" onClick={() => handleDelete(l.id)} style={{ background: '#2a0a0a', color: '#e74c3c', border: '1px solid #e74c3c33', borderRadius: '5px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', opacity: 0.8 }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#11111a', border: '1px solid #2a2a3e', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#e2e2f0' }}>
                {editLedger ? 'Edit Ledger' : 'Create New Ledger'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditLedger(null); }} style={{ background: 'transparent', border: 'none', color: '#555570', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Ledger Name *</label>
                  <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={inputStyle} placeholder="e.g. Raj Kumar, State Bank" />
                </div>

                <div>
                  <label style={labelStyle}>Ledger Type *</label>
                  <select value={formData.ledger_type} onChange={e => setFormData({ ...formData, ledger_type: e.target.value })} style={inputStyle}>
                    {LEDGER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Group *</label>
                  <select value={formData.group_id} onChange={e => setFormData({ ...formData, group_id: e.target.value })} required style={inputStyle}>
                    <option value="">Select Group</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Phone</label>
                  <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} placeholder="Mobile number" />
                </div>

                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} placeholder="email@example.com" />
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Address</label>
                  <input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={inputStyle} placeholder="Street address" />
                </div>

                <div>
                  <label style={labelStyle}>City</label>
                  <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} style={inputStyle} placeholder="City" />
                </div>

                <div>
                  <label style={labelStyle}>State</label>
                  <input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} style={inputStyle} placeholder="State" />
                </div>

                <div>
                  <label style={labelStyle}>GSTIN</label>
                  <input value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })} style={inputStyle} placeholder="22AAAAA0000A1Z5" />
                </div>

                <div>
                  <label style={labelStyle}>PAN</label>
                  <input value={formData.pan} onChange={e => setFormData({ ...formData, pan: e.target.value })} style={inputStyle} placeholder="AAAAA0000A" />
                </div>

                <div>
                  <label style={labelStyle}>Opening Balance</label>
                  <input type="number" value={formData.opening_balance} onChange={e => setFormData({ ...formData, opening_balance: e.target.value })} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Balance Type</label>
                  <select value={formData.opening_balance_type} onChange={e => setFormData({ ...formData, opening_balance_type: e.target.value })} style={inputStyle}>
                    <option value="Dr">Dr (Debit)</option>
                    <option value="Cr">Cr (Credit)</option>
                  </select>
                </div>

              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" style={{ flex: 1, background: '#4f7cff', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  {editLedger ? 'Update Ledger' : 'Create Ledger'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditLedger(null); }} style={{ flex: 1, background: 'transparent', color: '#8888a8', border: '1px solid #2a2a3e', borderRadius: '8px', padding: '12px', fontSize: '14px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}