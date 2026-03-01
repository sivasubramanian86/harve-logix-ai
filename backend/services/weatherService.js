/**
 * Weather Service
 * Handles weather forecast retrieval and caching
 */

const axios = require('axios')

const WEATHER_API_KEY = process.env.WEATHER_API_KEY
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/forecast'
const CACHE_DURATION = 3600000 // 1 hour in milliseconds

let weatherCache = {
  data: null,
  timestamp: null,
}

/**
 * Get weather forecast
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<Object>} Weather forecast data
 */
async function getForecast(latitude = 28.7041, longitude = 77.1025) {
  try {
    // Check cache
    if (weatherCache.data && Date.now() - weatherCache.timestamp < CACHE_DURATION) {
      return weatherCache.data
    }

    if (!WEATHER_API_KEY) {
      console.warn('Weather API key not configured, returning mock data')
      return getMockWeatherData()
    }

    const params = {
      lat: latitude,
      lon: longitude,
      appid: WEATHER_API_KEY,
      units: 'metric',
    }

    const response = await axios.get(WEATHER_API_URL, { params })

    const forecast = {
      location: response.data.city.name,
      country: response.data.city.country,
      forecasts: response.data.list.slice(0, 8).map((item) => ({
        timestamp: item.dt,
        temperature: item.main.temp,
        feels_like: item.main.feels_like,
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        weather: item.weather[0].main,
        description: item.weather[0].description,
        rainfall_probability: item.pop * 100,
        wind_speed: item.wind.speed,
        clouds: item.clouds.all,
      })),
    }

    // Cache the result
    weatherCache = {
      data: forecast,
      timestamp: Date.now(),
    }

    return forecast
  } catch (error) {
    console.error('Weather API error:', error)
    // Return mock data on error
    return getMockWeatherData()
  }
}

/**
 * Get mock weather data for development
 */
function getMockWeatherData() {
  return {
    location: 'Delhi',
    country: 'IN',
    forecasts: [
      {
        timestamp: Math.floor(Date.now() / 1000),
        temperature: 32,
        feels_like: 35,
        humidity: 45,
        pressure: 1013,
        weather: 'Clear',
        description: 'clear sky',
        rainfall_probability: 5,
        wind_speed: 10,
        clouds: 10,
      },
      {
        timestamp: Math.floor(Date.now() / 1000) + 3600,
        temperature: 34,
        feels_like: 37,
        humidity: 40,
        pressure: 1012,
        weather: 'Sunny',
        description: 'sunny',
        rainfall_probability: 0,
        wind_speed: 12,
        clouds: 5,
      },
      {
        timestamp: Math.floor(Date.now() / 1000) + 7200,
        temperature: 28,
        feels_like: 30,
        humidity: 60,
        pressure: 1010,
        weather: 'Clouds',
        description: 'overcast clouds',
        rainfall_probability: 20,
        wind_speed: 15,
        clouds: 60,
      },
    ],
  }
}

/**
 * Clear weather cache
 */
function clearCache() {
  weatherCache = {
    data: null,
    timestamp: null,
  }
}

module.exports = {
  getForecast,
  clearCache,
}
