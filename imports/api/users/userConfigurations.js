import {Mongo} from 'meteor/mongo';

class UserConfigurationsCollection extends Mongo.Collection {}

export const UserConfigurations = new UserConfigurationsCollection('userconfigurations');

export const isTournamentEditor = function() {
	const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});

	return userConfiguration && userConfiguration.security && userConfiguration.security.tournamentEditor;
};

export const isTournamentAdministrator = function() {
	const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});

	return userConfiguration && userConfiguration.security && userConfiguration.security.tournamentAdministrator;
};
