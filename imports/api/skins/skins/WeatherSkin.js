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
		const condition = this.weatherApi.condition();
		const images = [];
		const cloudImage = {key: keyPrefix + CONDITION_CLOUD, path: `/assets/skin/weather-condition/cloud.png`};
		const rainGroundImage = {key: 'ground', path: `/assets/skin/weather-condition/rain-ground.png`};

		switch (condition) {
			case CONDITION_FOG:
				images.push({key: keyPrefix + CONDITION_FOG, path: `/assets/skin/weather-condition/fog.png`});
				break;
			case CONDITION_CLOUD:
				images.push(cloudImage);
				break;
			case CONDITION_SNOW:
				images.push(cloudImage);
				images.push({key: 'ground', path: `/assets/skin/weather-condition/snow-ground.png`});
				break;
			case CONDITION_RAIN:
				images.push(cloudImage);
				images.push(rainGroundImage);
				break;
			case CONDITION_THUNDER:
				images.push(cloudImage);
				images.push(rainGroundImage);
				break;
		}

		return images;
	}

	/**
	 * @returns {{key: {string}, path: {string}, width: {integer}, height: {integer}}[]}
	 */
	spriteSheetsToLoad() {
		const condition = this.weatherApi.condition();
		const spriteSheets = [];
		const rainSpriteSheet = {
			key: keyPrefix + CONDITION_RAIN,
			path: `/assets/skin/weather-condition/rain.png`,
			width: 180,
			height: 560
		};

		switch (condition) {
			case CONDITION_SNOW:
				spriteSheets.push(
					{
						key: keyPrefix + CONDITION_SNOW,
						path: `/assets/skin/weather-condition/snow.png`,
						width: 180,
						height: 560
					}
				);
				break;
			case CONDITION_RAIN:
				spriteSheets.push(rainSpriteSheet);
				break;
			case CONDITION_THUNDER:
				spriteSheets.push(rainSpriteSheet);
				spriteSheets.push(
					{
						key: keyPrefix + CONDITION_THUNDER,
						path: `/assets/skin/weather-condition/thunder.png`,
						width: 840,
						height: 560
					}
				);
				break;
		}

		return spriteSheets;
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
