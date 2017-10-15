import {Mongo} from 'meteor/mongo';

class TournamentEloScoresCollection extends Mongo.Collection {}

export const TournamentEloScores = new TournamentEloScoresCollection('tournamenteloscores');
