import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

class EloScoresCollection extends Mongo.Collection {}

export const EloScores = new EloScoresCollection('eloscores');

if (Meteor.isServer) {
	EloScores._ensureIndex({gameId: 1});
}
