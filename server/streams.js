hasRight = function(eventName) {
	var hasRight = false;

	switch (eventName) {
		case 'play':
		case 'shakeLevelAndResumeOnTimerEnd':
		case 'moveClientBall':
		case 'moveOppositePlayer':
		case 'createBonus':
		case 'activateBonus':
		case 'moveClientBonus':
			hasRight = true;
			break;
	}

	return hasRight;
};

GameStream.permissions.write(function(eventName) {
	return hasRight(eventName);
});

GameStream.permissions.read(function(eventName) {
	return hasRight(eventName);
});
