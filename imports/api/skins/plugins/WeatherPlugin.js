import {locationDetector} from '/imports/lib/geoLocation/LocationDetector.js';
import {YahooWeatherApi} from '/imports/lib/weatherApi/YahooWeatherApi.js';
import {
	CONDITION_CLOUD, CONDITION_FOG, CONDITION_RAIN, CONDITION_THUNDER, CONDITION_SNOW,
	TIME_OF_DAY_NIGHT, TIME_OF_DAY_DAYLIGHT
} from '/imports/lib/weatherApi/WeatherApi.js';
import Plugin from '/imports/api/skins/plugins/Plugin.js';

const keyPrefix = 'weather-condition-';

export default class WeatherPlugin extends Plugin {
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

		switch (condition) {
			case CONDITION_FOG:
				images.push({key: keyPrefix + CONDITION_FOG, path: `/assets/skin/weather-condition/fog.png`});
				break;
			case CONDITION_CLOUD:
				images.push(cloudImage);
				break;
			case CONDITION_SNOW:
				images.push(cloudImage);
				images.push({key: keyPrefix + 'snow-ground', path: `/assets/skin/weather-condition/snow-ground.png`});
				break;
			case CONDITION_RAIN:
			case CONDITION_THUNDER:
				images.push(cloudImage);
				images.push({key: keyPrefix + 'rain-ground', path: `/assets/skin/weather-condition/rain-ground.png`});
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
	 * @returns {{color: {string}, opacity: {float}}[]}
	 */
	backgroundColorModifier() {
		const modifiers = [];

		switch (this.weatherApi.timeOfDay()) {
			case TIME_OF_DAY_DAYLIGHT:
				modifiers.push({color: 0xFFFFFF, opacity: 0.30});
				break;
			case TIME_OF_DAY_NIGHT:
				modifiers.push({color: 0x000000, opacity: 0.15});
				break;
		}

		return modifiers;
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
				keys.push({key: keyPrefix + CONDITION_SNOW, animate: true});
				keys.push({key: keyPrefix + CONDITION_CLOUD});
				break;
			case CONDITION_RAIN:
				keys.push({key: keyPrefix + CONDITION_RAIN, animate: true});
				keys.push({key: keyPrefix + CONDITION_CLOUD});
				break;
			case CONDITION_THUNDER:
				keys.push({key: keyPrefix + CONDITION_THUNDER, animate: true});
				keys.push({key: keyPrefix + CONDITION_RAIN, animate: true});
				keys.push({key: keyPrefix + CONDITION_CLOUD});
				break;
		}

		return keys;
	}

	/**
	 * @returns {string[]}
	 */
	groundComponents() {
		const condition = this.weatherApi.condition();
		const groundComponents = [];

		switch (condition) {
			case CONDITION_SNOW:
				groundComponents.push(keyPrefix + 'snow-ground');
				break;
			case CONDITION_RAIN:
			case CONDITION_THUNDER:
				groundComponents.push(keyPrefix + 'rain-ground');
				break;
		}

		return groundComponents;
	}
}
