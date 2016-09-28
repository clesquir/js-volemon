export const getUTCNow = function() {
	var now = new Date();

	return new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
};

export const getUTCTimeStamp = function() {
	return getUTCNow().getTime();
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
