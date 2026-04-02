'use strict';

const dns = require('dns');
const mongoose = require('mongoose');
const { URL } = require('url');
require('dotenv').config();

const DEFAULT_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1500;

function toInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function maskMongoUri(uri) {
  if (!uri || typeof uri !== 'string') return '<empty>';

  try {
    const parsed = new URL(uri);
    if (parsed.username) parsed.username = '***';
    if (parsed.password) parsed.password = '***';
    return parsed.toString();
  } catch {
    return uri.replace(/:\/\/([^:]+):([^@]+)@/, '://***:***@');
  }
}

function classifyMongoError(error) {
  const message = `${error?.name || ''} ${error?.message || ''}`.toLowerCase();

  if (message.includes('querysrv') || message.includes('enotfound') || message.includes('econnrefused')) {
    return 'dns_or_network';
  }

  if (message.includes('authentication failed')) {
    return 'auth';
  }

  if (message.includes('timed out') || message.includes('server selection timed out')) {
    return 'timeout';
  }

  return 'unknown';
}

function isSrvUri(uri) {
  return typeof uri === 'string' && uri.startsWith('mongodb+srv://');
}

function buildFallbackUriFromParts() {
  const host = process.env.MONGODB_HOST || '127.0.0.1';
  const port = process.env.MONGODB_PORT || '27017';
  const db = process.env.MONGODB_DB || 'smart_campus_hub';

  const user = process.env.MONGODB_USER;
  const pass = process.env.MONGODB_PASSWORD;

  if (user && pass) {
    return `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${db}?authSource=admin`;
  }

  return `mongodb://${host}:${port}/${db}`;
}

async function tryConnect(uri, options) {
  const safeUri = maskMongoUri(uri);
  console.info(`[db] Connecting with URI: ${safeUri}`);
  await mongoose.connect(uri, options);
  console.info('[db] MongoDB connection established');
}

async function connectDB() {
  const srvUri = process.env.MONGODB_URI || '';
  const fallbackUri = process.env.MONGODB_URI_FALLBACK || buildFallbackUriFromParts();

  const retries = toInt(process.env.MONGODB_RETRIES, DEFAULT_RETRIES);
  const forceIPv4 = `${process.env.MONGODB_FORCE_IPV4 ?? 'true'}`.toLowerCase() !== 'false';

  if (!srvUri && !fallbackUri) {
    throw new Error('[db] Missing MONGODB_URI/MONGODB_URI_FALLBACK. Cannot start.');
  }

  if (forceIPv4 && typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
    console.info('[db] DNS result order set to ipv4first');
  }

  const mongoOptions = {
    family: forceIPv4 ? 4 : undefined,
    autoIndex: process.env.NODE_ENV !== 'production',
    serverSelectionTimeoutMS: toInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS, 10000),
    socketTimeoutMS: toInt(process.env.MONGODB_SOCKET_TIMEOUT_MS, 45000),
    maxPoolSize: toInt(process.env.MONGODB_MAX_POOL_SIZE, 20),
    minPoolSize: toInt(process.env.MONGODB_MIN_POOL_SIZE, 2)
  };

  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    console.info(`[db] Connection attempt ${attempt}/${retries}`);

    try {
      if (srvUri) {
        await tryConnect(srvUri, mongoOptions);
        return mongoose.connection;
      }
    } catch (error) {
      lastError = error;
      const category = classifyMongoError(error);
      console.error(`[db] SRV connection failed (${category}): ${error.message}`);

      const shouldTryFallback = Boolean(fallbackUri) && (isSrvUri(srvUri) || category === 'dns_or_network' || category === 'timeout');

      if (shouldTryFallback) {
        try {
          console.info('[db] Trying fallback mongodb:// URI');
          await tryConnect(fallbackUri, mongoOptions);
          return mongoose.connection;
        } catch (fallbackError) {
          lastError = fallbackError;
          const fallbackCategory = classifyMongoError(fallbackError);
          console.error(`[db] Fallback connection failed (${fallbackCategory}): ${fallbackError.message}`);
        }
      }
    }

    if (attempt < retries) {
      const backoffMs = BASE_RETRY_DELAY_MS * attempt;
      console.warn(`[db] Retry in ${backoffMs}ms`);
      await delay(backoffMs);
    }
  }

  console.error('[db] All MongoDB connection attempts exhausted');
  throw lastError || new Error('MongoDB connection failed after retries');
}

module.exports = {
  connectDB,
  classifyMongoError
};
