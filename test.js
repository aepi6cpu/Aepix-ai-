import http from 'http';

const data = JSON.stringify({
  prompt: 'test',
  style: 'test'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/generate-character',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('Response:', body);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
