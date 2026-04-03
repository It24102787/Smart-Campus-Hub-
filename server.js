'use strict';

const express = require('express');
require('dotenv').config();

const { connectDB } = require('./db');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'smart-campus-hub-api',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (_req, res) => {
  res.status(200).json({ message: 'API is running' });
});

const port = Number.parseInt(process.env.PORT, 10) || 5000;
let httpServer;

async function start() {
  try {
    await connectDB();

    httpServer = app.listen(port, () => {
      console.info(`[server] Listening on port ${port}`);
    });
  } catch (error) {
    console.error('[server] Startup failed:', error.message);
    process.exitCode = 1;
    process.exit();
  }
}

async function shutdown(signal) {
  console.info(`[server] ${signal} received, shutting down`);

  try {
    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => (error ? reject(error) : resolve()));
      });
    }

    const mongoose = require('mongoose');
    await mongoose.connection.close(false);
    console.info('[server] Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('[server] Graceful shutdown failed:', error.message);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();

module.exports = app;
