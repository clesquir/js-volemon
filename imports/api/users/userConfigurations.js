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

export const isTournamentValidator = function() {
	const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});

	return userConfiguration && userConfiguration.security && userConfiguration.security.tournamentValidator;
};

export const isTournamentAdministrator = function() {
	const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});

	return userConfiguration && userConfiguration.security && userConfiguration.security.tournamentAdministrator;
};

export const hasCreateTournamentAccess = function() {
	return isTournamentEditor() || isTournamentAdministrator();
};

export const hasEditTournamentAccess = function() {
	return isTournamentEditor() || isTournamentAdministrator();
};

export const hasApproveTournamentAccess = function() {
	return isTournamentValidator() || isTournamentAdministrator();
};
