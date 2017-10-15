import {Mongo} from 'meteor/mongo';

class TournamentProfilesCollection extends Mongo.Collection {}

export const TournamentProfiles = new TournamentProfilesCollection('tournamentprofiles');
