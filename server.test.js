const test = require('node:test');
const assert = require('node:assert/strict');
const { answer, createServer } = require('./server');

test('answers only from the fictional FAQ', () => {
  assert.equal(answer('What are your hours?').grounded, true);
  assert.equal(answer('What is the weather?').grounded, false);
});

test('rejects invalid API input', async () => {
  const server = createServer().listen(0);
  try {
    const port = server.address().port;
    const response = await fetch(`http://127.0.0.1:${port}/api/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message: '' }) });
    assert.equal(response.status, 400);
  } finally { server.close(); }
});
