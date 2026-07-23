/**
 * Laguna Cafe - Printer Proxy Server
 * 
 * Bridges WebSocket connections from the browser to TCP thermal printers.
 * Run this on the same machine as the POS:
 *   node printer-proxy-server.js
 * 
 * Supports multiple printers. Configure IP/port in the browser settings.
 * Default port: 9090
 */

const http = require('http');
const WebSocket = require('ws');
const net = require('net');

const PROXY_PORT = process.env.PORT || 9090;

// Create HTTP server for health checks + WebSocket upgrade
const server = http.createServer(function(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const wss = new WebSocket.Server({ server: server });

console.log('🧾 Laguna Printer Proxy Server');
console.log('   HTTP port: ' + PROXY_PORT);
console.log('   WebSocket: ws://localhost:' + PROXY_PORT);
console.log('   Waiting for browser connections...');

wss.on('connection', function(ws, req) {
  var clientIp = req.socket.remoteAddress;
  console.log('   ✓ Browser connected from', clientIp);

  var tcpSocket = null;
  var targetHost = null;
  var targetPort = null;

  ws.on('message', function(data) {
    if (Buffer.isBuffer(data) || data instanceof ArrayBuffer || data instanceof Uint8Array) {
      if (tcpSocket && !tcpSocket.destroyed) {
        tcpSocket.write(Buffer.from(data));
      } else {
        console.warn('   ⚠ No TCP connection, dropping data');
      }
      return;
    }

    try {
      var msg = JSON.parse(data.toString());
      if (msg.action === 'connect') {
        targetHost = msg.host;
        targetPort = msg.port || 9100;
        console.log('   🔗 Connecting to printer at ' + targetHost + ':' + targetPort);

        if (tcpSocket) { tcpSocket.destroy(); tcpSocket = null; }

        tcpSocket = new net.Socket();
        tcpSocket.connect(targetPort, targetHost, function() {
          console.log('   ✓ Connected to printer ' + targetHost + ':' + targetPort);
          ws.send(JSON.stringify({ event: 'connected', host: targetHost, port: targetPort }));
        });

        tcpSocket.on('error', function(err) {
          console.error('   ✗ TCP error:', err.message);
          ws.send(JSON.stringify({ event: 'error', message: 'فشل الاتصال بالطابعة' }));
        });

        tcpSocket.on('close', function() {
          console.log('   ✗ TCP disconnected from ' + targetHost + ':' + targetPort);
          ws.send(JSON.stringify({ event: 'disconnected' }));
          tcpSocket = null;
        });
      } else if (msg.action === 'disconnect') {
        if (tcpSocket) { tcpSocket.destroy(); tcpSocket = null; }
      } else if (msg.action === 'ping') {
        ws.send(JSON.stringify({ event: 'pong' }));
      }
    } catch (e) {
      console.warn('   ⚠ Invalid message:', e.message);
    }
  });

  ws.on('close', function() {
    console.log('   ✗ Browser disconnected from', clientIp);
    if (tcpSocket) { tcpSocket.destroy(); tcpSocket = null; }
  });

  ws.on('error', function(err) {
    console.warn('   ⚠ WebSocket error:', err.message);
  });
});

server.listen(PROXY_PORT, function() {
  var addr = server.address();
  console.log('   Listening on port ' + addr.port);
});

console.log('');
console.log('📋 Instructions:');
console.log('   1. Keep this terminal window open');
console.log('   2. In the browser settings page, add a WiFi printer');
console.log('   3. Enter the printer IP address (e.g., 192.168.1.100)');
console.log('   4. The proxy will forward print jobs to the printer');
console.log('');
