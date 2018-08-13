import {ONE_VS_ONE_GAME_MODE, TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import {isTournamentAdministrator, isTournamentEditor} from '/imports/api/users/userConfigurations.js';
import '/imports/ui/util/error-messages.js';
import {disableButton, removeErrorLabelContainer, validateFieldsPresenceAndMarkInvalid} from '/imports/ui/util/form.js';
import {Router} from 'meteor/iron:router';
import {Meteor} from 'meteor/meteor';
import * as Moment from 'meteor/momentjs:moment';
import {Mongo} from "meteor/mongo";
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

import './tournamentAdmin.html';

Template.tournamentAdmin.helpers({
	gameModes: function(tournament) {
		return [
			{id: ONE_VS_ONE_GAME_MODE, name: '1 VS 1', isSelected: tournament.gameMode === ONE_VS_ONE_GAME_MODE},
			{id: TWO_VS_TWO_GAME_MODE, name: '2 VS 2', isSelected: tournament.gameMode === TWO_VS_TWO_GAME_MODE},
		];
	},

	tournamentDate: function(date) {
		return Moment.moment(date, "YYYY-MM-DD ZZ").format('YYYY-MM-DD');
	},

	canEditTournament: function(tournament) {
		return (
			isTournamentEditor() &&
			tournament.editor.id === Meteor.userId()
		) ||
		isTournamentAdministrator();
	},

	canApproveTournament: function() {
		return isTournamentAdministrator();
	}
});

Template.tournamentAdmin.events({
	'submit form[name=tournament-admin]': function(e) {
		e.preventDefault();

		const nameField = $(e.target).find('#tournament-name-field');
		const descriptionField = $(e.target).find('#tournament-description-field');
		const gameModeField = $(e.target).find('#tournament-game-mode-field');
		const startField = $(e.target).find('#tournament-start-field');
		const endField = $(e.target).find('#tournament-end-field');
		const errorLabelContainer = $(e.target).find('.error-label-container');

		removeErrorLabelContainer(errorLabelContainer);

		Promise.resolve()
			.then(
				function() {
					if (
						validateFieldsPresenceAndMarkInvalid(
							$(e.target),
							[
								nameField,
								descriptionField,
								startField,
								endField,
							]
						)
					) {
						return Promise.reject();
					} else {
						return Promise.resolve();
					}
				}
			)
			.then(function() {
				disableButton(e, true);
				Meteor.call(
					'updateTournament',
					Session.get('tournament'),
					nameField.val(),
					descriptionField.val(),
					gameModeField.val(),
					startField.val(),
					endField.val(),
					function(error) {
						disableButton(e, false);
						if (error !== undefined) {
							errorLabelContainer.show();
							errorLabelContainer.html(error.reason);
						}
					}
				);
			})
			.catch(function() {});
	},

	'click [data-action="approve-draft-tournament"]': function(e) {
		const errorLabelContainer = $(e.target).find('.error-label-container');

		removeErrorLabelContainer(errorLabelContainer);

		disableButton(e, true);
		Meteor.call(
			'approveDraftTournament',
			Session.get('tournament'),
			function(error) {
				disableButton(e, false);
				if (error !== undefined) {
					errorLabelContainer.show();
					errorLabelContainer.html(error.reason);
				} else {
					Router.go('tournaments');
				}
			}
		);
	}
});
