export const CONDITION_RAIN = 'rain';
export const CONDITION_SNOW = 'snow';
export const CONDITION_FOG = 'fog';
export const CONDITION_WIND = 'wind';
export const CONDITION_CLOUD = 'cloud';
export const CONDITION_CLEAR = 'clear';
export const TIME_OF_DAY_TWILIGHT = 'twilight';
export const TIME_OF_DAY_DAYLIGHT = 'daylight';
export const TIME_OF_DAY_NIGHT = 'night';

export class WeatherApi {
	condition() {
		return CONDITION_CLEAR;
	}

	timeOfDay() {
		return TIME_OF_DAY_DAYLIGHT;
	}
}
