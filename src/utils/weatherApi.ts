// Weather API Service with OpenWeatherMap & Open-Meteo Fallback

const OWM_API_KEY = "64fcdb1032663a78feabd7f4835645d0";

export interface Location {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  country_code: string;
}

export interface CurrentWeather {
  temperature: number;
  relativeHumidity: number;
  apparentTemperature: number;
  isDay: boolean;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weatherCode: number;
  cloudCover: number;
  pressure: number;
  windSpeed: number;
  time: string;
}

export interface HourlyForecast {
  time: string[];
  temperature2m: number[];
  relativeHumidity2m: number[];
  apparentTemperature: number[];
  precipitationProbability: number[];
  weatherCode: number[];
  windSpeed10m: number[];
}

export interface DailyForecast {
  time: string[];
  weatherCode: number[];
  temperature2mMax: number[];
  temperature2mMin: number[];
  apparentTemperatureMax: number[];
  apparentTemperatureMin: number[];
  sunrise: string[];
  sunset: string[];
  uvIndexMax: number[];
  precipitationSum: number[];
  windSpeed10mMax: number[];
}

export interface AirQuality {
  aqi: number; // US AQI
  pm2_5: number;
  pm10: number;
  no2: number;
  so2: number;
  o3: number;
}

export interface WeatherData {
  location: Location;
  current: CurrentWeather;
  hourly: HourlyForecast;
  daily: DailyForecast;
  airQuality: AirQuality;
}

export interface WeatherTypeMeta {
  label: string;
  theme: 'clear-day' | 'clear-night' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm';
  icon: string;
}

// Translate WMO Weather Interpretation Codes (WW)
export function getWeatherMeta(code: number, isDay: boolean): WeatherTypeMeta {
  switch (code) {
    case 0: // Clear sky
      return {
        label: 'Clear Sky',
        theme: isDay ? 'clear-day' : 'clear-night',
        icon: isDay ? 'Sun' : 'Moon',
      };
    case 1: // Mainly clear
      return {
        label: 'Mainly Clear',
        theme: isDay ? 'clear-day' : 'clear-night',
        icon: isDay ? 'SunDim' : 'MoonStar',
      };
    case 2: // Partly cloudy
      return {
        label: 'Partly Cloudy',
        theme: 'cloudy',
        icon: isDay ? 'CloudSun' : 'CloudMoon',
      };
    case 3: // Overcast
      return {
        label: 'Overcast',
        theme: 'cloudy',
        icon: 'Cloud',
      };
    case 45: // Fog
    case 48: // Depositing rime fog
      return {
        label: 'Foggy',
        theme: 'fog',
        icon: 'CloudFog',
      };
    case 51: // Drizzle: Light
    case 53: // Drizzle: Moderate
    case 55: // Drizzle: Dense intensity
    case 56: // Freezing Drizzle: Light
    case 57: // Freezing Drizzle: Dense
      return {
        label: 'Drizzle',
        theme: 'drizzle',
        icon: 'CloudDrizzle',
      };
    case 61: // Rain: Slight
    case 63: // Rain: Moderate
    case 65: // Rain: Heavy
    case 66: // Freezing Rain: Light
    case 67: // Freezing Rain: Heavy
    case 80: // Rain showers: Slight
    case 81: // Rain showers: Moderate
    case 82: // Rain showers: Violent
      return {
        label: 'Rainy',
        theme: 'rain',
        icon: 'CloudRain',
      };
    case 71: // Snow fall: Slight
    case 73: // Snow fall: Moderate
    case 75: // Snow fall: Heavy
    case 77: // Snow grains
    case 85: // Snow showers: Slight
    case 86: // Snow showers: Heavy
      return {
        label: 'Snowy',
        theme: 'snow',
        icon: 'Snowflake',
      };
    case 95: // Thunderstorm: Slight or moderate
    case 96: // Thunderstorm with slight hail
    case 99: // Thunderstorm with heavy hail
      return {
        label: 'Thunderstorm',
        theme: 'thunderstorm',
        icon: 'CloudLightning',
      };
    default:
      return {
        label: 'Weather info',
        theme: 'clear-day',
        icon: 'Cloudy',
      };
  }
}

// Translate OpenWeatherMap Weather IDs to WMO weather codes
function translateOwmToWmo(id: number): number {
  if (id === 800) return 0; // Clear Sky
  if (id === 801) return 1; // Mainly Clear
  if (id === 802) return 2; // Partly Cloudy
  if (id === 803 || id === 804) return 3; // Overcast
  if (id >= 700 && id < 800) return 45; // Fog/Mist
  if (id >= 300 && id < 400) return 51; // Drizzle
  if (id >= 500 && id < 600) return 61; // Rain
  if (id >= 600 && id < 700) return 71; // Snow
  if (id >= 200 && id < 300) return 95; // Thunderstorm
  return 3; // Default Overcast
}

// Get UV Index description
export function getUvDescription(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

// Get US AQI description & color category
export interface AqiMeta {
  label: string;
  color: string;
  description: string;
}
export function getAqiMeta(aqi: number): AqiMeta {
  if (aqi <= 50) {
    return { label: 'Good', color: '#10b981', description: 'Air quality is satisfactory, and air pollution poses little or no risk.' };
  }
  if (aqi <= 100) {
    return { label: 'Moderate', color: '#eab308', description: 'Air quality is acceptable. However, active people may be sensitive.' };
  }
  if (aqi <= 150) {
    return { label: 'Unhealthy for Sensitive Groups', color: '#f97316', description: 'Members of sensitive groups may experience health effects.' };
  }
  if (aqi <= 200) {
    return { label: 'Unhealthy', color: '#ef4444', description: 'Everyone may begin to experience health effects; sensitive members more seriously.' };
  }
  if (aqi <= 300) {
    return { label: 'Very Unhealthy', color: '#a855f7', description: 'Health alert: everyone may experience more serious health effects.' };
  }
  return { label: 'Hazardous', color: '#7f1d1d', description: 'Health warnings of emergency conditions. The entire population is more likely to be affected.' };
}

// Search locations (attempts OWM, falls back to Open-Meteo)
export async function searchLocations(query: string): Promise<Location[]> {
  if (!query || query.trim().length < 2) return [];
  
  try {
    // Attempt OpenWeatherMap Geocoding API
    const owmUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=8&appid=${OWM_API_KEY}`;
    const response = await fetch(owmUrl);
    
    if (response.status === 401) {
      throw new Error('OWM Key Unauthorized (possibly pending activation)');
    }
    
    if (!response.ok) {
      throw new Error('OWM Geocoding API failed');
    }
    
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item, idx) => ({
        id: Math.round((item.lat + item.lon) * 100000) + idx, // unique key generator
        name: item.name,
        latitude: item.lat,
        longitude: item.lon,
        country: item.country,
        admin1: item.state,
        country_code: item.country,
      }));
    }
    return [];
  } catch (error) {
    console.warn('OpenWeatherMap geocoding failed, falling back to Open-Meteo:', error);
    
    // Fallback to Open-Meteo Geocoding
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
      );
      if (!response.ok) throw new Error('Open-Meteo Geocoding failed');
      const data = await response.json();
      return data.results || [];
    } catch (fallbackError) {
      console.error('All geocoding APIs failed:', fallbackError);
      return [];
    }
  }
}

// Fetch complete weather data (attempts OWM, falls back to Open-Meteo)
export async function fetchWeatherData(location: Location): Promise<WeatherData> {
  const { latitude, longitude } = location;
  
  try {
    // 1. Fetch current weather from OpenWeatherMap
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OWM_API_KEY}`;
    // 2. Fetch 5 day / 3 hour forecast from OpenWeatherMap
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${OWM_API_KEY}`;
    // 3. Fetch Air Pollution from OpenWeatherMap
    const pollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}`;

    const [currentRes, forecastRes, pollutionRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl),
      fetch(pollutionUrl)
    ]);

    if (currentRes.status === 401 || forecastRes.status === 401) {
      throw new Error('OWM Key Unauthorized (possibly pending activation)');
    }

    if (!currentRes.ok || !forecastRes.ok || !pollutionRes.ok) {
      throw new Error('OWM APIs failed');
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();
    const pollutionData = await pollutionRes.json();

    // Map Current Weather
    const currentCode = translateOwmToWmo(currentData.weather[0].id);
    const isDay = currentData.weather[0].icon.endsWith('d');
    
    const currentVal: CurrentWeather = {
      temperature: currentData.main.temp,
      relativeHumidity: currentData.main.humidity,
      apparentTemperature: currentData.main.feels_like,
      isDay,
      precipitation: currentData.rain?.['1h'] || currentData.snow?.['1h'] || 0,
      rain: currentData.rain?.['1h'] || 0,
      showers: 0,
      snowfall: currentData.snow?.['1h'] || 0,
      weatherCode: currentCode,
      cloudCover: currentData.clouds.all,
      pressure: currentData.main.pressure,
      windSpeed: currentData.wind.speed * 3.6, // m/s to km/h
      time: new Date(currentData.dt * 1000).toISOString(),
    };

    // Map Hourly Forecast (OWM has 40 items at 3-hour intervals)
    const hourlyVal: HourlyForecast = {
      time: forecastData.list.map((item: any) => new Date(item.dt * 1000).toISOString()),
      temperature2m: forecastData.list.map((item: any) => item.main.temp),
      relativeHumidity2m: forecastData.list.map((item: any) => item.main.humidity),
      apparentTemperature: forecastData.list.map((item: any) => item.main.feels_like),
      precipitationProbability: forecastData.list.map((item: any) => Math.round((item.pop || 0) * 100)),
      weatherCode: forecastData.list.map((item: any) => translateOwmToWmo(item.weather[0].id)),
      windSpeed10m: forecastData.list.map((item: any) => item.wind.speed * 3.6),
    };

    // Group Forecast by Date to construct Daily Forecast
    const dailyMap: { [key: string]: { temps: number[], codes: number[], winds: number[], rain: number[] } } = {};
    forecastData.list.forEach((item: any) => {
      const dateStr = new Date(item.dt * 1000).toLocaleDateString('sv'); // 'YYYY-MM-DD'
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { temps: [], codes: [], winds: [], rain: [] };
      }
      dailyMap[dateStr].temps.push(item.main.temp);
      dailyMap[dateStr].codes.push(item.weather[0].id);
      dailyMap[dateStr].winds.push(item.wind.speed * 3.6);
      dailyMap[dateStr].rain.push(item.rain?.['3h'] || item.snow?.['3h'] || 0);
    });

    const sortedDates = Object.keys(dailyMap).sort().slice(0, 5); // OWM covers 5 days
    
    // Extrapolate daily arrays
    const dailyVal: DailyForecast = {
      time: sortedDates,
      weatherCode: sortedDates.map(date => {
        // Use the code in the middle of the list (midday approximation) or the mode.
        // Midday is closest to index 4 in a full 8-point day.
        const dayCodes = dailyMap[date].codes;
        const middleIndex = Math.floor(dayCodes.length / 2);
        return translateOwmToWmo(dayCodes[middleIndex]);
      }),
      temperature2mMax: sortedDates.map(date => Math.max(...dailyMap[date].temps)),
      temperature2mMin: sortedDates.map(date => Math.min(...dailyMap[date].temps)),
      apparentTemperatureMax: sortedDates.map(date => Math.max(...dailyMap[date].temps) + 1), // estimation
      apparentTemperatureMin: sortedDates.map(date => Math.min(...dailyMap[date].temps) - 1),
      sunrise: sortedDates.map((_, idx) => new Date((currentData.sys.sunrise + idx * 86400) * 1000).toISOString()),
      sunset: sortedDates.map((_, idx) => new Date((currentData.sys.sunset + idx * 86400) * 1000).toISOString()),
      uvIndexMax: sortedDates.map(date => {
        // Free OWM lacks UV, let's estimate UV based on temperature and dominant weather code
        const maxTemp = Math.max(...dailyMap[date].temps);
        const dayCodes = dailyMap[date].codes;
        const isSunny = dayCodes.some(c => c === 800 || c === 801);
        if (isSunny) return maxTemp > 30 ? 9.5 : maxTemp > 20 ? 6.5 : 3.0;
        return maxTemp > 25 ? 4.0 : 1.5;
      }),
      precipitationSum: sortedDates.map(date => dailyMap[date].rain.reduce((sum, val) => sum + val, 0)),
      windSpeed10mMax: sortedDates.map(date => Math.max(...dailyMap[date].winds)),
    };

    // Map Air Pollution AQI (OWM scale 1 to 5)
    // Translate OWM 1-5 scale into US AQI levels (0-300) to keep stats grid styles intact
    // 1 (Good) -> 25, 2 (Fair) -> 75, 3 (Moderate) -> 125, 4 (Poor) -> 175, 5 (Very Poor) -> 250
    const owmAqi = pollutionData.list[0]?.main?.aqi || 1;
    const mappedAqi = owmAqi === 1 ? 25 : owmAqi === 2 ? 75 : owmAqi === 3 ? 125 : owmAqi === 4 ? 175 : 250;

    const components = pollutionData.list[0]?.components || {};

    const airQualityVal: AirQuality = {
      aqi: mappedAqi,
      pm2_5: components.pm2_5 || 0,
      pm10: components.pm10 || 0,
      no2: components.no2 || 0,
      so2: components.so2 || 0,
      o3: components.o3 || 0,
    };

    return {
      location,
      current: currentVal,
      hourly: hourlyVal,
      daily: dailyVal,
      airQuality: airQualityVal,
    };
  } catch (error) {
    console.warn('OpenWeatherMap API failed (likely pending key activation). Falling back to Open-Meteo:', error);

    // Automatic Fallback to Open-Meteo Weather API
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,wind_speed_10m_max&timezone=auto`;
      
      const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,ozone`;
      
      const [weatherRes, aqiRes] = await Promise.all([
        fetch(weatherUrl),
        fetch(airQualityUrl)
      ]);
      
      if (!weatherRes.ok || !aqiRes.ok) {
        throw new Error('Fallback APIs failed');
      }
      
      const weatherData = await weatherRes.json();
      const aqiData = await aqiRes.json();
      
      const current = weatherData.current;
      const hourly = weatherData.hourly;
      const daily = weatherData.daily;
      const currentAqi = aqiData.current;
      
      return {
        location,
        current: {
          temperature: current.temperature_2m,
          relativeHumidity: current.relative_humidity_2m,
          apparentTemperature: current.apparent_temperature,
          isDay: current.is_day === 1,
          precipitation: current.precipitation,
          rain: current.rain,
          showers: current.showers,
          snowfall: current.snowfall,
          weatherCode: current.weather_code,
          cloudCover: current.cloud_cover,
          pressure: current.pressure_msl,
          windSpeed: current.wind_speed_10m,
          time: current.time,
        },
        hourly: {
          time: hourly.time,
          temperature2m: hourly.temperature_2m,
          relativeHumidity2m: hourly.relative_humidity_2m,
          apparentTemperature: hourly.apparent_temperature,
          precipitationProbability: hourly.precipitation_probability,
          weatherCode: hourly.weather_code,
          windSpeed10m: hourly.wind_speed_10m,
        },
        daily: {
          time: daily.time,
          weatherCode: daily.weather_code,
          temperature2mMax: daily.temperature_2m_max,
          temperature2mMin: daily.temperature_2m_min,
          apparentTemperatureMax: daily.apparent_temperature_max,
          apparentTemperatureMin: daily.apparent_temperature_min,
          sunrise: daily.sunrise,
          sunset: daily.sunset,
          uvIndexMax: daily.uv_index_max,
          precipitationSum: daily.precipitation_sum,
          windSpeed10mMax: daily.wind_speed_10m_max,
        },
        airQuality: {
          aqi: currentAqi.us_aqi || 0,
          pm2_5: currentAqi.pm2_5 || 0,
          pm10: currentAqi.pm10 || 0,
          no2: currentAqi.nitrogen_dioxide || 0,
          so2: currentAqi.sulphur_dioxide || 0,
          o3: currentAqi.ozone || 0,
        }
      };
    } catch (fallbackError) {
      console.error('All weather APIs failed:', fallbackError);
      throw fallbackError;
    }
  }
}
