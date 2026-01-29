const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/posts',
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Origin': 'http://localhost:5173'
  }
};

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();