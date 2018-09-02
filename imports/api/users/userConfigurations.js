import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

class UserConfigurationsCollection extends Mongo.Collection {}

export const UserConfigurations = new UserConfigurationsCollection('userconfigurations');

if (Meteor.isServer) {
	UserConfigurations._ensureIndex({userId: 1});
}

export const isTournamentEditor = function() {
	const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});

	return userConfiguration && userConfiguration.security && userConfiguration.security.tournamentEditor;
};

export const isTournamentAdministrator = function() {
	const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});

	return userConfiguration && userConfiguration.security && userConfiguration.security.tournamentAdministrator;
};
