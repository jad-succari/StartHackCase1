const fs = require('fs');
const path = require('path');
const base = require('./app.json');

// Load .env.local manually so MAPBOX_SECRET_TOKEN is available during native builds
function loadEnvLocal() {
  try {
    const file = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
    for (const line of file.split('\n')) {
      const m = line.match(/^([^#=\s][^=]*)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  } catch (_) {}
}
loadEnvLocal();

const mapboxDownloadToken = process.env.MAPBOX_SECRET_TOKEN ?? '';

module.exports = {
  ...base.expo,
  plugins: [
    'expo-router',
    [
      '@rnmapbox/maps',
      { RNMapboxMapsDownloadToken: mapboxDownloadToken },
    ],
  ],
};
