import {Meteor} from 'meteor/meteor';

class LocationDetector {
	constructor() {
		this.coordinates = null;
	}

	init() {
		this.requestLocation();
	}

	hasCurrentCoordinates() {
		return this.coordinates !== null;
	}

	/**
	 * @returns {{latitude: {string}, longitude: {string}}}
	 */
	currentCoordinates() {
		if (this.hasCurrentCoordinates()) {
			return this.coordinates;
		} else {
			//Fallback with previous request before reload
			if (
				localStorage.getItem('locationDetector.latitude') !== null &&
				localStorage.getItem('locationDetector.longitude') !== null
			) {
				return {
					latitude: localStorage.getItem('locationDetector.latitude'),
					longitude: localStorage.getItem('locationDetector.longitude')
				};
			}

			//Fallback with server settings
			return Meteor.settings.public.DEFAULT_COORDINATES || {latitude: 0, longitude: 0};
		}
	}

	/**
	 * @private
	 */
	requestLocation() {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				this.onRequestSuccess(position);
			},
			() => {
				this.onRequestError();
			},
			{
				maximumAge: 5 * 60 * 1000
			}
		);
	}

	/**
	 * @private
	 * @param position
	 */
	onRequestSuccess(position) {
		this.coordinates = {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		};

		//Save last response for early usage on next reload
		localStorage.setItem('locationDetector.latitude', this.coordinates.latitude);
		localStorage.setItem('locationDetector.longitude', this.coordinates.longitude);
	}

	/**
	 * @private
	 */
	onRequestError() {
	}
}

/** @var LocationDetector */
export const locationDetector = new LocationDetector();
