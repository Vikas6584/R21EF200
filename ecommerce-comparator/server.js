require('dotenv').config();
const express = require('express');
const { getTopProducts } = require('./aggregator');
const app = express();
const PORT = process.env.PORT || 3000;

const VALID_CATEGORIES = [
  'Phone', 'Computer', 'TV', 'Earphone', 'Tablet', 'Charger',
  'Mouse', 'Keypad', 'Bluetooth', 'Pen Drive', 'Remote', 
  'Speaker', 'Headset', 'Laptop', 'PC'
];

const VALID_COMPANIES = ['AMZ', 'SLP', 'SNP', 'MYN', 'AZO'];

app.get('/products/companies/:company/categories/:category/products', async (req, res) => {
  const { company, category } = req.params;
  const { top, minPrice, maxPrice } = req.query;

  if (!VALID_COMPANIES.includes(company)) {
    return res.status(400).json({ error: 'Invalid company' });
  }

  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  if (!minPrice || !maxPrice || isNaN(minPrice) || isNaN(maxPrice)) {
    return res.status(400).json({ error: 'Invalid price range' });
  }

  try {
    const products = await getTopProducts(category, Number(minPrice), Number(maxPrice));
    const topProducts = top ? products.slice(0, Number(top)) : products;
    res.json(topProducts);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});