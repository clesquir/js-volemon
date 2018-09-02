import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

class TournamentEloScoresCollection extends Mongo.Collection {}

export const TournamentEloScores = new TournamentEloScoresCollection('tournamenteloscores');

if (Meteor.isServer) {
	TournamentEloScores._ensureIndex({gameId: 1});
	TournamentEloScores._ensureIndex({tournamentId: 1});
	TournamentEloScores._ensureIndex({tournamentId: 1, userId: 1});
}
