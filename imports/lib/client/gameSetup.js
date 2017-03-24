export const playerDeclinedRematch = function(players) {
	let hasDeclined = false;

	players.forEach(function(player) {
		if (player.askedForRematch === false) {
			hasDeclined = true;
		}
	});

	return hasDeclined;
};

export const playerLeftGame = function(players) {
	let hasQuit = false;

	players.forEach(function(player) {
		if (player.hasQuit !== false) {
			hasQuit = true;
		}
	});

	return hasQuit;
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

	return hasNotReplied;
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
