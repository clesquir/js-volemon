import Skin from '/imports/api/skins/skins/Skin.js';
import {locationDetector} from '/imports/lib/geoLocation/LocationDetector.js';
import {YahooWeatherApi} from '/imports/lib/weatherApi/YahooWeatherApi.js';
import {
	CONDITION_CLOUD, CONDITION_FOG, CONDITION_RAIN, CONDITION_THUNDER, CONDITION_SNOW,
	TIME_OF_DAY_NIGHT, TIME_OF_DAY_TWILIGHT
} from '/imports/lib/weatherApi/WeatherApi.js';

const keyPrefix = 'weather-condition-';

export default class WeatherSkin extends Skin {
	start() {
		locationDetector.init();
	}

	init() {
		this.weatherApi = new YahooWeatherApi();
		this.weatherApi.init();
	}

	/**
	 * @returns {{key: {string}, path: {string}}[]}
	 */
	imagesToLoad() {
		return [
			{key: keyPrefix + CONDITION_CLOUD, path: `/assets/skin/weather-condition/${CONDITION_CLOUD}.png`},
			{key: keyPrefix + CONDITION_FOG, path: `/assets/skin/weather-condition/${CONDITION_FOG}.png`}
		];
	}

	/**
	 * @returns {{key: {string}, path: {string}, width: {integer}, height: {integer}}[]}
	 */
	spriteSheetsToLoad() {
		return [
			{
				key: keyPrefix + CONDITION_RAIN,
				path: `/assets/skin/weather-condition/${CONDITION_RAIN}.png`,
				width: 180,
				height: 560
			},
			{
				key: keyPrefix + CONDITION_SNOW,
				path: `/assets/skin/weather-condition/${CONDITION_SNOW}.png`,
				width: 180,
				height: 560
			},
			{
				key: keyPrefix + CONDITION_THUNDER,
				path: `/assets/skin/weather-condition/${CONDITION_THUNDER}.png`,
				width: 840,
				height: 560
			}
		];
	}

	/**
	 * @returns {string}
	 */
	backgroundColor() {
		switch (this.weatherApi.timeOfDay()) {
			case TIME_OF_DAY_TWILIGHT:
				return '#9ad3de';
			case TIME_OF_DAY_NIGHT:
				return '#70b1bd';
		}

		return '#bde0e6';
	}

	/**
	 * @returns {{key: {string}, animate: {boolean}}[]}
	 */
	backgroundComponents() {
		const condition = this.weatherApi.condition();
		const keys = [];

		switch (condition) {
			case CONDITION_FOG:
				keys.push({key: keyPrefix + CONDITION_FOG});
				break;
			case CONDITION_CLOUD:
				keys.push({key: keyPrefix + CONDITION_CLOUD});
				break;
			case CONDITION_SNOW:
				keys.push({key: keyPrefix + CONDITION_CLOUD});
				keys.push({key: keyPrefix + CONDITION_SNOW, animate: true});
				break;
			case CONDITION_RAIN:
				keys.push({key: keyPrefix + CONDITION_CLOUD});
				keys.push({key: keyPrefix + CONDITION_RAIN, animate: true});
				break;
			case CONDITION_THUNDER:
				keys.push({key: keyPrefix + CONDITION_CLOUD});
				keys.push({key: keyPrefix + CONDITION_RAIN, animate: true});
				keys.push({key: keyPrefix + CONDITION_THUNDER, animate: true});
				break;
		}

		return keys;
	}
}
