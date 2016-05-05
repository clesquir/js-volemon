GameStream.permissions.write(function(eventName) {
	var userId = this.userId,
		hasRight = true;

	switch (eventName) {
		case 'play':
		case 'shakeLevelAndResumeOnTimerEnd':
			//Only host can send those event
			let game = Games.findOne({createdBy: userId});

			if (!game) {
				hasRight = false;
			}
			break;
	}

	return hasRight;
});

GameStream.permissions.read(function(eventName) {
	//Everybody can read
	return true;
});
