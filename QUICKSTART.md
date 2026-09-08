# Quick Start

Get your Spotify downloader up and running in 5 minutes!

## 1️⃣ Prerequisites

Make sure you have installed:
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **Python** 3.8+ ([Download](https://www.python.org/))
- **FFmpeg** ([Installation guide](https://ffmpeg.org/download.html))

Check installation:
```bash
node --version
python --version
ffmpeg -version
```

## 2️⃣ Clone & Setup

```bash
git clone https://github.com/yourusername/spotify-downloader.git
cd spotify-downloader
npm install
```

## 3️⃣ Start Server

```bash
npm start
```

Output should show:
```
🎵 Spotify Downloader Backend Server running on port 5000
📝 Web Dashboard: http://localhost:5000/spotify-downloader-web-connected.html
```

## 4️⃣ Open Dashboard

Open your browser to:
```
http://localhost:5000/spotify-downloader-web-connected.html
```

## 5️⃣ Download Playlist

1. Paste a Spotify playlist URL
2. Click "📁 Select Folder" to choose download location
3. Click "⬇️ Download Playlist"
4. Watch real-time progress!

## ✅ Done!

Files will be saved as MP3s in your chosen folder. That's it! 🎵

## 🆘 Having Issues?

See [INSTALL.md](INSTALL.md) for detailed troubleshooting steps.
