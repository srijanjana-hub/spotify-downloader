const axios = require('axios');
const logger = require('./logger');

class SpotifyAPI {
  constructor(accessToken = null) {
    this.accessToken = accessToken;
    this.baseUrl = 'https://api.spotify.com/v1';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${accessToken || 'public'}`
      }
    });
  }

  async getPlaylist(playlistId) {
    try {
      logger.info(`Fetching playlist metadata: ${playlistId}`);

      const response = await this.client.get(`/playlists/${playlistId}`);

      return {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        tracks: await this.getAllTracks(playlistId),
        owner: response.data.owner?.display_name,
        images: response.data.images
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Playlist not found. Check the URL and try again.');
      }
      if (error.response?.status === 403) {
        throw new Error('Access denied. The playlist may be private.');
      }
      logger.error('Spotify API error', error);
      throw new Error(`Failed to fetch playlist: ${error.message}`);
    }
  }

  async getAllTracks(playlistId) {
    const allTracks = [];
    let offset = 0;
    const limit = 50;

    try {
      while (true) {
        const response = await this.client.get(
          `/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}`
        );

        const tracks = response.data.items
          .filter(item => item.track && item.track.name)
          .map(item => ({
            id: item.track.id,
            name: item.track.name,
            artists: item.track.artists || [],
            album: item.track.album?.name,
            duration_ms: item.track.duration_ms,
            isLocal: item.track.is_local
          }));

        allTracks.push(...tracks);

        if (response.data.next === null) {
          break;
        }

        offset += limit;
      }

      logger.info(`Retrieved ${allTracks.length} tracks from playlist`);
      return allTracks;
    } catch (error) {
      logger.error('Error fetching playlist tracks', error);
      throw error;
    }
  }

  async searchTrack(query) {
    try {
      const response = await this.client.get('/search', {
        params: {
          q: query,
          type: 'track',
          limit: 1
        }
      });

      const track = response.data.tracks?.items?.[0];
      return track ? {
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name,
        preview_url: track.preview_url
      } : null;
    } catch (error) {
      logger.error('Search error', error);
      return null;
    }
  }

  async getTrack(trackId) {
    try {
      const response = await this.client.get(`/tracks/${trackId}`);
      return {
        id: response.data.id,
        name: response.data.name,
        artist: response.data.artists[0]?.name,
        album: response.data.album?.name,
        duration_ms: response.data.duration_ms,
        preview_url: response.data.preview_url
      };
    } catch (error) {
      logger.error(`Error fetching track ${trackId}`, error);
      return null;
    }
  }
}

module.exports = SpotifyAPI;
