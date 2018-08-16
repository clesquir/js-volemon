import {ALL_BONUSES, ALL_BONUSES_FOR_RANDOM} from '/imports/api/games/bonusConstants.js';
import {ONE_VS_ONE_GAME_MODE, TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import {PLAYER_ALLOWED_LIST_OF_SHAPES, PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js';
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
	},

	hasBonuses: function() {
		return [{id: 1, name: 'Yes'}, {id: 0, name: 'No'}];
	},

	availableBonuses: function() {
		const options = [];

		for (let bonus of ALL_BONUSES) {
			options.push({id: bonus, name: bonus});
		}

		return options;
	},

	availableBonusesForRandom: function() {
		const options = [];

		for (let bonus of ALL_BONUSES_FOR_RANDOM) {
			options.push({id: bonus, name: bonus});
		}

		return options;
	},

	listOfShapes: function() {
		const options = [];

		for (let shape of PLAYER_LIST_OF_SHAPES) {
			options.push({id: shape, name: shape});
		}

		return options;
	},

	allowedListOfShapes: function() {
		const options = [];

		for (let shape of PLAYER_ALLOWED_LIST_OF_SHAPES) {
			options.push({id: shape, name: shape});
		}

		return options;
	},

	overridesNumberOfLostAllowed: function() {
		return !!this.tournament.numberOfLostAllowed;
	},

	numberOfLostAllowed: function() {
		return this.tournament.numberOfLostAllowed;
	},

	modeOverridden: function(override) {
		return this.tournament.mode[override] !== undefined;
	},

	modeOverriddenValue: function(override) {
		return this.tournament.mode[override];
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
		$('#save-checkmark').removeClass('activated-checkmark');

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
					modeValueOrUndefined('number-of-lost-allowed'),
					modeOptions(),
					function(error) {
						disableButton(e, false);
						if (error !== undefined) {
							errorLabelContainer.show();
							errorLabelContainer.html(error.reason);
						} else {
							$('#save-checkmark').removeClass('activated-checkmark');
							$('#save-checkmark').addClass('activated-checkmark');
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

const modeOptions = function() {
	const mode = {};

	addToMode(mode, 'available-bonuses', 'overriddenAvailableBonuses');
	addToMode(mode, 'available-bonuses-for-random', 'overriddenAvailableBonusesForRandom');
	addToMode(mode, 'has-bonuses', 'overriddenHasBonuses');
	addToMode(mode, 'bonus-duration', 'overriddenBonusDuration');
	addToMode(mode, 'bonus-spawn-initial-minimum-frequence', 'overriddenBonusSpawnInitialMinimumFrequence');
	addToMode(mode, 'bonus-spawn-initial-maximum-frequence', 'overriddenBonusSpawnInitialMaximumFrequence');
	addToMode(mode, 'allowed-list-of-shapes', 'overriddenAllowedListOfShapes');
	addToMode(mode, 'list-of-shapes', 'overriddenListOfShapes');
	addToMode(mode, 'current-player-shape', 'overriddenCurrentPlayerShape');
	addToMode(mode, 'forfeit-minimum-points', 'overriddenForfeitMinimumPoints');
	addToMode(mode, 'maximum-points', 'overriddenMaximumPoints');
	addToMode(mode, 'net-height', 'overriddenNetHeight');
	addToMode(mode, 'level-width', 'overriddenLevelWidth');
	addToMode(mode, 'level-height', 'overriddenLevelHeight');
	addToMode(mode, 'world-gravity', 'overriddenWorldGravity');
	addToMode(mode, 'world-restitution', 'overriddenWorldRestitution');
	addToMode(mode, 'player-x-velocity', 'overriddenPlayerXVelocity');
	addToMode(mode, 'player-y-velocity', 'overriddenPlayerYVelocity');

	return mode;
};

const addToMode = function(mode, id, key) {
	const value = modeValueOrUndefined(id);

	if (value !== undefined) {
		mode[key] = value;
	}
};

const modeValueOrUndefined = function(id) {
	if ($(`#check-${id}`).is(':checked')) {
		return $(`#${id}`).val();
	}

	return undefined;
};
