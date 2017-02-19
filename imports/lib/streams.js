export const GameStartStream = new Meteor.Streamer('gameStart');
export const ServerStream = new Meteor.Streamer('server');
export const ClientStream = new Meteor.Streamer('client');

if (Meteor.isServer) {
	GameStartStream.allowRead('all');
	GameStartStream.allowWrite('all');
	ServerStream.allowRead('all');
	ServerStream.allowWrite('all');
	ClientStream.allowRead('all');
	ClientStream.allowWrite('all');
}
