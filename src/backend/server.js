const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { downloadPlaylist } = require('./downloader');
const logger = require('./logger');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Store active download jobs
const activeDownloads = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Download playlist endpoint
app.post('/api/download', async (req, res) => {
  const { playlistUrl, downloadPath, spotifyToken } = req.body;

  if (!playlistUrl || !downloadPath) {
    return res.status(400).json({
      error: 'Missing required fields: playlistUrl, downloadPath'
    });
  }

  const jobId = uuidv4();
  logger.info(`Starting download job ${jobId}`, { playlistUrl, downloadPath });

  try {
    // Validate URL format
    if (!isValidSpotifyUrl(playlistUrl)) {
      return res.status(400).json({
        error: 'Invalid Spotify URL format'
      });
    }

    // Start download in background
    const downloadPromise = downloadPlaylist({
      playlistUrl,
      downloadPath,
      spotifyToken,
      jobId,
      onProgress: (progress) => {
        if (activeDownloads.has(jobId)) {
          const job = activeDownloads.get(jobId);
          job.progress = progress;
        }
      }
    });

    // Store job
    activeDownloads.set(jobId, {
      id: jobId,
      status: 'running',
      startTime: new Date(),
      playlistUrl,
      downloadPath,
      progress: 0,
      queue: []
    });

    // Handle completion
    downloadPromise
      .then(() => {
        const job = activeDownloads.get(jobId);
        if (job) {
          job.status = 'completed';
          job.endTime = new Date();
          logger.info(`Download job ${jobId} completed`);
        }
      })
      .catch((error) => {
        const job = activeDownloads.get(jobId);
        if (job) {
          job.status = 'failed';
          job.error = error.message;
          job.endTime = new Date();
        }
        logger.error(`Download job ${jobId} failed`, error);
      });

    // Return job info
    res.json({
      jobId,
      status: 'started',
      queue: []
    });
  } catch (error) {
    logger.error('Download endpoint error', error);
    res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

// Get download status
app.get('/api/download/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = activeDownloads.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({
    jobId,
    status: job.status,
    progress: job.progress,
    startTime: job.startTime,
    endTime: job.endTime,
    error: job.error
  });
});

// Validate Spotify URL
function isValidSpotifyUrl(url) {
  const spotifyUrlPatterns = [
    /https:\/\/open\.spotify\.com\/playlist\//i,
    /spotify:playlist:/i
  ];
  return spotifyUrlPatterns.some(pattern => pattern.test(url));
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Express error', err);
  res.status(500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
const startBackendServer = () => {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, () => {
      logger.info(`Backend server running on port ${PORT}`);
      resolve(server);
    });

    server.on('error', (error) => {
      logger.error('Server startup error', error);
      reject(error);
    });
  });
};

module.exports = { startBackendServer, app };
