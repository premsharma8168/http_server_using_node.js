const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const LOG_FILE   = path.join(__dirname, 'requests.log');
const NOTES_FILE = path.join(__dirname, 'notes.txt');

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

  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) console.error('Failed to write log:', err);
  });

  console.log(logEntry.trim());
}

// ─── Notes Handlers ─────────────────────────────────────────────────────────

// GET /add/<note>  →  append "<note>\n" to notes.txt
function handleAddNote(res, note) {
  fs.appendFile(NOTES_FILE, note + '\n', (err) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('Failed to save note.');
    }
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Note added successfully: "${note}"`);
  });
}

// GET /notes  →  return all notes (or a friendly message if empty)
function handleGetNotes(res) {
  fs.readFile(NOTES_FILE, 'utf8', (err, data) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    if (err || !data.trim()) {
      return res.end('No Notes Found');
    }
    res.end(data);
  });
}

// GET /clear  →  wipe notes.txt
function handleClear(res) {
  fs.writeFile(NOTES_FILE, '', (err) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('Failed to clear notes.');
    }
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('All Notes Deleted');
  });
}

// ─── Original Page Handlers ──────────────────────────────────────────────────
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

// ─── HTTP Server ─────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const { method, url } = req;

  logRequest(method, url);

  // ── Notes routes ──────────────────────────────────────────────────────────
  if (url.startsWith('/add/')) {
    // Everything after "/add/" is the note text
    const note = decodeURIComponent(url.slice(5));   // remove leading "/add/"
    return handleAddNote(res, note);
  }

  if (url === '/notes') return handleGetNotes(res);
  if (url === '/clear') return handleClear(res);

  // ── Static page routes ────────────────────────────────────────────────────
  switch (url) {
    case '/':        return handleHome(res);
    case '/about':   return handleAbout(res);
    case '/contact': return handleContact(res);
    default:         return handleNotFound(res, url);
  }
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Logging requests to : ${LOG_FILE}`);
  console.log(`Notes stored in     : ${NOTES_FILE}`);
});
