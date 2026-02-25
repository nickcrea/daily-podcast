/**
 * Weather Fetcher
 *
 * Fetches current weather and forecast for Seattle, WA and Austin, TX
 */

const axios = require('axios');

/**
 * Get weather for a given city
 */
async function getCityWeather(city, state) {
  console.log(`Fetching ${city} weather...`);

  try {
    // Using wttr.in - free weather API, no key needed
    const response = await axios.get(`https://wttr.in/${city},${state}?format=j1`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const data = response.data;
    const current = data.current_condition[0];
    const today = data.weather[0];

    const weather = {
      city,
      temperature: current.temp_F,
      feelsLike: current.FeelsLikeF,
      condition: current.weatherDesc[0].value,
      high: today.maxtempF,
      low: today.mintempF,
      humidity: current.humidity,
      chanceOfRain: today.hourly[4]?.chanceofrain || '0', // Midday rain chance
    };

    console.log(`  Current: ${weather.temperature}°F, ${weather.condition}`);
    console.log(`  High: ${weather.high}°F, Low: ${weather.low}°F`);

    return weather;

  } catch (error) {
    console.error(`  ⚠️  ${city} weather fetch failed:`, error.message);

    // Return fallback data
    return {
      city,
      temperature: 'unknown',
      condition: 'unavailable',
      high: 'unknown',
      low: 'unknown',
      chanceOfRain: '0',
      error: true
    };
  }
}

async function getSeattleWeather() {
  return getCityWeather('Seattle', 'WA');
}

async function getAustinWeather() {
  return getCityWeather('Austin', 'TX');
}

/**
 * Format weather comparison for natural speech
 */
function formatWeatherForSpeech(seattle, austin) {
  if (seattle.error && austin.error) {
    return "Weather data unavailable today";
  }

  let speech = '';

  if (!seattle.error) {
    speech += `In Seattle, it's currently ${seattle.temperature} degrees and ${seattle.condition.toLowerCase()}`;
    speech += `, with a high of ${seattle.high} and a low of ${seattle.low}`;
    const seattleRain = parseInt(seattle.chanceOfRain);
    if (seattleRain > 30) {
      speech += `, and there's a ${seattleRain} percent chance of rain`;
    }
  }

  if (!austin.error) {
    speech += `. Meanwhile in Austin, it's ${austin.temperature} degrees and ${austin.condition.toLowerCase()}`;
    speech += `, with a high of ${austin.high} and a low of ${austin.low}`;
    const austinRain = parseInt(austin.chanceOfRain);
    if (austinRain > 30) {
      speech += `, and a ${austinRain} percent chance of rain`;
    }
  }

  return speech;
}

module.exports = { getSeattleWeather, getAustinWeather, formatWeatherForSpeech };
