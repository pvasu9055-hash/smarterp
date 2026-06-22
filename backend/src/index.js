const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const companyRoutes = require('./routes/company.routes');
const ledgerRoutes = require('./routes/ledger.routes');
const stockItemRoutes = require('./routes/stockItem.routes');
const voucherRoutes = require('./routes/voucher.routes');
const groupRoutes = require('./routes/group.routes');
const unitRoutes = require('./routes/unit.routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', app: 'SmartERP', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/ledgers', ledgerRoutes);
app.use('/api/stock-items', stockItemRoutes);
app.use('/api/vouchers', voucherRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`SmartERP backend running on port ${PORT}`);
});

module.exports = app;