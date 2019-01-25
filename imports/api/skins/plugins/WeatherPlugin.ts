import {
	CONDITION_CLOUD, CONDITION_FOG, CONDITION_RAIN, CONDITION_THUNDER, CONDITION_SNOW,
	TIME_OF_DAY_NIGHT, TIME_OF_DAY_DAYLIGHT
} from '../../../lib/weatherApi/WeatherApi';
import Plugin from './Plugin';
import {YahooWeatherApi} from "../../../lib/weatherApi/YahooWeatherApi";
import {locationDetector} from "../../../lib/geoLocation/LocationDetector";

export default class WeatherPlugin implements Plugin {
	weatherApi: YahooWeatherApi;

	start() {
		locationDetector.init();
	}

	init() {
		this.weatherApi = new YahooWeatherApi();
		this.weatherApi.init();
	}

	atlasJSONHash(): { imagePath: string; jsonPath: string; key: string }[] {
		return [
			{
				key: 'weather-plugin',
				imagePath: '/assets/skin/weather-condition/texture-atlas.png',
				jsonPath: '/assets/skin/weather-condition/texture-atlas.json'
			}
		];
	}

	imagesToLoad(): { key: string, path: string }[] {
		return [];
	}

	spriteSheetsToLoad(): { key: string, path: string, width: number, height: number }[] {
		return [];
	}

	backgroundColorModifier(): { color: string, opacity: number }[] {
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

	backgroundComponents(xSize: number, ySize: number): { key: string, frame: string, animation: { frame: string, frames: string[], speed: number }, x: number, y: number, width: number, height: number }[] {
		const condition = this.weatherApi.condition();
		const keys = [];

		switch (condition) {
			case CONDITION_FOG:
				keys.push(
					{
						key: 'weather-plugin',
						frame: CONDITION_FOG,
						x: 0,
						y: 0,
						width: xSize,
						height: 238
					}
				);
				break;
			case CONDITION_CLOUD:
				keys.push(
					{
						key: 'weather-plugin',
						frame: CONDITION_CLOUD,
						x: 0,
						y: 0,
						width: xSize,
						height: 177
					}
				);
				break;
			case CONDITION_SNOW:
				keys.push(
					{
						key: 'weather-plugin',
						animation: {
							frame: CONDITION_SNOW,
							frames: ['snow-1', 'snow-2', 'snow-3'],
							speed: 5
						},
						x: 0,
						y: 0,
						width: xSize,
						height: 359
					}
				);
				keys.push(
					{
						key: 'weather-plugin',
						frame: CONDITION_CLOUD,
						x: 0,
						y: 0,
						width: xSize,
						height: 177
					}
				);
				break;
			case CONDITION_RAIN:
				keys.push(
					{
						key: 'weather-plugin',
						animation: {
							frame: CONDITION_RAIN,
							frames: ['rain-1', 'rain-2', 'rain-3'],
							speed: 5
						},
						x: 0,
						y: 0,
						width: xSize,
						height: 312
					}
				);
				keys.push(
					{
						key: 'weather-plugin',
						frame: CONDITION_CLOUD,
						x: 0,
						y: 0,
						width: xSize,
						height: 177
					}
				);
				break;
			case CONDITION_THUNDER:
				keys.push(
					{
						key: 'weather-plugin',
						animation: {
							frame: CONDITION_THUNDER,
							frames: [
								'thunder-1',
								'thunder-2',
								'thunder-1',
								'thunder-2',
								'thunder-2',
								'thunder-2',
								'thunder-2',
								'thunder-2',
								'thunder-2'
							],
							speed: 5
						},
						x: 0,
						y: 0,
						width: xSize,
						height: 280
					}
				);
				keys.push(
					{
						key: 'weather-plugin',
						animation: {
							frame: CONDITION_RAIN,
							frames: ['rain-1', 'rain-2', 'rain-3', 'rain-4'],
							speed: 5
						},
						x: 0,
						y: 0,
						width: xSize,
						height: 312
					}
				);
				keys.push(
					{
						key: 'weather-plugin',
						frame: CONDITION_CLOUD,
						x: 0,
						y: 0,
						width: xSize,
						height: 177
					}
				);
				break;
		}

		return keys;
	}

	groundComponents(): { key: string, frame: string, height?: number }[] {
		const condition = this.weatherApi.condition();
		const groundComponents = [];

		switch (condition) {
			case CONDITION_SNOW:
				groundComponents.push({key: 'weather-plugin', frame: 'snow-ground', height: 26});
				break;
			case CONDITION_RAIN:
			case CONDITION_THUNDER:
				groundComponents.push({key: 'weather-plugin', frame: 'rain-ground', height: 25});
				break;
		}

		return groundComponents;
	}
}
