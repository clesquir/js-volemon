import * as Moment from 'meteor/momentjs:moment';

export const getUTCTimeStamp = function() {
	return Moment.moment.utc().valueOf();
};

export const callMeteorMethodAtFrequence = function(lastCallTime, frequenceTime, methodToCall, argumentsToCallWith) {
	if (getUTCTimeStamp() - lastCallTime >= frequenceTime) {
		Meteor.apply(methodToCall, argumentsToCallWith);

		lastCallTime = getUTCTimeStamp();
	}

	return lastCallTime;
};

export const sleep = function(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
};

export const getRandomInt = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

export const round = function round(value, decimals) {
	return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
};

export const isEmpty = function(object){
	for (let key in object) {
		if (object.hasOwnProperty(key)) {
			return false;
		}
	}
	return true;
};
