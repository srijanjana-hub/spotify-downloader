const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

const execPromise = promisify(exec);
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../')));

// Store active downloads
const downloads = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get download status
app.get('/api/download/:jobId', (req, res) => {
  const { jobId } = req.params;
  const download = downloads.get(jobId);

  if (!download) {
    return res.status(404).json({ error: 'Download not found' });
  }

  res.json(download);
});

// Start download
app.post('/api/download', async (req, res) => {
  try {
    const { playlistUrl, downloadPath, spotifyToken } = req.body;

    if (!playlistUrl || !downloadPath) {
      return res.status(400).json({
        error: 'Missing required fields: playlistUrl, downloadPath'
      });
    }

    // Validate Spotify URL
    if (!/open\.spotify\.com\/playlist\/|spotify:playlist:/.test(playlistUrl)) {
      return res.status(400).json({
        error: 'Invalid Spotify URL format'
      });
    }

    const jobId = uuidv4();
    const playlistId = playlistUrl.match(/playlist\/([a-zA-Z0-9]+)/)?.[1];

    if (!playlistId) {
      return res.status(400).json({
        error: 'Could not extract playlist ID'
      });
    }

    // Initialize download job
    const download = {
      id: jobId,
      status: 'starting',
      playlistUrl,
      downloadPath,
      progress: 0,
      tracks: [],
      startTime: new Date(),
      endTime: null,
      downloaded: 0,
      failed: 0,
      total: 0
    };

    downloads.set(jobId, download);

    // Start async download
    startPlaylistDownload(jobId, playlistUrl, downloadPath, spotifyToken, download);

    res.json({ jobId, status: 'started' });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function startPlaylistDownload(jobId, playlistUrl, downloadPath, spotifyToken, download) {
  try {
    download.status = 'fetching';

    // Create download directory
    await fs.mkdir(downloadPath, { recursive: true });

    // For demo: create mock tracks
    // In production, this would fetch from Spotify API
    const mockTracks = generateMockTracks(15);
    download.total = mockTracks.length;
    download.tracks = mockTracks.map((t, i) => ({
      ...t,
      status: 'pending',
      progress: 0,
      index: i + 1
    }));

    download.status = 'downloading';

    // Download each track
    for (let i = 0; i < mockTracks.length; i++) {
      const track = download.tracks[i];

      try {
        track.status = 'downloading';

        // Simulate download progress
        await simulateDownload(track, downloadPath, 500);

        track.status = 'completed';
        track.progress = 100;
        download.downloaded++;
      } catch (error) {
        track.status = 'failed';
        track.error = error.message;
        download.failed++;
      }

      // Update progress
      download.progress = Math.round(((i + 1) / mockTracks.length) * 100);
    }

    download.status = 'completed';
    download.endTime = new Date();
  } catch (error) {
    console.error(`Download ${jobId} failed:`, error);
    download.status = 'failed';
    download.error = error.message;
    download.endTime = new Date();
  }
}

function generateMockTracks(count) {
  const artists = ['The Weeknd', 'Drake', 'Post Malone', 'Bad Bunny', 'Taylor Swift'];
  const tracks = [];

  for (let i = 1; i <= count; i++) {
    const artist = artists[Math.floor(Math.random() * artists.length)];
    tracks.push({
      id: `track_${i}`,
      name: `Track ${i}`,
      artist: artist,
      duration: Math.floor(Math.random() * 240) + 120
    });
  }

  return tracks;
}

async function simulateDownload(track, downloadPath, duration) {
  const startTime = Date.now();

  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      track.progress = Math.min(Math.round((elapsed / duration) * 100), 100);

      if (elapsed >= duration) {
        clearInterval(interval);
        track.progress = 100;

        // Actually save a dummy file
        const filename = path.join(downloadPath, `${track.index}. ${track.name.replace(/[/\\?%*:|"<>]/g, '')}.mp3`);
        fs.writeFile(filename, `Mock audio for ${track.name}`).catch(console.error);

        resolve();
      }
    }, 50);
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🎵 Spotify Downloader Backend Server running on port ${PORT}`);
  console.log(`📝 Web Dashboard: http://localhost:${PORT}/spotify-downloader-web.html`);
  console.log(`🔗 API Health: http://localhost:${PORT}/health`);
});
