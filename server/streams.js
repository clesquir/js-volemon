GameStream.permissions.write(function(eventName) {
	var userId = this.userId,
		hasRight = false;

	switch (eventName) {
		case 'play':
		case 'shakeLevelAndResumeOnTimerEnd':
		case 'moveClientBall':
			//Only host can send those event
			let game = Games.findOne({createdBy: userId});

			if (game) {
				hasRight = true;
			}
			break;
		case 'moveOppositePlayer':
			hasRight = true;
			break;
	}

	return hasRight;
});

GameStream.permissions.read(function(eventName) {
	//Everybody can read
	return true;
});
