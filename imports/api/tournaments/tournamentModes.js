import {Mongo} from 'meteor/mongo';

class TournamentModesCollection extends Mongo.Collection {}

export const TournamentModes = new TournamentModesCollection('tournamentmodes');
