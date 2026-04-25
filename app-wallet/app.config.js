const base = require('./app.json');

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
