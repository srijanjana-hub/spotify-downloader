const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { promisify } = require('util');
const logger = require('./logger');
const SpotifyAPI = require('./spotify-api');

const execPromise = promisify(exec);

class PlaylistDownloader {
  constructor(options = {}) {
    this.spotifyAPI = new SpotifyAPI(options.spotifyToken);
    this.maxConcurrent = options.maxConcurrent || 3;
    this.downloadTimeout = options.downloadTimeout || 300000; // 5 minutes
  }

  async downloadPlaylist({
    playlistUrl,
    downloadPath,
    jobId,
    onProgress
  }) {
    try {
      logger.info(`Downloading playlist: ${playlistUrl}`, { jobId });

      // Extract playlist ID
      const playlistId = this.extractPlaylistId(playlistUrl);
      if (!playlistId) {
        throw new Error('Invalid Spotify playlist URL');
      }

      // Fetch playlist metadata
      const playlistData = await this.spotifyAPI.getPlaylist(playlistId);
      const tracks = playlistData.tracks || [];

      logger.info(`Found ${tracks.length} tracks in playlist`, { jobId, playlistId });

      // Create playlist folder
      const playlistFolderName = this.sanitizeFilename(playlistData.name);
      const playlistPath = path.join(downloadPath, playlistFolderName);
      await fs.mkdir(playlistPath, { recursive: true });

      // Download tracks with queue management
      const results = await this.downloadTracksWithQueue(
        tracks,
        playlistPath,
        jobId,
        onProgress
      );

      logger.info(`Download complete: ${results.successful}/${results.total} successful`, {
        jobId,
        failed: results.failed
      });

      return {
        success: true,
        playlistPath,
        downloaded: results.successful,
        failed: results.failed,
        total: results.total
      };
    } catch (error) {
      logger.error(`Download failed for playlist`, error, { jobId });
      throw error;
    }
  }

  async downloadTracksWithQueue(tracks, playlistPath, jobId, onProgress) {
    const results = {
      successful: 0,
      failed: 0,
      total: tracks.length
    };

    // Process tracks in batches
    for (let i = 0; i < tracks.length; i += this.maxConcurrent) {
      const batch = tracks.slice(i, i + this.maxConcurrent);
      const batchPromises = batch.map((track, index) =>
        this.downloadTrack(
          track,
          playlistPath,
          jobId,
          i + index,
          tracks.length,
          onProgress
        )
          .then(() => {
            results.successful++;
          })
          .catch((error) => {
            results.failed++;
            logger.error(`Failed to download track: ${track.name}`, error);
          })
      );

      await Promise.all(batchPromises);
    }

    return results;
  }

  async downloadTrack(track, playlistPath, jobId, index, total, onProgress) {
    const trackName = `${index + 1}. ${this.sanitizeFilename(track.name)}`;
    const outputPath = path.join(playlistPath, trackName);

    try {
      if (onProgress) {
        onProgress({
          id: track.id,
          title: track.name,
          status: 'Downloading...',
          progress: Math.round(((index + 1) / total) * 100),
          index,
          total
        });
      }

      // Search for track on YouTube
      const searchQuery = `${track.artists[0]?.name || 'Unknown'} ${track.name}`;
      const youtubeUrl = await this.searchYouTube(searchQuery);

      if (!youtubeUrl) {
        throw new Error(`No YouTube video found for "${searchQuery}"`);
      }

      // Download using yt-dlp
      await this.downloadWithYtDlp(youtubeUrl, outputPath);

      if (onProgress) {
        onProgress({
          id: track.id,
          title: track.name,
          status: 'Downloaded ✓',
          progress: Math.round(((index + 1) / total) * 100),
          index,
          total
        });
      }

      logger.info(`Downloaded: ${track.name}`, { jobId, trackId: track.id });
    } catch (error) {
      if (onProgress) {
        onProgress({
          id: track.id,
          title: track.name,
          status: `Failed: ${error.message}`,
          progress: Math.round(((index + 1) / total) * 100),
          index,
          total
        });
      }

      throw error;
    }
  }

  async downloadWithYtDlp(url, outputPath) {
    try {
      // Verify yt-dlp is installed
      await execPromise('yt-dlp --version');
    } catch {
      throw new Error('yt-dlp is not installed. Please install it: pip install yt-dlp');
    }

    try {
      const outputTemplate = path.join(path.dirname(outputPath), '%(title)s.%(ext)s');
      const command = [
        'yt-dlp',
        '-f', 'bestaudio[ext=m4a]/best',
        '-o', `"${outputTemplate}"`,
        `"${url}"`
      ].join(' ');

      await execPromise(command, {
        timeout: this.downloadTimeout,
        shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/bash'
      });

      logger.info(`Downloaded with yt-dlp: ${url}`);
    } catch (error) {
      throw new Error(`yt-dlp download failed: ${error.message}`);
    }
  }

  async searchYouTube(query) {
    try {
      // Use yt-dlp to search YouTube
      const command = `yt-dlp "ytsearch:${query}" --get-url --quiet --no-warnings`;
      const { stdout } = await execPromise(command, { timeout: 10000 });
      const url = stdout.trim().split('\n')[0];

      if (!url) {
        throw new Error('No search results found');
      }

      return url;
    } catch (error) {
      logger.error(`YouTube search failed for: ${query}`, error);
      throw error;
    }
  }

  extractPlaylistId(url) {
    // Handle open.spotify.com URL
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    if (match) return match[1];

    // Handle spotify: URI
    const uriMatch = url.match(/playlist:([a-zA-Z0-9]+)/);
    if (uriMatch) return uriMatch[1];

    return null;
  }

  sanitizeFilename(filename) {
    return filename
      .replace(/[/\\?%*:|"<>]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 200);
  }
}

const downloadPlaylist = async (options) => {
  const downloader = new PlaylistDownloader(options);
  return downloader.downloadPlaylist(options);
};

module.exports = { downloadPlaylist, PlaylistDownloader };
