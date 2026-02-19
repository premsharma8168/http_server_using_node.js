const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const LOG_FILE = path.join(__dirname, 'requests.log');

// ─── Logger ────────────────────────────────────────────────────────────────
function logRequest(method, route) {
  const now = new Date();
  const timestamp = now.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }) + ' IST';
  const logEntry = `[${timestamp}] Method: ${method} | Route: ${route}\n`;

  // Append to log file (does NOT overwrite previous records)
  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) console.error('Failed to write log:', err);
  });

  // Also print to console
  console.log(logEntry.trim());
}

// ─── Route Handlers ────────────────────────────────────────────────────────
function handleHome(res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><title>Home</title></head>
    <body>
      <h1>Welcome to the Home Page</h1>
      <p>This is the <strong>/</strong> route.</p>
      <nav>
        <a href="/about">About</a> |
        <a href="/contact">Contact</a>
      </nav>
    </body>
    </html>
  `);
}

function handleAbout(res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><title>About</title></head>
    <body>
      <h1>About Us</h1>
      <p>This is the <strong>/about</strong> route.</p>
      <nav>
        <a href="/">Home</a> |
        <a href="/contact">Contact</a>
      </nav>
    </body>
    </html>
  `);
}

function handleContact(res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><title>Contact</title></head>
    <body>
      <h1>Contact Us</h1>
      <p>This is the <strong>/contact</strong> route.</p>
      <nav>
        <a href="/">Home</a> |
        <a href="/about">About</a>
      </nav>
    </body>
    </html>
  `);
}

function handleNotFound(res, route) {
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><title>404 Not Found</title></head>
    <body>
      <h1>404 - Page Not Found</h1>
      <p>The route <strong>${route}</strong> does not exist.</p>
      <a href="/">Go Home</a>
    </body>
    </html>
  `);
}

// ─── HTTP Server ────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const { method, url } = req;

  // Log every incoming request
  logRequest(method, url);

  // Route matching
  switch (url) {
    case '/':
      handleHome(res);
      break;
    case '/about':
      handleAbout(res);
      break;
    case '/contact':
      handleContact(res);
      break;
    default:
      handleNotFound(res, url);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Logging requests to: ${LOG_FILE}`);
});
