// Extends app.json with environment-specific native config.
// Google Maps API key is injected from EXPO_PUBLIC_GOOGLE_MAPS_API_KEY so it
// never needs to be hard-coded in the committed app.json.
const appJson = require('./app.json');
const mapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    android: {
      ...appJson.expo.android,
      config: {
        googleMaps: { apiKey: mapsKey },
      },
    },
    ios: {
      ...appJson.expo.ios,
      config: {
        googleMapsApiKey: mapsKey,
      },
    },
  },
};
