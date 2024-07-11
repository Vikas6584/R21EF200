const axios = require('axios');
require('dotenv').config();

const getProducts = async (category, minPrice, maxPrice) => {
  try {
    const response = await axios.get('https://api.slp.com/products', {
      params: { category, minPrice, maxPrice },
      headers: { 'Authorization': `Bearer ${process.env.POSTMAN_API_TOKEN}` }
    });
    return response.data.products.map(product => ({
      name: product.name,
      price: product.price,
      rating: product.rating,
      discount: product.discount,
      availability: product.availability,
      source: 'SLP',
    }));
  } catch (error) {
    console.error('Error fetching data from SLP:', error);
    return [];
  }
};

module.exports = { getProducts };