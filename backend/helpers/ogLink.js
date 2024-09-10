const ogs = require('open-graph-scraper');

async function fetchOGData(url) {
  try {
    const { result } = await ogs({ url });
    return result;
  } catch (error) {
    console.error('Error fetching OG data:', error);
    return null;
  }
}

module.exports = fetchOGData;