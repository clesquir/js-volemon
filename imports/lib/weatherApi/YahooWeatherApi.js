import {moment} from 'meteor/momentjs:moment';
import {locationDetector} from '/imports/lib/geoLocation/LocationDetector.js';
import {
	CONDITION_CLEAR, CONDITION_CLOUD, CONDITION_FOG, CONDITION_RAIN, CONDITION_THUNDER, CONDITION_SNOW, CONDITION_WIND,
	TIME_OF_DAY_DAYLIGHT, TIME_OF_DAY_NIGHT, TIME_OF_DAY_TWILIGHT,
	WeatherApi
} from '/imports/lib/weatherApi/WeatherApi.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

const maximumAge = 15 * 60 * 1000;

export class YahooWeatherApi extends WeatherApi {
	constructor() {
		super();

		if (localStorage.getItem('lastWeatherResult.conditionCode') === null) {
			localStorage.setItem('lastWeatherResult.conditionCode', 3200);
		}
		if (localStorage.getItem('lastWeatherResult.timeOfSunrise') === null) {
			localStorage.setItem('lastWeatherResult.timeOfSunrise', '7:00 am');
		}
		if (localStorage.getItem('lastWeatherResult.timeOfSunset') === null) {
			localStorage.setItem('lastWeatherResult.timeOfSunset', '7:00 pm');
		}
		this.conditionCode = parseInt(localStorage.getItem('lastWeatherResult.conditionCode'));
		this.timeOfSunrise = localStorage.getItem('lastWeatherResult.timeOfSunrise');
		this.timeOfSunset = localStorage.getItem('lastWeatherResult.timeOfSunset');
	}

	init() {
		if (this.delayRequest()) {
			return;
		}

		const url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22({latitude}%2C%20{longitude})%22)&format=json";
		const coordinates = locationDetector.currentCoordinates();
		const urlWithCoordinates = url.replace(/\{latitude\}/g, coordinates.latitude).replace(/\{longitude\}/g, coordinates.longitude);

		$.getJSON(
			urlWithCoordinates,
			{},
			(data) => {
				this.onApiResponse(data);
			}
		);
	}

	condition() {
		const rainRange = [0, 1, 2, 5, 10, 11, 12, 40, 46];
		const thunder = [3, 4, 37, 38, 39, 45, 47];
		const snowRange = [6, 7, 8, 9, 13, 14, 15, 16, 17, 18, 35, 41, 42, 43];
		const fogRange = [19, 20, 21, 22, 44];
		const windRange = [23, 24];
		const cloudRange = [26, 27, 28, 29, 30];

		if (rainRange.indexOf(this.conditionCode) !== -1) {
			return CONDITION_RAIN;
		} else if (thunder.indexOf(this.conditionCode) !== -1) {
			return CONDITION_THUNDER;
		} else if (snowRange.indexOf(this.conditionCode) !== -1) {
			return CONDITION_SNOW;
		} else if (fogRange.indexOf(this.conditionCode) !== -1) {
			return CONDITION_FOG;
		} else if (windRange.indexOf(this.conditionCode) !== -1) {
			return CONDITION_WIND;
		} else if (cloudRange.indexOf(this.conditionCode) !== -1) {
			return CONDITION_CLOUD;
		} else {
			return CONDITION_CLEAR;
		}
	}

	timeOfDay() {
		const sunrise = moment(this.timeOfSunrise, 'h:m a');
		const dawn = moment(sunrise).subtract(1.5, 'hours');
		const sunset = moment(this.timeOfSunset, 'h:m a');
		const dusk = moment(sunset).add(1.5, 'hours');
		const now = moment();

		if (now.isBetween(sunrise, sunset)) {
			return TIME_OF_DAY_DAYLIGHT;
		} else if (now.isBetween(dawn, sunrise) || now.isBetween(sunset, dusk)) {
			return TIME_OF_DAY_TWILIGHT;
		} else {
			return TIME_OF_DAY_NIGHT;
		}
	}

	/**
	 * @private
	 * @returns {boolean}
	 */
	delayRequest() {
		const lastWeatherRequest = localStorage.getItem('lastWeatherRequest') || 0;
		if (getUTCTimeStamp() - lastWeatherRequest < maximumAge) {
			return true;
		}
		//Delay next call if the locationDetector was not able to get current coordinates yet
		localStorage.setItem('lastWeatherRequest', getUTCTimeStamp());

		return false;
	}

	/**
	 * @private
	 * @param data
	 */
	onApiResponse(data) {
		if (data.query.results) {
			this.conditionCode = parseInt(data.query.results.channel.item.condition.code);
			this.timeOfSunrise = data.query.results.channel.astronomy.sunrise;
			this.timeOfSunset = data.query.results.channel.astronomy.sunset;

			localStorage.setItem('lastWeatherResult.conditionCode', this.conditionCode);
			localStorage.setItem('lastWeatherResult.timeOfSunrise', this.timeOfSunrise);
			localStorage.setItem('lastWeatherResult.timeOfSunset', this.timeOfSunset);
		}
	}
}
