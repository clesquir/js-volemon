import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

class PlayersCollection extends Mongo.Collection {}

export const Players = new PlayersCollection('players');

if (Meteor.isServer) {
	Players._ensureIndex({gameId: 1});
	Players._ensureIndex({gameId: 1, userId: 1});
}
