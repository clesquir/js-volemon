GameStream = new Meteor.Streamer('game');

if (Meteor.isServer) {
	GameStream.allowRead('all');
	GameStream.allowWrite('all');
}
