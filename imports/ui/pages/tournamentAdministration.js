import {ONE_VS_ONE_GAME_MODE, TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import {
	hasApproveTournamentAccess,
	isTournamentAdministrator,
	isTournamentEditor
} from '/imports/api/users/userConfigurations.js';
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
		return tournament.status.id === 'submitted' && hasApproveTournamentAccess();
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
		return this.tournament.gameOverride[override] !== undefined;
	},

	modeOverriddenValue: function(override) {
		return this.tournament.gameOverride[override];
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
	const gameOverride = {};

	addToMode(gameOverride, 'forfeit-minimum-points', 'overriddenForfeitMinimumPoints');
	addToMode(gameOverride, 'maximum-points', 'overriddenMaximumPoints');
	addToMode(gameOverride, 'player-maximum-ball-hit', 'overriddenPlayerMaximumBallHit');
	addToMode(gameOverride, 'team-maximum-ball-hit', 'overriddenTeamMaximumBallHit');
	addToMode(gameOverride, 'force-practice-with-computer', 'overriddenForcePracticeWithComputer');

	addToMode(gameOverride, 'world-gravity', 'overriddenWorldGravity');
	addToMode(gameOverride, 'world-restitution', 'overriddenWorldRestitution');
	addToMode(gameOverride, 'net-ball-restitution', 'overriddenNetBallRestitution');
	addToMode(gameOverride, 'net-bonus-restitution', 'overriddenNetBonusRestitution');
	addToMode(gameOverride, 'bumper-restitution', 'overriddenBumperRestitution');
	addToMode(gameOverride, 'level-width', 'overriddenLevelWidth');
	addToMode(gameOverride, 'level-height', 'overriddenLevelHeight');
	addToMode(gameOverride, 'net-width', 'overriddenNetWidth');
	addToMode(gameOverride, 'net-height', 'overriddenNetHeight');
	addToMode(gameOverride, 'start-point-with-bumpers', 'overriddenStartPointWithBumpers');

	addToMode(gameOverride, 'soccer-net-enabled', 'overriddenSoccerNetEnabled');
	addToMode(gameOverride, 'soccer-net-distance-from-ground', 'overriddenSoccerNetDistanceFromGround');
	addToMode(gameOverride, 'soccer-net-width', 'overriddenSoccerNetWidth');
	addToMode(gameOverride, 'soccer-net-height', 'overriddenSoccerNetHeight');

	addToMode(gameOverride, 'ground-hit-enabled', 'overriddenGroundHitEnabled');
	addToMode(gameOverride, 'has-player-net-limit', 'overriddenHasPlayerNetLimit');
	addToMode(gameOverride, 'collides-with-teammate', 'overriddenCollidesWithTeammate');
	addToMode(gameOverride, 'collides-with-opponent', 'overriddenCollidesWithOpponent');
	addToMode(gameOverride, 'ball-collides-with-soccer-net-posts', 'overriddenBallCollidesWithSoccerNetPosts');
	addToMode(gameOverride, 'bonus-collides-with-soccer-net-posts', 'overriddenBonusCollidesWithSoccerNetPosts');
	addToMode(gameOverride, 'player-collides-with-soccer-net-posts', 'overriddenPlayerCollidesWithSoccerNetPosts');

	addToMode(gameOverride, 'allowed-list-of-shapes', 'overriddenAllowedListOfShapes');
	addToMode(gameOverride, 'list-of-shapes', 'overriddenListOfShapes');
	addToMode(gameOverride, 'current-player-shape', 'overriddenCurrentPlayerShape');
	addToMode(gameOverride, 'opponent-player-shape', 'overriddenOpponentPlayerShape');

	addToMode(gameOverride, 'player-initial-distance-from-wall', 'overriddenPlayerInitialDistanceFromWall');
	addToMode(gameOverride, 'teammate-initial-distance-from-wall', 'overriddenTeammateInitialDistanceFromWall');
	addToMode(gameOverride, 'player-initial-distance-from-ground', 'overriddenPlayerInitialDistanceFromGround');
	addToMode(gameOverride, 'teammate-initial-distance-from-ground', 'overriddenTeammateInitialDistanceFromGround');

	addToMode(gameOverride, 'is-hidden-to-himself', 'overriddenIsHiddenToHimself');
	addToMode(gameOverride, 'is-hidden-to-opponent', 'overriddenIsHiddenToOpponent');
	addToMode(gameOverride, 'initial-player-scale', 'overriddenInitialPlayerScale');
	addToMode(gameOverride, 'small-player-scale', 'overriddenSmallPlayerScale');
	addToMode(gameOverride, 'big-player-scale', 'overriddenBigPlayerScale');
	addToMode(gameOverride, 'initial-player-scale-player1', 'overriddenInitialPlayerScale_player1');
	addToMode(gameOverride, 'initial-player-scale-player2', 'overriddenInitialPlayerScale_player2');
	addToMode(gameOverride, 'initial-player-scale-player3', 'overriddenInitialPlayerScale_player3');
	addToMode(gameOverride, 'initial-player-scale-player4', 'overriddenInitialPlayerScale_player4');
	addToMode(gameOverride, 'initial-player-mass', 'overriddenInitialPlayerMass');
	addToMode(gameOverride, 'small-player-mass', 'overriddenSmallPlayerMass');
	addToMode(gameOverride, 'big-player-mass', 'overriddenBigPlayerMass');
	addToMode(gameOverride, 'initial-player-mass-player1', 'overriddenInitialPlayerMass_player1');
	addToMode(gameOverride, 'initial-player-mass-player2', 'overriddenInitialPlayerMass_player2');
	addToMode(gameOverride, 'initial-player-mass-player3', 'overriddenInitialPlayerMass_player3');
	addToMode(gameOverride, 'initial-player-mass-player4', 'overriddenInitialPlayerMass_player4');
	addToMode(gameOverride, 'player-x-velocity', 'overriddenPlayerXVelocity');
	addToMode(gameOverride, 'player-y-velocity', 'overriddenPlayerYVelocity');
	addToMode(gameOverride, 'player-dropshot-enabled', 'overriddenPlayerDropshotEnabled');
	addToMode(gameOverride, 'player-smash-enabled', 'overriddenPlayerSmashEnabled');
	addToMode(gameOverride, 'player-vertical-move-multiplayer-big', 'overriddenPlayerVerticalMoveMultiplierBig');
	addToMode(gameOverride, 'player-horizontal-move-multiplayer-slow', 'overriddenPlayerHorizontalMoveMultiplierSlow');
	addToMode(gameOverride, 'player-horizontal-move-multiplayer-fast', 'overriddenPlayerHorizontalMoveMultiplierFast');

	addToMode(gameOverride, 'initial-ball-scale', 'overriddenInitialBallScale');
	addToMode(gameOverride, 'small-ball-scale', 'overriddenSmallBallScale');
	addToMode(gameOverride, 'big-ball-scale', 'overriddenBigBallScale');
	addToMode(gameOverride, 'initial-ball-mass', 'overriddenInitialBallMass');
	addToMode(gameOverride, 'small-ball-mass', 'overriddenSmallBallMass');
	addToMode(gameOverride, 'big-ball-mass', 'overriddenBigBallMass');
	addToMode(gameOverride, 'ball-rebound-on-player-enabled', 'overriddenBallReboundOnPlayerEnabled');
	addToMode(gameOverride, 'ball-velocity-on-rebound-on-player', 'overriddenBallVelocityOnReboundOnPlayer');

	addToMode(gameOverride, 'available-bonuses', 'overriddenAvailableBonuses');
	addToMode(gameOverride, 'available-bonuses-for-random', 'overriddenAvailableBonusesForRandom');
	addToMode(gameOverride, 'has-bonuses', 'overriddenHasBonuses');
	addToMode(gameOverride, 'bonus-duration', 'overriddenBonusDuration');
	addToMode(gameOverride, 'maximum-bonuses-on-screen', 'overriddenMaximumBonusesOnScreen');
	addToMode(gameOverride, 'maximum-bonuses-in-a-point', 'overriddenMaximumBonusesInAPoint');
	addToMode(gameOverride, 'bonus-spawn-minimum-frequence', 'overriddenBonusSpawnMinimumFrequence');
	addToMode(gameOverride, 'bonus-spawn-initial-minimum-frequence', 'overriddenBonusSpawnInitialMinimumFrequence');
	addToMode(gameOverride, 'bonus-spawn-initial-maximum-frequence', 'overriddenBonusSpawnInitialMaximumFrequence');
	addToMode(gameOverride, 'bonus-warp-distance-from-center', 'overriddenBonusWarpDistanceFromCenter');
	addToMode(gameOverride, 'bonus-scale', 'overriddenBonusScale');
	addToMode(gameOverride, 'bonus-mass', 'overriddenBonusMass');
	addToMode(gameOverride, 'bumper-scale', 'overriddenBumperScale');

	return gameOverride;
};

const addToMode = function(gameOverride, id, key) {
	const value = modeValueOrUndefined(id);

	if (value !== undefined) {
		gameOverride[key] = value;
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
