const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const faqs = [
  { terms: ['hours', 'open'], answer: 'Demo hours are Monday through Friday, 9 a.m. to 5 p.m.' },
  { terms: ['refund', 'return'], answer: 'For this demo, returns are accepted within 30 days with a receipt.' },
  { terms: ['contact', 'support'], answer: 'For this demo, contact the support team through the website contact form.' }
];

function answer(message) {
  const query = message.toLowerCase();
  const match = faqs.find(({ terms }) => terms.some(term => query.includes(term)));
  return match ? { answer: match.answer, grounded: true } : {
    answer: 'I do not have an answer in the demo FAQ. Please contact support.', grounded: false
  };
}

function createServer() {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
      return;
    }
    if (req.method === 'POST' && req.url === '/api/chat') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        if (body.length > 4096) req.destroy();
      });
      req.on('end', () => {
        try {
          const { message } = JSON.parse(body);
          if (typeof message !== 'string' || !message.trim() || message.length > 500) throw Error('invalid message');
          res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify(answer(message)));
        } catch {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'Send a nonempty message of at most 500 characters.' }));
        }
      });
      return;
    }
    res.writeHead(404).end();
  });
}

if (require.main === module) createServer().listen(process.env.PORT || 3000);
module.exports = { answer, createServer };
