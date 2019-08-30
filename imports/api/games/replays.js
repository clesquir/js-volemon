import {Mongo} from 'meteor/mongo';
import {Meteor} from 'meteor/meteor';

class ReplaysCollection extends Mongo.Collection {}

export const Replays = new ReplaysCollection('replays');

if (Meteor.isServer) {
	Replays._ensureIndex({gameId: 1});
}
