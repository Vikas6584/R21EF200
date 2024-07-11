const ecommerceAMZ = require('./ecommerceAMZ');
const ecommerceSLP = require('./ecommerceSLP');
const ecommerceSNP = require('./ecommerceSNP');
const ecommerceMYN = require('./ecommerceMYN');
const ecommerceAZO = require('./ecommerceAZO');

const VALID_CATEGORIES = [
  'Phone', 'Computer', 'TV', 'Earphone', 'Tablet', 'Charger',
  'Mouse', 'Keypad', 'Bluetooth', 'Pen Drive', 'Remote', 
  'Speaker', 'Headset', 'Laptop', 'PC'
];

const VALID_COMPANIES = ['AMZ', 'SLP', 'SNP', 'MYN', 'AZO'];

const getTopProducts = async (category, minPrice, maxPrice) => {
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error('Invalid category');
  }

  const results = await Promise.all([
    ecommerceAMZ.getProducts(category, minPrice, maxPrice),
    ecommerceSLP.getProducts(category, minPrice, maxPrice),
    ecommerceSNP.getProducts(category, minPrice, maxPrice),
    ecommerceMYN.getProducts(category, minPrice, maxPrice),
    ecommerceAZO.getProducts(category, minPrice, maxPrice),
  ]);

  // Flatten the results array
  const allProducts = results.flat();

  // Sort by price (or any other criteria)
  return allProducts.sort((a, b) => a.price - b.price);
};

module.exports = { getTopProducts };