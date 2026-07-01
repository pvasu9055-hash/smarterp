'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Ledger { id: string; name: string; type: string; }
interface StockItem { id: string; name: string; purchase_rate: number; gst_rate: number; unit_symbol: string; }

export default function PurchaseVoucherPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Ledger[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    party_ledger_id: '',
    voucher_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    narration: '',
    supply_type: 'intra',
  });

  const [items, setItems] = useState([
    { stock_item_id: '', item_name: '', quantity: 1, rate: 0, gst_percentage: 0, unit: 'PCS', discount_percent: 0 }
  ]);

  const company = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('selectedCompany') || '{}') : {};
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('token') : '';

  useEffect(() => {
    if (!company.id) { window.location.href = '/companies'; return; }
    fetchSuppliers();
    fetchStockItems();
  }, []);

  const fetchSuppliers = async () => {
    const res = await fetch(`http://localhost:5000/api/ledgers/${company.id}?type=supplier`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setSuppliers(data.data);
  };

  const fetchStockItems = async () => {
    const res = await fetch(`http://localhost:5000/api/stock-items/${company.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setStockItems(data.data);
  };

  const addItem = () => setItems([...items, { stock_item_id: '', item_name: '', quantity: 1, rate: 0, gst_percentage: 0, unit: 'PCS', discount_percent: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: string, value: any) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    if (field === 'stock_item_id') {
      const found = stockItems.find(s => s.id === value);
      if (found) {
        updated[i].item_name = found.name;
        updated[i].rate = Number(found.purchase_rate);
        updated[i].gst_percentage = Number(found.gst_rate);
        updated[i].unit = found.unit_symbol || 'PCS';
      }
    }
    setItems(updated);
  };

  const calcItem = (item: any) => {
    const amount = item.quantity * item.rate;
    const discount = (amount * item.discount_percent) / 100;
    const taxable = amount - discount;
    const gst = (taxable * item.gst_percentage) / 100;
    return { amount, discount, taxable, gst, total: taxable + gst };
  };

  const totals = items.reduce((acc, item) => {
    const c = calcItem(item);
    return { subtotal: acc.subtotal + c.amount, discount: acc.discount + c.discount, taxable: acc.taxable + c.taxable, gst: acc.gst + c.gst, net: acc.net + c.total };
  }, { subtotal: 0, discount: 0, taxable: 0, gst: 0, net: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.party_ledger_id) { setError('Select a supplier'); return; }
    if (items.some(i => !i.item_name)) { setError('Fill all item names'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`http://localhost:5000/api/vouchers/${company.id}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, items })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Purchase voucher ${data.data.voucher_number} created!`);
        setTimeout(() => router.push('/vouchers'), 1500);
      } else { setError(data.message); }
    } catch { setError('Failed to create voucher'); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%', background: '#0d0d14', border: '1px solid #2a2a3e',
    color: '#e2e2f0', borderRadius: '7px', padding: '9px 12px',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box' as any
  };
  const labelStyle = {
    display: 'block', fontSize: '11px', color: '#555570',
    textTransform: 'uppercase' as any, letterSpacing: '0.08em', marginBottom: '5px'
  };

  return (
    <div style={{ maxWidth: '960px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#e2e2f0', marginBottom: '4px' }}>Purchase Voucher</h1>
          <p style={{ color: '#555570', fontSize: '13px' }}>Record supplier purchases — stock increases automatically</p>
        </div>
        <button onClick={() => router.push('/vouchers')} style={{ background: 'transparent', color: '#8888a8', border: '1px solid #2a2a3e', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }}>← Back</button>
      </div>

      {success && <div style={{ background: '#0a2015', border: '1px solid #2ecc7144', borderRadius: '8px', padding: '12px 16px', color: '#2ecc71', marginBottom: '16px', fontSize: '13px' }}>{success}</div>}
      {error && <div style={{ background: '#1e0a0a', border: '1px solid #e74c3c44', borderRadius: '8px', padding: '12px 16px', color: '#e74c3c', marginBottom: '16px', fontSize: '13px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Supplier *</label>
              <select value={formData.party_ledger_id} onChange={e => setFormData({ ...formData, party_ledger_id: e.target.value })} required style={inputStyle}>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" value={formData.voucher_date} onChange={e => setFormData({ ...formData, voucher_date: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Ref / Bill No</label>
              <input value={formData.reference_number} onChange={e => setFormData({ ...formData, reference_number: e.target.value })} style={inputStyle} placeholder="Supplier bill no" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Supply Type</label>
              <select value={formData.supply_type} onChange={e => setFormData({ ...formData, supply_type: e.target.value })} style={inputStyle}>
                <option value="intra">Intra-State (CGST + SGST)</option>
                <option value="inter">Inter-State (IGST)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Narration</label>
              <input value={formData.narration} onChange={e => setFormData({ ...formData, narration: e.target.value })} style={inputStyle} placeholder="Optional note" />
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e1e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e2f0' }}>Items</span>
            <button type="button" onClick={addItem} style={{ background: '#4f7cff22', color: '#4f7cff', border: '1px solid #4f7cff44', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer' }}>+ Add Row</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
                {['Item', 'Qty', 'Rate ₹', 'Disc%', 'GST%', 'Amount ₹', ''].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: '#555570', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const c = calcItem(item);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #1a1a2a' }}>
                    <td style={{ padding: '8px 12px', minWidth: '200px' }}>
                      <select value={item.stock_item_id} onChange={e => updateItem(i, 'stock_item_id', e.target.value)} style={{ ...inputStyle, fontSize: '12px' }}>
                        <option value="">Select Item</option>
                        {stockItems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      {!item.stock_item_id && (
                        <input value={item.item_name} onChange={e => updateItem(i, 'item_name', e.target.value)} style={{ ...inputStyle, fontSize: '12px', marginTop: '4px' }} placeholder="Or type name" />
                      )}
                    </td>
                    <td style={{ padding: '8px 12px', width: '80px' }}>
                      <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} style={{ ...inputStyle, fontSize: '12px' }} min="0.01" step="0.01" />
                    </td>
                    <td style={{ padding: '8px 12px', width: '110px' }}>
                      <input type="number" value={item.rate} onChange={e => updateItem(i, 'rate', Number(e.target.value))} style={{ ...inputStyle, fontSize: '12px' }} min="0" />
                    </td>
                    <td style={{ padding: '8px 12px', width: '80px' }}>
                      <input type="number" value={item.discount_percent} onChange={e => updateItem(i, 'discount_percent', Number(e.target.value))} style={{ ...inputStyle, fontSize: '12px' }} min="0" max="100" />
                    </td>
                    <td style={{ padding: '8px 12px', width: '90px' }}>
                      <select value={item.gst_percentage} onChange={e => updateItem(i, 'gst_percentage', Number(e.target.value))} style={{ ...inputStyle, fontSize: '12px' }}>
                        {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '8px 12px', width: '110px', color: '#2ecc71', fontSize: '13px', fontWeight: '600' }}>
                      ₹{c.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '8px 12px', width: '40px' }}>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} style={{ background: 'transparent', border: 'none', color: '#e74c3c', fontSize: '16px', cursor: 'pointer' }}>×</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px' }}>
          <div />
          <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '18px' }}>
            {[
              { label: 'Subtotal', value: totals.subtotal },
              { label: 'Discount', value: -totals.discount },
              { label: 'Taxable Amount', value: totals.taxable },
              { label: 'GST', value: totals.gst },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#8888a8', fontSize: '13px' }}>{r.label}</span>
                <span style={{ color: '#e2e2f0', fontSize: '13px' }}>₹{Math.abs(r.value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #2a2a3e', paddingTop: '10px', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#e2e2f0', fontWeight: '700', fontSize: '15px' }}>Net Amount</span>
              <span style={{ color: '#4f7cff', fontWeight: '700', fontSize: '15px' }}>₹{totals.net.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => router.push('/vouchers')} style={{ background: 'transparent', color: '#8888a8', border: '1px solid #2a2a3e', borderRadius: '8px', padding: '11px 24px', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ background: loading ? '#2a2a3e' : '#4f7cff', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 32px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Saving...' : 'Save Purchase (F9)'}
          </button>
        </div>
      </form>
    </div>
  );
}