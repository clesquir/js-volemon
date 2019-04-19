import {locationDetector} from '/imports/lib/geoLocation/LocationDetector.js';
import {
	CONDITION_CLEAR,
	CONDITION_CLOUD,
	CONDITION_FOG,
	CONDITION_RAIN,
	CONDITION_SNOW,
	CONDITION_THUNDER,
	CONDITION_WIND,
	TIME_OF_DAY_DAYLIGHT,
	TIME_OF_DAY_NIGHT,
	TIME_OF_DAY_TWILIGHT,
	WeatherApi
} from '/imports/lib/weatherApi/WeatherApi.js';
import moment from 'moment';
import CryptoJS from 'crypto-js';

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
		if (this.delayRequest() || !Meteor.settings.public.YAHOO_WEATHER_APP_ID) {
			return;
		}

		const appId = Meteor.settings.public.YAHOO_WEATHER_APP_ID;
		const consumerKey = Meteor.settings.public.YAHOO_WEATHER_CONSUMER_KEY;
		const consumerSecret = Meteor.settings.public.YAHOO_WEATHER_CONSUMER_SECRET;

		const coordinates = locationDetector.currentCoordinates();
		const url = 'https://weather-ydn-yql.media.yahoo.com/forecastrss';
		const method = 'GET';
		const query = {
			'lat': coordinates.latitude,
			'lon': coordinates.longitude,
			'format': 'json'
		};
		const oauth = {
			'oauth_consumer_key': consumerKey,
			'oauth_nonce': Math.random().toString(36).substring(2),
			'oauth_signature_method': 'HMAC-SHA1',
			'oauth_timestamp': parseInt(new Date().getTime() / 1000).toString(),
			'oauth_version': '1.0'
		};

		const merged = {};
		$.extend(merged, query, oauth);
		//Sorting is required
		const mergedParameters = Object.keys(merged).sort().map(function(k) {
			return [k + '=' + encodeURIComponent(merged[k])];
		});
		const signatureBase = method + '&' + encodeURIComponent(url) + '&' + encodeURIComponent(mergedParameters.join('&'));
		const hash = CryptoJS.HmacSHA1(signatureBase, encodeURIComponent(consumerSecret) + '&');

		oauth['oauth_signature'] = hash.toString(CryptoJS.enc.Base64);
		const authHeader = 'OAuth ' + Object.keys(oauth).map(function(k) {
			return [k + '="' + oauth[k] + '"'];
		}).join(',');

		$.ajax({
			url: url + '?' + $.param(query),
			headers: {
				'Authorization': authHeader,
				'X-Yahoo-App-Id': appId
			},
			method: method,
			success: (data) => {
				this.onApiResponse(data);
			}
		});
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
		if ((new Date()).getTime() - lastWeatherRequest < maximumAge) {
			return true;
		}
		//Delay next call if the locationDetector was not able to get current coordinates yet
		localStorage.setItem('lastWeatherRequest', (new Date()).getTime());

		return false;
	}

	/**
	 * @private
	 * @param data
	 */
	onApiResponse(data) {
		if (data.current_observation) {
			this.conditionCode = parseInt(data.current_observation.condition.code);
			this.timeOfSunrise = data.current_observation.astronomy.sunrise;
			this.timeOfSunset = data.current_observation.astronomy.sunset;

			localStorage.setItem('lastWeatherResult.conditionCode', this.conditionCode);
			localStorage.setItem('lastWeatherResult.timeOfSunrise', this.timeOfSunrise);
			localStorage.setItem('lastWeatherResult.timeOfSunset', this.timeOfSunset);
		}
	}
}
