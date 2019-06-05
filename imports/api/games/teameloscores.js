import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

class TeamEloScoresCollection extends Mongo.Collection {}

export const TeamEloScores = new TeamEloScoresCollection('teameloscores');

if (Meteor.isServer) {
	TeamEloScores._ensureIndex({gameId: 1});
	TeamEloScores._ensureIndex({userId: 1});
}
