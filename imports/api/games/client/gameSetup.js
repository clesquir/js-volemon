export const playerDeclinedRematch = function(players) {
	return declinedRematchPlayers(players).length > 0;
};

export const declinedRematchPlayers = function(players) {
	const declined = [];

	players.forEach(function(player) {
		if (player.askedForRematch === false) {
			declined.push(player);
		}
	});

	return declined;
};

export const playerLeftGame = function(players) {
	return leftTheGamePlayers(players).length > 0;
};

export const leftTheGamePlayers = function(players) {
	const left = [];

	players.forEach(function(player) {
		if (player.hasQuit !== false) {
			left.push(player);
		}
	});

	return left;
};

export const playerAcceptedRematch = function(players) {
	let hasAccepted = false;

	players.forEach(function(player) {
		if (player.askedForRematch === true) {
			hasAccepted = true;
		}
	});

	return hasAccepted;
};

export const playerHasNotRepliedRematch = function(players) {
	let hasNotReplied = false;

	players.forEach(function(player) {
		if (player.askedForRematch === undefined || player.askedForRematch === null) {
			hasNotReplied = true;
		}
	});

	return hasNotRepliedRematchPlayers(players).length > 0;
};

export const hasNotRepliedRematchPlayers = function(players) {
	const notReplied = [];

	players.forEach(function(player) {
		if (player.askedForRematch === undefined || player.askedForRematch === null) {
			notReplied.push(player);
		}
	});

	return notReplied;
};

export const currentPlayerAcceptedRematch = function(players, userId) {
	let hasAccepted = false;

	players.forEach(function(player) {
		if (player.userId === userId && player.askedForRematch === true) {
			hasAccepted = true;
		}
	});

	return hasAccepted;
};

export const currentPlayerHasRepliedRematch = function(players, userId) {
	let hasReplied = false;

	players.forEach(function(player) {
		if (player.userId === userId && player.askedForRematch !== undefined && player.askedForRematch !== null) {
			hasReplied = true;
		}
	});

	return hasReplied;
};
