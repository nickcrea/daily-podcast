'use strict';

const { formatWeatherForSpeech } = require('../src/weather');

const makeWeather = (overrides = {}) => ({
  city: 'Seattle',
  temperature: '55',
  condition: 'Partly Cloudy',
  high: '60',
  low: '48',
  chanceOfRain: '10',
  ...overrides,
});

const seattle = makeWeather({ city: 'Seattle', temperature: '55', condition: 'Rainy', high: '58', low: '45' });
const austin = makeWeather({ city: 'Austin', temperature: '85', condition: 'Sunny', high: '92', low: '72' });

describe('formatWeatherForSpeech()', () => {
  // ─────────────────────────────────────────────
  // Error / unavailable weather
  // ─────────────────────────────────────────────

  test('returns unavailability message when both cities have errors', () => {
    const result = formatWeatherForSpeech({ error: true }, { error: true });
    expect(result).toBe('Weather data unavailable today');
  });

  // ─────────────────────────────────────────────
  // Normal weather — includes both cities
  // ─────────────────────────────────────────────

  test('includes Seattle temperature', () => {
    const result = formatWeatherForSpeech(seattle, austin);
    expect(result).toContain('Seattle');
    expect(result).toContain('55 degrees');
  });

  test('includes Austin temperature', () => {
    const result = formatWeatherForSpeech(seattle, austin);
    expect(result).toContain('Austin');
    expect(result).toContain('85 degrees');
  });

  test('includes high and low for both cities', () => {
    const result = formatWeatherForSpeech(seattle, austin);
    expect(result).toContain('high of 58');
    expect(result).toContain('high of 92');
  });

  // ─────────────────────────────────────────────
  // Rain chance thresholds
  // ─────────────────────────────────────────────

  test('omits rain mention when chance is below threshold', () => {
    const result = formatWeatherForSpeech(
      makeWeather({ city: 'Seattle', chanceOfRain: '10' }),
      makeWeather({ city: 'Austin', chanceOfRain: '10' }),
    );
    expect(result).not.toContain('percent chance of rain');
  });

  test('includes rain mention when chance is above 30%', () => {
    const result = formatWeatherForSpeech(
      makeWeather({ city: 'Seattle', chanceOfRain: '80' }),
      makeWeather({ city: 'Austin', chanceOfRain: '10' }),
    );
    expect(result).toContain('80 percent chance of rain');
  });

  // ─────────────────────────────────────────────
  // Partial failures
  // ─────────────────────────────────────────────

  test('still shows Austin when Seattle has error', () => {
    const result = formatWeatherForSpeech({ error: true }, austin);
    expect(result).toContain('Austin');
    expect(result).toContain('85 degrees');
  });

  test('still shows Seattle when Austin has error', () => {
    const result = formatWeatherForSpeech(seattle, { error: true });
    expect(result).toContain('Seattle');
    expect(result).toContain('55 degrees');
  });
});
