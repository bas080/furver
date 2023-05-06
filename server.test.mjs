import tap from 'tap';
import { spawn } from 'node:child_process';

const { test } = tap;

let serverProcess;

tap.before(async () => {
  // Start the server in a child process
  serverProcess = spawn('node', ['./cli.mjs', './example/api.mjs']);

  // Wait for the server to start listening on the port
  await new Promise((resolve) => serverProcess.stderr.once('data', resolve));
});

tap.teardown(() => serverProcess.kill());

const port = 3000;
const apiUri = `http://localhost:${port}`;

test('Returns 400 when receiving malformed JSON data', async (t) => {
  // Send a POST request with malformed JSON data
  const res = await fetch(apiUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{invalid-json}',
  });

  // Verify the response status code
  t.equal(res.status, 400);

  // Stop the server
});

test('Returns 500 status', async (t) => {
  try {
    const res = await fetch(apiUri, {
      method: 'POST',
      body: JSON.stringify([]),
      headers: { 'Content-Type': 'application/json' },
    });
    t.equal(res.status, 500, 'Status should be 500');
    t.end();
  } catch (error) {
    t.error(error);
  }
});

test('Test 200 status', async (t) => {
  const requestData = [[['add', 1, 2]]];
  const expectedResponse = [3];

  // Send a POST request with valid JSON data
  const res = await fetch(apiUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });

  // Verify the response status code
  t.equal(res.status, 200);

  // Verify the response body
  const responseBody = await res.json();
  t.same(responseBody, expectedResponse);
});
