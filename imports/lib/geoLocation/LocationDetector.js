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
			//Fallback
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
	}

	/**
	 * @private
	 */
	onRequestError() {
	}
}

/** @var LocationDetector */
export const locationDetector = new LocationDetector();
