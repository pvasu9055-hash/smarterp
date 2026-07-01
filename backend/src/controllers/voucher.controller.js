const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const { calculateGST } = require('../utils/gst');

const getVouchers = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { type, from_date, to_date, party_ledger_id } = req.query;
    let query = `SELECT v.*, l.name as party_name FROM vouchers v LEFT JOIN ledgers l ON v.party_ledger_id = l.id WHERE v.company_id = $1 AND v.is_cancelled = false`;
    const params = [companyId];
    if (type) { query += ` AND v.voucher_type = $${params.length + 1}`; params.push(type); }
    if (from_date) { query += ` AND v.date >= $${params.length + 1}`; params.push(from_date); }
    if (to_date) { query += ` AND v.date <= $${params.length + 1}`; params.push(to_date); }
    if (party_ledger_id) { query += ` AND v.party_ledger_id = $${params.length + 1}`; params.push(party_ledger_id); }
    query += ` ORDER BY v.date DESC, v.created_at DESC`;
    const result = await db.query(query, params);
    return successResponse(res, result.rows);
  } catch (err) { next(err); }
};

const getVoucher = async (req, res, next) => {
  try {
    const { companyId, id } = req.params;
    const voucher = await db.query('SELECT * FROM vouchers WHERE id=$1 AND company_id=$2', [id, companyId]);
    if (voucher.rows.length === 0) return errorResponse(res, 'Voucher not found', 404);
    const items = await db.query('SELECT * FROM voucher_items WHERE voucher_id=$1', [id]);
    return successResponse(res, { ...voucher.rows[0], items: items.rows });
  } catch (err) { next(err); }
};

const createPurchaseVoucher = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { companyId } = req.params;
    const { voucher_date, party_ledger_id, items, narration, reference_number, supply_type, place_of_supply } = req.body;

    if (!party_ledger_id || !items || items.length === 0)
      return errorResponse(res, 'Party and items are required');

    const vNumResult = await client.query('SELECT generate_voucher_number($1, $2) as vnum', [companyId, 'purchase']);
    const voucher_number = vNumResult.rows[0].vnum;

    let subtotal = 0, cgst_total = 0, sgst_total = 0, igst_total = 0;
    const processedItems = items.map(item => {
      const amount = item.quantity * item.rate;
      const discount_amount = (amount * (item.discount_percent || 0)) / 100;
      const taxable_amount = amount - discount_amount;
      const gst = calculateGST(taxable_amount, item.gst_percentage || 0, supply_type || 'intra');
      const total_amount = taxable_amount + gst.totalTax;
      subtotal += amount;
      cgst_total += gst.cgst;
      sgst_total += gst.sgst;
      igst_total += gst.igst;
      return { ...item, amount, discount_amount, taxable_amount, ...gst, total_amount };
    });

    const taxable_amount = subtotal - processedItems.reduce((s, i) => s + i.discount_amount, 0);
    const total_tax = cgst_total + sgst_total + igst_total;
    const net_amount = taxable_amount + total_tax;
    const vdate = voucher_date || new Date().toISOString().split('T')[0];

    const voucherResult = await client.query(
      `INSERT INTO vouchers (company_id, created_by, voucher_type, voucher_number, date, party_ledger_id, narration, reference_number, supply_type, place_of_supply, subtotal, taxable_amount, cgst_amount, sgst_amount, igst_amount, total_tax_amount, net_amount)
       VALUES ($1,$2,'purchase',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [companyId, req.user.id, voucher_number, vdate, party_ledger_id,
       narration, reference_number, supply_type || 'intra', place_of_supply,
       subtotal, taxable_amount, cgst_total, sgst_total, igst_total, total_tax, net_amount]
    );
    const voucher = voucherResult.rows[0];

    for (const item of processedItems) {
      await client.query(
        `INSERT INTO voucher_items (voucher_id, stock_item_id, item_name, hsn_code, quantity, unit, rate, amount, discount_percent, discount_amount, taxable_amount, gst_percentage, cgst_percent, cgst_amount, sgst_percent, sgst_amount, igst_percent, igst_amount, total_amount)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$13,$15,$16,$17,$18)`,
        [voucher.id, item.stock_item_id || null, item.item_name, item.hsn_code || null,
         item.quantity, item.unit, item.rate, item.amount,
         item.discount_percent || 0, item.discount_amount, item.taxable_amount,
         item.gst_percentage || 0, (item.gst_percentage || 0) / 2, item.cgst,
         item.sgst, (item.gst_percentage || 0), item.igst, item.total_amount]
      );

      if (item.stock_item_id) {
        const stockResult = await client.query('SELECT current_stock FROM stock_items WHERE id=$1', [item.stock_item_id]);
        const qty_before = stockResult.rows[0]?.current_stock || 0;
        const qty_after = qty_before + item.quantity;
        await client.query('UPDATE stock_items SET current_stock=$1, purchase_rate=$2 WHERE id=$3', [qty_after, item.rate, item.stock_item_id]);
      }
    }

    await client.query('COMMIT');
    return successResponse(res, voucher, 'Purchase voucher created', 201);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const createSalesVoucher = async (req, res, next) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const { companyId } = req.params;
    const { voucher_date, party_ledger_id, items, narration, reference_number, supply_type, place_of_supply } = req.body;

    if (!party_ledger_id || !items || items.length === 0)
      return errorResponse(res, 'Party and items are required');

    const vNumResult = await client.query('SELECT generate_voucher_number($1, $2) as vnum', [companyId, 'sales']);
    const voucher_number = vNumResult.rows[0].vnum;

    let subtotal = 0, cgst_total = 0, sgst_total = 0, igst_total = 0;
    const processedItems = items.map(item => {
      const amount = item.quantity * item.rate;
      const discount_amount = (amount * (item.discount_percent || 0)) / 100;
      const taxable_amount = amount - discount_amount;
      const gst = calculateGST(taxable_amount, item.gst_percentage || 0, supply_type || 'intra');
      const total_amount = taxable_amount + gst.totalTax;
      subtotal += amount;
      cgst_total += gst.cgst;
      sgst_total += gst.sgst;
      igst_total += gst.igst;
      return { ...item, amount, discount_amount, taxable_amount, ...gst, total_amount };
    });

    const taxable_amount = subtotal - processedItems.reduce((s, i) => s + i.discount_amount, 0);
    const total_tax = cgst_total + sgst_total + igst_total;
    const net_amount = taxable_amount + total_tax;
    const vdate = voucher_date || new Date().toISOString().split('T')[0];

    const voucherResult = await client.query(
      `INSERT INTO vouchers (company_id, created_by, voucher_type, voucher_number, date, party_ledger_id, narration, reference_number, supply_type, place_of_supply, subtotal, taxable_amount, cgst_amount, sgst_amount, igst_amount, total_tax_amount, net_amount)
       VALUES ($1,$2,'sales',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [companyId, req.user.id, voucher_number, vdate, party_ledger_id,
       narration, reference_number, supply_type || 'intra', place_of_supply,
       subtotal, taxable_amount, cgst_total, sgst_total, igst_total, total_tax, net_amount]
    );
    const voucher = voucherResult.rows[0];

    for (const item of processedItems) {
      await client.query(
        `INSERT INTO voucher_items (voucher_id, stock_item_id, item_name, hsn_code, quantity, unit, rate, amount, discount_percent, discount_amount, taxable_amount, gst_percentage, cgst_percent, cgst_amount, sgst_percent, sgst_amount, igst_percent, igst_amount, total_amount)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$13,$15,$16,$17,$18)`,
        [voucher.id, item.stock_item_id || null, item.item_name, item.hsn_code || null,
         item.quantity, item.unit, item.rate, item.amount,
         item.discount_percent || 0, item.discount_amount, item.taxable_amount,
         item.gst_percentage || 0, (item.gst_percentage || 0) / 2, item.cgst,
         item.sgst, (item.gst_percentage || 0), item.igst, item.total_amount]
      );

      if (item.stock_item_id) {
        const stockResult = await client.query('SELECT current_stock FROM stock_items WHERE id=$1', [item.stock_item_id]);
        const qty_before = stockResult.rows[0]?.current_stock || 0;
        const qty_after = qty_before - item.quantity;
        await client.query('UPDATE stock_items SET current_stock=$1 WHERE id=$2', [qty_after, item.stock_item_id]);
      }
    }

    await client.query('COMMIT');
    return successResponse(res, voucher, 'Sales voucher created', 201);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

const cancelVoucher = async (req, res, next) => {
  try {
    const { companyId, id } = req.params;
    const { cancellation_reason } = req.body;
    const result = await db.query(
      `UPDATE vouchers SET is_cancelled=true, cancellation_reason=$1 WHERE id=$2 AND company_id=$3 RETURNING *`,
      [cancellation_reason, id, companyId]
    );
    if (result.rows.length === 0) return errorResponse(res, 'Voucher not found', 404);
    return successResponse(res, result.rows[0], 'Voucher cancelled');
  } catch (err) { next(err); }
};

module.exports = { getVouchers, getVoucher, createSalesVoucher, createPurchaseVoucher, cancelVoucher };