hasRight = function(eventName) {
	var allowedEvents = [
		'play',
		'shakeLevelAndResumeOnTimerEnd',
		'moveClientBall',
		'moveOppositePlayer',
		'createBonus',
		'activateBonus',
		'moveClientBonus'
	];

	for (let event of allowedEvents) {
		if (eventName.indexOf(event) === 0) {
			return true;
		}
	}

	return false;
};

GameStream.permissions.write(function(eventName) {
	return hasRight(eventName);
});

GameStream.permissions.read(function(eventName) {
	return hasRight(eventName);
});
