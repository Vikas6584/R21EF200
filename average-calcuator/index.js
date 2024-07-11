const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;

// Configuration
const WINDOW_SIZE = 10;
const SERVER_URLS = {
  'p': 'http://20.244.56.144/test/primes',
  'f': 'http://20.244.56.144/test/fibo',
  'e': 'http://20.244.56.144/test/even',
  'r': 'http://20.244.56.144/test/rand'
};

// State
let window = [];
const lock = {};
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIwNjc3MjIyLCJpYXQiOjE3MjA2NzY5MjIsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImFiOTZlYTJmLTMxODAtNGQ2NC04NGQ3LTdhMDk1MzFiNTM0YiIsInN1YiI6InZpa2FzLnZhbGx1cnVAZ21haWwuY29tIn0sImNvbXBhbnlOYW1lIjoiUkVWQSBVbml2ZXJzaXR5IiwiY2xpZW50SUQiOiJhYjk2ZWEyZi0zMTgwLTRkNjQtODRkNy03YTA5NTMxYjUzNGIiLCJjbGllbnRTZWNyZXQiOiJRZmx4ZFBlTHRhaktHRFZFIiwib3duZXJOYW1lIjoiVmlrYXMgVmFsbHVydSIsIm93bmVyRW1haWwiOiJ2aWthcy52YWxsdXJ1QGdtYWlsLmNvbSIsInJvbGxObyI6IlIyMUVGMjAwIn0.UW7i5g98RSTT2LvhGrpBLjdfcRbJfW7RBKJzjOF3SD0';  // Replace this with your actual token

// Fetch numbers from the test server
async function fetchNumbers(numberType) {
  const url = SERVER_URLS[numberType];
  if (!url) {
    console.log(`No URL found for number type: ${numberType}`);
    return [];
  }

  console.log(`Fetching numbers from: ${url}`);

  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
      timeout: 500
    });
    if (response.status === 200) {
      console.log(`Successfully fetched numbers: ${response.data.numbers}`);
      return response.data.numbers || [];
    } else {
      console.log(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error fetching numbers: ${error.message}`);
  }

  return [];
}

// Calculate the average of the current window
function calculateAverage(numbers) {
  if (numbers.length === 0) {
    return 0;
  }
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
}

app.get('/numbers/:numberType', async (req, res) => {
  const startTime = Date.now();
  const numberType = req.params.numberType;
  console.log(`Received request for number type: ${numberType}`);
  const newNumbers = await fetchNumbers(numberType);

  console.log(`Fetched new numbers: ${newNumbers}`);

  // Use a lock to ensure thread-safe updates to the window
  if (!lock[numberType]) {
    lock[numberType] = true;

    try {
      const prevWindow = [...window];

      // Add unique new numbers to the window
      newNumbers.forEach(number => {
        if (!window.includes(number)) {
          if (window.length >= WINDOW_SIZE) {
            window.shift();
          }
          window.push(number);
        }
      });

      const currentWindow = [...window];
      const avg = calculateAverage(currentWindow);

      console.log(`Previous window state: ${prevWindow}`);
      console.log(`Current window state: ${currentWindow}`);
      console.log(`Calculated average: ${avg}`);

      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > 500) {
        res.json({
          numbers: [],
          windowPrevState: prevWindow,
          windowCurrState: prevWindow,
          avg: calculateAverage(prevWindow)
        });
      } else {
        res.json({
          numbers: newNumbers,
          windowPrevState: prevWindow,
          windowCurrState: currentWindow,
          avg: avg
        });
      }
    } finally {
      lock[numberType] = false;
    }
  }
});

app.listen(port, () => {
  console.log(`Average Calculator microservice running on http://localhost:${port}`);
});