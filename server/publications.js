Meteor.publish('userData', function() {
	return Meteor.users.find({_id: this.userId});
});

Meteor.publish('profileData', function() {
	return Profiles.find({userId: this.userId});
});

Meteor.publish('recentProfileGames', function() {
	var players = Players.find({userId: this.userId}),
		gamesIds = [];

	//Fetch Games related to that players and Players related to those games and NEQ to this user
	players.forEach((player) => {
		gamesIds.push(player.gameId);
	});

	return [
		Games.find({_id: {$in: gamesIds}, status: Constants.GAME_STATUS_FINISHED}, {sort: [['createdAt', 'desc']], limit: 5}),
		Players.find({userId: {$ne:this.userId}, gameId: {$in: gamesIds}})
	];
});

Meteor.publish('ranks', function() {
	return [
		Meteor.users.find(),
		Profiles.find(),
		EloScores.find()
	];
});

Meteor.publish('games', function() {
	return [
		Games.find({isPrivate: 0}),
		Players.find()
	];
});

Meteor.publish('game', function(id) {
	return [
		Games.find({_id: id}),
		Players.find({gameId: id})
	];
});
