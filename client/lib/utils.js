actionAfterLoginCreateUser = null;
actionOnLighboxClose = null;

padPoints = function(points) {
	var result = String(points),
		character = '0',
		size = 2;

	while (result.length < size) {
		result = character + result;
	}

	return result;
};

isGameStatusOnGoing = function(gameStatus) {
	return [Constants.GAME_STATUS_STARTED, Constants.GAME_STATUS_FINISHED, Constants.GAME_STATUS_TIMEOUT].indexOf(gameStatus) !== -1;
};

getUTCTimeStamp = function() {
	var now = new Date(),
		UtcNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());

	return UtcNow.getTime();
};

getRainbowColor = function(numOfSteps, step) {
	// This function generates vibrant, "evenly spaced" colours (i.e. no clustering).
	// This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
	// Adam Cole, 2011-Sept-14
	// HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
	var r, g, b;
	var h = step / numOfSteps;
	var i = ~~(h * 6);
	var f = h * 6 - i;
	var q = 1 - f;
	switch(i % 6){
		case 0: r = 1; g = f; b = 0; break;
		case 1: r = q; g = 1; b = 0; break;
		case 2: r = 0; g = 1; b = f; break;
		case 3: r = 0; g = q; b = 1; break;
		case 4: r = f; g = 0; b = 1; break;
		case 5: r = 1; g = 0; b = q; break;
	}
	var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
	return (c);
};

getWinRate = function(profile) {
	if (profile.numberOfWin + profile.numberOfLost == 0) {
		return 'N/A';
	} else if (profile.numberOfLost == 0) {
		return '100%';
	} else {
		return Math.round(profile.numberOfWin / (profile.numberOfWin + profile.numberOfLost) * 100) + '%';
	}
};
