'use client';
import { useEffect, useState } from 'react';

interface StockItem {
  id: string;
  name: string;
  sku: string;
  purchase_rate: number;
  sale_rate: number;
  gst_rate: number;
  current_stock: number;
  unit_symbol: string;
  stock_group_name: string;
}

export default function StockItemsPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [editItem, setEditItem] = useState<StockItem | null>(null);
  const [formData, setFormData] = useState({
    name: '', sku: '', unit_id: '', purchase_rate: '0',
    sale_rate: '0', gst_rate: '0', opening_stock: '0', minimum_quantity: '0', hsn_code: ''
  });

  const company = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('selectedCompany') || '{}') : {};
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token') : '';

  useEffect(() => {
    if (!company.id) { window.location.href = '/companies'; return; }
    fetchItems();
    fetchUnits();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/stock-items/${company.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setItems(data.data);
    } finally { setLoading(false); }
  };

  const fetchUnits = async () => {
    const res = await fetch(`http://localhost:5000/api/units/${company.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setUnits(data.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editItem
      ? `http://localhost:5000/api/stock-items/${company.id}/${editItem.id}`
      : `http://localhost:5000/api/stock-items/${company.id}`;
    const method = editItem ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (data.success) {
      fetchItems();
      setShowForm(false);
      setEditItem(null);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await fetch(`http://localhost:5000/api/stock-items/${company.id}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchItems();
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setFormData({
      name: item.name, sku: item.sku || '', unit_id: item.unit_id || '',
      purchase_rate: item.purchase_rate || '0', sale_rate: item.sale_rate || '0',
      gst_rate: item.gst_rate || '0', opening_stock: item.opening_stock || '0',
      minimum_quantity: item.minimum_quantity || '0', hsn_code: item.hsn_code || ''
    });
    setShowForm(true);
  };

  const resetForm = () => setFormData({
    name: '', sku: '', unit_id: '', purchase_rate: '0',
    sale_rate: '0', gst_rate: '0', opening_stock: '0', minimum_quantity: '0', hsn_code: ''
  });

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const inputStyle = {
    width: '100%', background: '#0d0d14', border: '1px solid #2a2a3e',
    color: '#e2e2f0', borderRadius: '7px', padding: '9px 12px',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box' as any
  };

  const labelStyle = {
    display: 'block', fontSize: '11px', color: '#555570',
    textTransform: 'uppercase' as any, letterSpacing: '0.08em', marginBottom: '6px'
  };

  const totalItems = items.length;
  const lowStock = items.filter(i => Number(i.current_stock) <= 0).length;
  const totalValue = items.reduce((s, i) => s + (Number(i.current_stock) * Number(i.sale_rate)), 0);

  if (loading) return <div style={{ color: '#555570', padding: '40px' }}>Loading stock items...</div>;

  return (
    <div>
      <style>{`.item-row:hover { background: #13131f !important; }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#e2e2f0', marginBottom: '4px' }}>Stock Items</h1>
          <p style={{ color: '#555570', fontSize: '13px' }}>Manage inventory, pricing and GST rates</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditItem(null); resetForm(); }} style={{
          background: '#4f7cff', color: '#fff', border: 'none',
          borderRadius: '8px', padding: '9px 18px', fontSize: '13px',
          fontWeight: '600', cursor: 'pointer'
        }}>+ New Item (Alt+S)</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Total Items', value: totalItems, color: '#4f7cff', bg: '#0d1533' },
          { label: 'Low / Out of Stock', value: lowStock, color: '#e74c3c', bg: '#1e0a0a' },
          { label: 'Stock Value', value: `₹${totalValue.toLocaleString('en-IN')}`, color: '#2ecc71', bg: '#0a2015' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: '10px', padding: '18px' }}>
            <div style={{ fontSize: '11px', color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '26px', fontWeight: '700', color: '#e2e2f0' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: '320px' }} />
      </div>

      {/* Table */}
      <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
              {['Item Name', 'SKU', 'Purchase Rate', 'Sale Rate', 'GST%', 'Stock', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: '#555570', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#3a3a5a' }}>No stock items found. Create your first item →</td></tr>
            ) : filtered.map(item => (
              <tr key={item.id} className="item-row" style={{ borderBottom: '1px solid #1a1a2a', transition: 'background 0.15s' }}>
                <td style={{ padding: '12px 16px', color: '#e2e2f0', fontSize: '13px', fontWeight: '500' }}>{item.name}</td>
                <td style={{ padding: '12px 16px', color: '#8888a8', fontSize: '12px', fontFamily: 'monospace' }}>{item.sku || '—'}</td>
                <td style={{ padding: '12px 16px', color: '#8888a8', fontSize: '13px' }}>₹{Number(item.purchase_rate).toLocaleString('en-IN')}</td>
                <td style={{ padding: '12px 16px', color: '#2ecc71', fontSize: '13px', fontWeight: '600' }}>₹{Number(item.sale_rate).toLocaleString('en-IN')}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: '#4f7cff22', color: '#4f7cff', border: '1px solid #4f7cff33', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: '600' }}>
                    {item.gst_rate}%
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: Number(item.current_stock) <= 0 ? '#e74c3c' : '#e2e2f0' }}>
                  {item.current_stock} {item.unit_symbol || 'PCS'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEdit(item)} style={{ background: '#1a2a5a', color: '#4f7cff', border: '1px solid #4f7cff33', borderRadius: '5px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(item.id)} style={{ background: '#2a0a0a', color: '#e74c3c', border: '1px solid #e74c3c33', borderRadius: '5px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
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
          <div style={{ background: '#11111a', border: '1px solid #2a2a3e', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#e2e2f0' }}>{editItem ? 'Edit Item' : 'Create Stock Item'}</h2>
              <button onClick={() => { setShowForm(false); setEditItem(null); }} style={{ background: 'transparent', border: 'none', color: '#555570', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={labelStyle}>Item Name *</label>
                  <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={inputStyle} placeholder="e.g. Samsung TV 55 inch" />
                </div>
                <div>
                  <label style={labelStyle}>SKU</label>
                  <input value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} style={inputStyle} placeholder="SKU001" />
                </div>
                <div>
                  <label style={labelStyle}>HSN Code</label>
                  <input value={formData.hsn_code} onChange={e => setFormData({ ...formData, hsn_code: e.target.value })} style={inputStyle} placeholder="8528" />
                </div>
                <div>
                  <label style={labelStyle}>Unit</label>
                  <select value={formData.unit_id} onChange={e => setFormData({ ...formData, unit_id: e.target.value })} style={inputStyle}>
                    <option value="">Select Unit</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.symbol} — {u.name || u.formal_name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>GST Rate %</label>
                  <select value={formData.gst_rate} onChange={e => setFormData({ ...formData, gst_rate: e.target.value })} style={inputStyle}>
                    {['0', '5', '12', '18', '28'].map(r => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Purchase Rate ₹</label>
                  <input type="number" value={formData.purchase_rate} onChange={e => setFormData({ ...formData, purchase_rate: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Sale Rate ₹</label>
                  <input type="number" value={formData.sale_rate} onChange={e => setFormData({ ...formData, sale_rate: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Opening Stock</label>
                  <input type="number" value={formData.opening_stock} onChange={e => setFormData({ ...formData, opening_stock: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Minimum Quantity</label>
                  <input type="number" value={formData.minimum_quantity} onChange={e => setFormData({ ...formData, minimum_quantity: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" style={{ flex: 1, background: '#4f7cff', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  {editItem ? 'Update Item' : 'Create Item'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditItem(null); }} style={{ flex: 1, background: 'transparent', color: '#8888a8', border: '1px solid #2a2a3e', borderRadius: '8px', padding: '12px', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}