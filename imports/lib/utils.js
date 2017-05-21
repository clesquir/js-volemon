import * as Moment from 'meteor/momentjs:moment';

export const getUTCTimeStamp = function() {
	return Moment.moment.utc().valueOf();
};

export const timeElapsedSince = function(time) {
	let minutes = Moment.moment.duration(getUTCTimeStamp() - time).asMinutes();
	let hours = Math.floor(minutes / 60);
	minutes = Math.floor(minutes);

	if (minutes === 0) {
		return 'just now';
	} else if (hours === 0) {
		return minutes + 'min ago';
	} else if (hours < 12) {
		minutes -= Math.floor(hours * 60);
		return hours + 'h ' + minutes + 'min ago';
	}

	return Moment.moment(time).format('YYYY-MM-DD');
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

export const getRandomFloat = function(min, max) {
	return Math.random() * (max - min) + min;
};
