import {Meteor} from 'meteor/meteor';

class LocationDetector {
	constructor() {
		this.coordinates = Meteor.settings.public.DEFAULT_COORDINATES || {latitude: null, longitude: null};
	}

	init() {
		this.requestLocation();
	}

	/**
	 * @returns {{latitude: {string}, longitude: {string}}}
	 */
	currentCoordinates() {
		return this.coordinates;
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
		this.coordinates.latitude  = position.coords.latitude;
		this.coordinates.longitude = position.coords.longitude;
	}

	/**
	 * @private
	 */
	onRequestError() {
	}
}

/** @var LocationDetector */
export const locationDetector = new LocationDetector();
