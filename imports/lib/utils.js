import * as Moment from 'meteor/momentjs:moment';

export const padNumber = function(number, size = 2) {
	let result = String(number);
	const character = '0';

	while (result.length < size) {
		result = character + result;
	}

	return result;
};

export const getRainbowColor = function(numOfSteps, step) {
	// This function generates vibrant, "evenly spaced" colours (i.e. no clustering).
	// This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
	// Adam Cole, 2011-Sept-14
	// HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
	let r, g, b;
	const h = step / numOfSteps;
	const i = ~~(h * 6);
	const f = h * 6 - i;
	const q = 1 - f;
	switch(i % 6){
		case 0: r = 1; g = f; b = 0; break;
		case 1: r = q; g = 1; b = 0; break;
		case 2: r = 0; g = 1; b = f; break;
		case 3: r = 0; g = q; b = 1; break;
		case 4: r = f; g = 0; b = 1; break;
		case 5: r = 1; g = 0; b = q; break;
	}
	const c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
	return (c);
};

export const getWinRate = function(profile) {
	if (profile.numberOfWin + profile.numberOfLost === 0) {
		return 'N/A';
	} else if (profile.numberOfLost === 0) {
		return '100%';
	} else {
		return Math.round(profile.numberOfWin / (profile.numberOfWin + profile.numberOfLost) * 100) + '%';
	}
};

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
