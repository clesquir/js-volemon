import {ONE_VS_ONE_GAME_MODE, TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import {isTournamentAdministrator, isTournamentEditor} from '/imports/api/users/userConfigurations.js';
import ButtonEnabler from '/imports/ui/util/ButtonEnabler.js';
import '/imports/ui/util/error-messages.js';
import {removeErrorLabelContainer, validateFieldsPresenceAndMarkInvalid} from '/imports/ui/util/form.js';
import {Router} from 'meteor/iron:router';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import moment from 'moment';

import './tournamentAdministration.html';

Template.tournamentAdministration.helpers({
	gameModes: function(tournament) {
		return [
			{id: ONE_VS_ONE_GAME_MODE, name: '1 VS 1', isSelected: tournament.gameMode === ONE_VS_ONE_GAME_MODE},
			{id: TWO_VS_TWO_GAME_MODE, name: '2 VS 2', isSelected: tournament.gameMode === TWO_VS_TWO_GAME_MODE}
		];
	},

	tournamentDate: function(date) {
		return moment(date, "YYYY-MM-DD").format('YYYY-MM-DD');
	},

	canOnlyViewTournament: function(tournament) {
		return !canSaveTournament(tournament);
	},

	canSaveTournament: function(tournament) {
		return canSaveTournament(tournament);
	},

	canSubmitTournament: function(tournament) {
		return tournament.status.id === 'draft' && canEditDraftTournament(tournament);
	},

	canReturnToDraftTournament: function(tournament) {
		return tournament.status.id === 'submitted' && canEditDraftTournament(tournament);
	},

	canApproveTournament: function(tournament) {
		return tournament.status.id === 'submitted' && isTournamentAdministrator();
	},

	booleanOptions: function() {
		return [{id: "1", name: 'Yes'}, {id: "0", name: 'No'}];
	},

	playerShapeDisplays: function() {
		return [{id: 'hidden', name: 'Hidden'}];
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

Template.tournamentAdministration.events({
	'submit form[name=tournament-administration]': function(e) {
		e.preventDefault();

		saveDraftTournament();
	},

	'click [data-action="try-tournament"]': function() {
		const tryTournament = function() {
			const form = $('#tournament-administration-form');
			ButtonEnabler.disableButton(form);
			Meteor.call(
				'createTournamentPracticeGame',
				Session.get('tournament'),
				function(error, gameId) {
					Session.set('appLoadingMask', true);
					Session.set('appLoadingMask.text', 'Creating game...');

					Meteor.call('setPlayerIsReady', gameId, function() {
						Router.go('tournamentGame', {tournamentId: Session.get('tournament'), gameId: gameId});
					});
				}
			);
		};

		if (canSaveTournament(this.tournament)) {
			saveDraftTournament(tryTournament);
		} else {
			tryTournament();
		}
	},

	'click [data-action="submit-tournament"]': function() {
		saveDraftTournament(
			function() {
				const form = $('#tournament-administration-form');
				ButtonEnabler.disableButton(form);
				Meteor.call(
					'submitTournament',
					Session.get('tournament'),
					function(error) {
						ButtonEnabler.enableButton(form);
						if (error !== undefined) {
							const errorLabelContainer = $('.error-label-container');
							errorLabelContainer.show();
							errorLabelContainer.html(error.reason);
						} else {
							$('#save-checkmark').removeClass('activated-checkmark');
							$('#save-checkmark').addClass('activated-checkmark');
						}
					}
				);
			}
		);
	},

	'click [data-action="return-to-draft-tournament"]': function() {
		const returnToDraftTournament = function() {
			const form = $('#tournament-administration-form');
			ButtonEnabler.disableButton(form);
			Meteor.call(
				'draftTournament',
				Session.get('tournament'),
				function(error) {
					ButtonEnabler.enableButton(form);
					if (error !== undefined) {
						const errorLabelContainer = $('.error-label-container');
						errorLabelContainer.show();
						errorLabelContainer.html(error.reason);
					} else {
						$('#save-checkmark').removeClass('activated-checkmark');
						$('#save-checkmark').addClass('activated-checkmark');
					}
				}
			);
		};

		if (canSaveTournament(this.tournament)) {
			saveDraftTournament(returnToDraftTournament);
		} else {
			returnToDraftTournament();
		}
	},

	'click [data-action="approve-tournament"]': function(e) {
		const approvedTournament = function() {
			const form = $('#tournament-administration-form');
			ButtonEnabler.disableButton(form);
			Meteor.call(
				'approveTournament',
				Session.get('tournament'),
				function(error) {
					ButtonEnabler.enableButton(form);
					if (error !== undefined) {
						ButtonEnabler.enableButton(form);
						const errorLabelContainer = $('.error-label-container');
						errorLabelContainer.show();
						errorLabelContainer.html(error.reason);
					} else {
						$('#save-checkmark').removeClass('activated-checkmark');
						$('#save-checkmark').addClass('activated-checkmark');
					}
				}
			);
		};

		if (canSaveTournament(this.tournament)) {
			saveDraftTournament(approvedTournament);
		} else {
			approvedTournament();
		}
	}
});

const canEditDraftTournament = function(tournament) {
	return (
		(isTournamentEditor() && tournament.editor.id === Meteor.userId()) ||
		isTournamentAdministrator()
	);
};

const canSaveTournament = function(tournament) {
	return (
		(isTournamentEditor() && tournament.status.id === 'draft' && canEditDraftTournament(tournament)) ||
		isTournamentAdministrator()
	);
};

const modeOptions = function() {
	const mode = {};

	addToMode(mode, 'world-gravity', 'overriddenWorldGravity');
	addToMode(mode, 'world-restitution', 'overriddenWorldRestitution');
	addToMode(mode, 'level-width', 'overriddenLevelWidth');
	addToMode(mode, 'level-height', 'overriddenLevelHeight');
	addToMode(mode, 'net-width', 'overriddenNetWidth');
	addToMode(mode, 'net-height', 'overriddenNetHeight');
	addToMode(mode, 'soccer-net-height', 'overriddenSoccerNetHeight');
	addToMode(mode, 'soccer-net-distance-from-ground', 'overriddenSoccerNetDistanceFromGround');
	addToMode(mode, 'ground-hit-enabled', 'overriddenGroundHitEnabled');
	addToMode(mode, 'soccer-net-enabled', 'overriddenSoccerNetEnabled');
	addToMode(mode, 'has-player-net-limit', 'overriddenHasPlayerNetLimit');
	addToMode(mode, 'collides-with-teammate', 'overriddenCollidesWithTeammate');
	addToMode(mode, 'collides-with-opponent', 'overriddenCollidesWithOpponent');

	addToMode(mode, 'available-bonuses', 'overriddenAvailableBonuses');
	addToMode(mode, 'available-bonuses-for-random', 'overriddenAvailableBonusesForRandom');
	addToMode(mode, 'has-bonuses', 'overriddenHasBonuses');
	addToMode(mode, 'bonus-duration', 'overriddenBonusDuration');
	addToMode(mode, 'maximum-bonuses-on-screen', 'overriddenMaximumBonusesOnScreen');
	addToMode(mode, 'bonus-spawn-minimum-frequence', 'overriddenBonusSpawnMinimumFrequence');
	addToMode(mode, 'bonus-spawn-initial-minimum-frequence', 'overriddenBonusSpawnInitialMinimumFrequence');
	addToMode(mode, 'bonus-spawn-initial-maximum-frequence', 'overriddenBonusSpawnInitialMaximumFrequence');
	addToMode(mode, 'bonus-scale', 'overriddenBonusScale');
	addToMode(mode, 'bonus-mass', 'overriddenBonusMass');

	addToMode(mode, 'allowed-list-of-shapes', 'overriddenAllowedListOfShapes');
	addToMode(mode, 'list-of-shapes', 'overriddenListOfShapes');
	addToMode(mode, 'current-player-shape', 'overriddenCurrentPlayerShape');
	addToMode(mode, 'opponent-player-shape', 'overriddenOpponentPlayerShape');
	addToMode(mode, 'is-hidden-to-himself', 'overriddenIsHiddenToHimself');
	addToMode(mode, 'is-hidden-to-opponent', 'overriddenIsHiddenToOpponent');
	addToMode(mode, 'initial-player-scale', 'overriddenInitialPlayerScale');
	addToMode(mode, 'initial-player-scale-player1', 'overriddenInitialPlayerScale_player1');
	addToMode(mode, 'initial-player-scale-player2', 'overriddenInitialPlayerScale_player2');
	addToMode(mode, 'initial-player-scale-player3', 'overriddenInitialPlayerScale_player3');
	addToMode(mode, 'initial-player-scale-player4', 'overriddenInitialPlayerScale_player4');
	addToMode(mode, 'small-player-scale', 'overriddenSmallPlayerScale');
	addToMode(mode, 'big-player-scale', 'overriddenBigPlayerScale');
	addToMode(mode, 'initial-ball-scale', 'overriddenInitialBallScale');
	addToMode(mode, 'small-ball-scale', 'overriddenSmallBallScale');
	addToMode(mode, 'big-ball-scale', 'overriddenBigBallScale');
	addToMode(mode, 'initial-player-mass', 'overriddenInitialPlayerMass');
	addToMode(mode, 'initial-player-mass-player1', 'overriddenInitialPlayerMass_player1');
	addToMode(mode, 'initial-player-mass-player2', 'overriddenInitialPlayerMass_player2');
	addToMode(mode, 'initial-player-mass-player3', 'overriddenInitialPlayerMass_player3');
	addToMode(mode, 'initial-player-mass-player4', 'overriddenInitialPlayerMass_player4');
	addToMode(mode, 'small-player-mass', 'overriddenSmallPlayerMass');
	addToMode(mode, 'big-player-mass', 'overriddenBigPlayerMass');
	addToMode(mode, 'player-vertical-move-multiplayer-big', 'overriddenPlayerVerticalMoveMultiplierBig');
	addToMode(mode, 'player-horizontal-move-multiplayer-slow', 'overriddenPlayerHorizontalMoveMultiplierSlow');
	addToMode(mode, 'player-horizontal-move-multiplayer-fast', 'overriddenPlayerHorizontalMoveMultiplierFast');
	addToMode(mode, 'force-practice-with-computer', 'overriddenForcePracticeWithComputer');

	addToMode(mode, 'initial-ball-mass', 'overriddenInitialBallMass');
	addToMode(mode, 'small-ball-mass', 'overriddenSmallBallMass');
	addToMode(mode, 'big-ball-mass', 'overriddenBigBallMass');

	addToMode(mode, 'forfeit-minimum-points', 'overriddenForfeitMinimumPoints');
	addToMode(mode, 'maximum-points', 'overriddenMaximumPoints');
	addToMode(mode, 'player-maximum-ball-hit', 'overriddenPlayerMaximumBallHit');
	addToMode(mode, 'team-maximum-ball-hit', 'overriddenTeamMaximumBallHit');

	addToMode(mode, 'player-x-velocity', 'overriddenPlayerXVelocity');
	addToMode(mode, 'player-y-velocity', 'overriddenPlayerYVelocity');
	addToMode(mode, 'player-dropshot-enabled', 'overriddenPlayerDropshotEnabled');
	addToMode(mode, 'player-smash-enabled', 'overriddenPlayerSmashEnabled');
	addToMode(mode, 'ball-rebound-on-player-enabled', 'overriddenBallReboundOnPlayerEnabled');
	addToMode(mode, 'ball-velocity-on-rebound-on-player', 'overriddenBallVelocityOnReboundOnPlayer');

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

const saveDraftTournament = function(callback) {
	const form = $('#tournament-administration-form');
	const nameField = $('#tournament-name-field');
	const descriptionField = $('#tournament-description-field');
	const gameModeField = $('#tournament-game-mode-field');
	const startField = $('#tournament-start-field');
	const endField = $('#tournament-end-field');
	const errorLabelContainer = $('.error-label-container');

	removeErrorLabelContainer(errorLabelContainer);
	$('#save-checkmark').removeClass('activated-checkmark');

	Promise.resolve()
		.then(
			function() {
				if (
					validateFieldsPresenceAndMarkInvalid(
						form,
						[
							nameField,
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
			ButtonEnabler.disableButton(form);
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
					ButtonEnabler.enableButton(form);
					if (error !== undefined) {
						errorLabelContainer.show();
						errorLabelContainer.html(error.reason);
					} else {
						$('#save-checkmark').removeClass('activated-checkmark');
						$('#save-checkmark').addClass('activated-checkmark');

						if (callback) {
							callback();
						}
					}
				}
			);
		})
		.catch(function() {});
};
