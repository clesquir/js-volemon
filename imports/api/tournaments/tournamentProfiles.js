import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

class TournamentProfilesCollection extends Mongo.Collection {}

export const TournamentProfiles = new TournamentProfilesCollection('tournamentprofiles');

if (Meteor.isServer) {
	TournamentProfiles._ensureIndex({tournamentId: 1, userId: 1});
}
