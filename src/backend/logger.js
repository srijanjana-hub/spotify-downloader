const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, `downloader-${new Date().toISOString().split('T')[0]}.log`);

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

class Logger {
  constructor(context = '') {
    this.context = context;
  }

  formatLog(level, message, data = null, error = null) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}]`;

    if (this.context) {
      logMessage += ` [${this.context}]`;
    }

    logMessage += ` ${message}`;

    if (data) {
      logMessage += ` ${JSON.stringify(data)}`;
    }

    if (error) {
      logMessage += `\n  Error: ${error.message}`;
      if (error.stack) {
        logMessage += `\n  Stack: ${error.stack}`;
      }
    }

    return logMessage;
  }

  write(logMessage) {
    try {
      fs.appendFileSync(LOG_FILE, logMessage + '\n');
    } catch (err) {
      console.error('Failed to write log:', err);
    }
  }

  error(message, error = null, data = null) {
    const logMessage = this.formatLog(LOG_LEVELS.ERROR, message, data, error);
    this.write(logMessage);
    console.error(logMessage);
  }

  warn(message, data = null) {
    const logMessage = this.formatLog(LOG_LEVELS.WARN, message, data);
    this.write(logMessage);
    console.warn(logMessage);
  }

  info(message, data = null) {
    const logMessage = this.formatLog(LOG_LEVELS.INFO, message, data);
    this.write(logMessage);
    console.log(logMessage);
  }

  debug(message, data = null) {
    if (process.env.DEBUG === 'true') {
      const logMessage = this.formatLog(LOG_LEVELS.DEBUG, message, data);
      this.write(logMessage);
      console.log(logMessage);
    }
  }
}

const logger = new Logger('SpotifyDownloader');

module.exports = logger;
