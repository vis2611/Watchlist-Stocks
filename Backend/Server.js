const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { default: YahooFinance } = require('yahoo-finance2');
const cors = require('cors');
require('dotenv').config();
const Stock = require('./models/Stock');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stocks', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const yf = new YahooFinance();

app.get('/stocks', async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch {
    res.status(500).send('Server error');
  }
});

app.post('/stocks', async (req, res) => {
  let { name } = req.body;
  if (!name || !/^[A-Z]{1,5}$/.test(name))
    return res.status(400).json({ msg: 'Stock name must be 1-5 uppercase letters.' });
  name = name.toUpperCase();

  try {
    const quote = await yf.quote(`${name}.NS`);
    if (!quote || !quote.regularMarketPrice)
      return res.status(400).json({ msg: 'Invalid stock symbol or no data found.' });

    const priceInr = quote.regularMarketPrice;
    const existing = await Stock.findOne({ name });

    if (existing) {
      existing.price = priceInr;
      existing.updatedAt = new Date();
      await existing.save();
      return res.status(200).json({ msg: 'Stock updated', stock: existing });
    }

    const newStock = new Stock({ name, price: priceInr, updatedAt: new Date() });
    await newStock.save();
    res.status(201).json({ msg: 'Stock added', stock: newStock });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.delete('/stocks/:name', async (req, res) => {
  try {
    const removed = await Stock.findOneAndDelete({ name: req.params.name.toUpperCase() });
    if (!removed) return res.status(404).json({ msg: 'Stock not found' });
    res.json({ msg: 'Stock removed' });
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

app.listen(port, () => console.log(`Backend running on port ${port}`));
