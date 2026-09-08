# Spotify Playlist Downloader

A modern, cross-platform web application to download Spotify playlists as MP3 files with real-time progress tracking.

## Features

✨ **Modern Web Dashboard** - Clean, dark-themed UI with real-time progress tracking
⚡ **Fast Downloads** - Concurrent downloads with customizable queue management
🎵 **Quality Audio** - Downloads best available audio format
📁 **Custom Locations** - Choose any folder on your PC to save playlists
🔍 **Real-time Status** - See each track downloading individually
📊 **Progress Tracking** - Overall and per-track progress bars
🌐 **Cross-Platform** - Works on Windows, Linux, and macOS

## Quick Start

### Prerequisites

- Node.js v16+ ([Download](https://nodejs.org/))
- Python 3.8+ ([Download](https://www.python.org/))
- yt-dlp (installed automatically)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/spotify-downloader.git
   cd spotify-downloader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   npm run server
   ```

4. **Open in your browser**
   ```
   http://localhost:5000/spotify-downloader-web-connected.html
   ```

## Usage

1. **Paste Spotify Playlist URL**
   - Copy any Spotify playlist link
   - Example: `https://open.spotify.com/playlist/37i9dQZF1DX4UtSsGT1Sbe`

2. **Select Download Folder**
   - Click "📁 Select Folder"
   - Enter the path where you want files saved

3. **Start Download**
   - Click "⬇️ Download Playlist"
   - Watch real-time progress for each track

4. **Files Saved**
   - All tracks saved as MP3 files in your chosen folder
   - Organized by playlist name

## How It Works

- **Frontend**: Modern web dashboard with real-time progress tracking
- **Backend**: Node.js/Express server handling downloads
- **Audio**: yt-dlp for high-quality audio extraction
- **API**: REST endpoints for download management

## Architecture

```
spotify-downloader/
├── src/
│   ├── backend/
│   │   ├── server-web.js          # Express backend server
│   │   ├── downloader.js          # Download logic
│   │   ├── spotify-api.js         # Spotify API client
│   │   └── logger.js              # Logging system
│   └── main.js                    # Electron main (optional)
├── spotify-downloader-web-connected.html  # Web dashboard
├── package.json
├── README.md
└── LICENSE
```

## Configuration

Create a `.env` file for optional settings:

```env
# Backend
PORT=5000

# Spotify (optional)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

# Download settings
MAX_CONCURRENT_DOWNLOADS=3
DOWNLOAD_TIMEOUT=300000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check server health |
| POST | `/api/download` | Start playlist download |
| GET | `/api/download/:jobId` | Get download status |

## Example API Usage

**Start a download:**
```bash
curl -X POST http://localhost:5000/api/download \
  -H "Content-Type: application/json" \
  -d '{
    "playlistUrl": "https://open.spotify.com/playlist/...",
    "downloadPath": "/home/user/Music",
    "spotifyToken": null
  }'
```

**Check status:**
```bash
curl http://localhost:5000/api/download/job-id-here
```

## Troubleshooting

### "yt-dlp not found"
```bash
python3 -m pip install --upgrade yt-dlp
```

### "FFmpeg not found"
**Windows:** `choco install ffmpeg`
**Linux:** `sudo apt-get install ffmpeg`
**macOS:** `brew install ffmpeg`

### Port already in use
Change the port in `.env`:
```env
PORT=3000
```

Then access: `http://localhost:3000/spotify-downloader-web-connected.html`

### Downloads not starting
- Check that the backend server is running
- Verify the Spotify URL is valid and public
- Check the browser console for errors (F12)
- Review logs for detailed error messages

## Development

### Run development mode
```bash
npm run server
```

### Build for production
```bash
npm run build
```

### Project structure
- `src/backend/` - Node.js backend server
- `spotify-downloader-web-connected.html` - Web UI
- `package.json` - Dependencies and scripts

## Performance Tips

- Set `MAX_CONCURRENT_DOWNLOADS=5` for faster networks
- Use `1-2` for slower connections
- Close other apps to free system resources
- Use SSD for better speeds

## Supported Platforms

| Platform | Status | Notes |
|----------|--------|-------|
| Windows 11+ | ✅ Fully Supported | |
| Linux (Ubuntu 20.04+) | ✅ Fully Supported | |
| macOS | ✅ Fully Supported | |

## License

MIT License - see LICENSE file for details

**Copyright © 2024 Srijan Jana**

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Roadmap

- [ ] Spotify API authentication for private playlists
- [ ] Batch download multiple playlists
- [ ] Download history tracking
- [ ] Custom file naming templates
- [ ] Audio format selection (MP3, FLAC, WAV)
- [ ] Desktop app (Electron)
- [ ] Command-line interface

## Support

Having issues? 
- Check the [Troubleshooting](#troubleshooting) section
- Review existing GitHub issues
- Create a new GitHub issue with details about your problem

## Security

- No credentials stored locally
- No automatic data collection
- All downloads happen locally on your machine
- Open source - audit the code yourself

## Disclaimer

This tool is for personal use only. Respect copyright laws and Spotify's terms of service. Only download content you have the right to download.

## Credits

Built with:
- [Express.js](https://expressjs.com/) - Web framework
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Audio downloader
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)

---

**Made with ❤️ for music lovers everywhere**
