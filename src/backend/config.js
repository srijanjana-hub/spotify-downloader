require('dotenv').config();
const path = require('path');

module.exports = {
  // Application
  appName: 'Spotify Playlist Downloader',
  appVersion: '1.0.0',
  isDevelopment: process.env.NODE_ENV !== 'production',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  debug: process.env.DEBUG === 'true',
  logsDir: path.join(__dirname, '../../logs'),

  // Backend Server
  backendPort: parseInt(process.env.BACKEND_PORT || '3001'),
  backendHost: 'localhost',

  // Download Configuration
  maxConcurrentDownloads: parseInt(process.env.MAX_CONCURRENT_DOWNLOADS || '3'),
  downloadTimeout: parseInt(process.env.DOWNLOAD_TIMEOUT || '300000'),

  // Spotify API
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  spotifyAccessToken: process.env.SPOTIFY_ACCESS_TOKEN,

  // Application Paths
  srcDir: __dirname,
  projectRoot: path.join(__dirname, '../..')
};
