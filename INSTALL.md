# Installation Guide

## Prerequisites

Before you start, make sure you have the following installed:

### Windows 11
- **Node.js** v16+ ([Download](https://nodejs.org/))
  ```bash
  node --version  # Check if installed
  ```
- **Python** 3.8+ ([Download](https://www.python.org/))
  ```bash
  python --version
  ```
- **yt-dlp** (installed via pip)
  ```bash
  python -m pip install yt-dlp
  ```
- **FFmpeg** ([Download](https://ffmpeg.org/download.html) or `choco install ffmpeg`)
  ```bash
  ffmpeg -version
  ```

### Linux (Ubuntu/Debian)
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python and tools
sudo apt-get install -y python3 python3-pip ffmpeg

# Install yt-dlp
python3 -m pip install yt-dlp
```

### macOS
```bash
# Install using Homebrew
brew install node python ffmpeg

# Install yt-dlp
python3 -m pip install yt-dlp
```

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/spotify-downloader.git
cd spotify-downloader
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File (Optional)
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your settings (optional)
# PORT=5000
# SPOTIFY_CLIENT_ID=your_client_id
# SPOTIFY_CLIENT_SECRET=your_client_secret
```

### 4. Start the Server
```bash
# Development mode
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:5000`

### 5. Open in Browser
Navigate to:
```
http://localhost:5000/spotify-downloader-web-connected.html
```

## Troubleshooting

### "Cannot find module 'express'"
```bash
npm install
```

### "yt-dlp: command not found"
```bash
# Windows
python -m pip install --upgrade yt-dlp

# Linux/macOS
python3 -m pip install --upgrade yt-dlp
```

### "ffmpeg: command not found"
**Windows:** `choco install ffmpeg`
**Linux:** `sudo apt-get install ffmpeg`
**macOS:** `brew install ffmpeg`

### "Port 5000 already in use"
Edit `.env` and change `PORT=3000`, then access:
```
http://localhost:3000/spotify-downloader-web-connected.html
```

### "Connection refused"
- Make sure the server is running (`npm start`)
- Check that you're accessing the correct port
- Try `http://localhost:5000` first
- Check firewall settings

### Download not starting
1. Verify the Spotify URL is valid and public
2. Check browser console for errors (F12)
3. Make sure you have write permissions in the download folder
4. Check that yt-dlp is installed: `yt-dlp --version`

## Getting Help

- Check the [README.md](README.md) for feature overview
- Review [CONTRIBUTING.md](CONTRIBUTING.md) for development guide
- Check [GitHub Issues](https://github.com/yourusername/spotify-downloader/issues) for common problems
- Create a new issue if you need help

## Next Steps

After installation:
1. Open the web dashboard
2. Test with a public Spotify playlist
3. Choose a download folder
4. Start downloading!

Happy downloading! 🎵
