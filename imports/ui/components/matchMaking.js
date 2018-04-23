import MatchMakingGameConfiguration from '/imports/api/games/configuration/MatchMakingGameConfiguration.js';
import {MatchMakers} from '/imports/api/games/matchMakers.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {getRandomInt} from '/imports/lib/utils.js';
import ButtonEnabler from '/imports/ui/util/ButtonEnabler.js';
import {Meteor} from "meteor/meteor";
import {Mongo} from "meteor/mongo";
import {Session} from "meteor/session";
import {Template} from "meteor/templating";
import './matchMaking.html';

class PlayableTournamentsCollection extends Mongo.Collection {}
const PlayableTournaments = new PlayableTournamentsCollection('playableTournaments');

const showModeSelection = function() {
	return !Session.get('matchMaking.modeSelection') && PlayableTournaments.find().count() > 0;
};

const showTournamentNotAvailable = function() {
	return (
		Session.get('matchMaking.tournamentId') &&
		!PlayableTournaments.findOne({_id: Session.get('matchMaking.tournamentId')})
	);
};

const showShapeSelection = function() {
	return !Session.get('matchMaking.shapeIsSelected');
};

class TipsUpdater {
	start() {
		let tipsIndex = getRandomInt(0, this.numberOfTips() - 1);
		let shuffledTips = _.chain(this.tips()).shuffle().value();

		Session.set('matchMaking.tips', shuffledTips[tipsIndex]);

		this.interval = Meteor.setInterval(() => {
			tipsIndex++;
			if (tipsIndex >= this.numberOfTips()) {
				tipsIndex = 0;
			}

			Session.set('matchMaking.tips', shuffledTips[tipsIndex]);
		}, 10000);
	}

	stop() {
		Meteor.clearInterval(this.interval);
	}

	numberOfTips() {
		return this.tips().length;
	}

	tips() {
		return [
			'A drop shot at the net can be deadly',
			'Every shape has their strengths and weaknesses',
			'Mastering the player shape is the key',
			'Loosing can be a way to unlock achievements',
			'Squeezing the ball against the wall can create a powerful shot',
			'Winning against a higher score player can be tough but it worths it',
			'Participating to all tournaments is a way to unlock achievement',
			'Rage quitting is forfeiting',
			'Random bonus can help you in a dangerous situation',
			'Some bonuses cancel other ones',
			'Some specific bonus combinations unlock achievements',
			'Waiting can be the best offensive',
			'Drop shot at the net works only against some people',
			`Following the monsters' eyes can help you locate an invisible ball`,
			`Being a small monster can help you avoid maluses`,
			`Stabilizing the ball can help you when paused`,
			`Big monster bonus can help you stabilize the auto-jump and the high-jump maluses`,
			`Things can get a little out of hand with the fast monster bonus`,
			`You can throw maluses on the enemy when on bonus repellent`,
			`Smashing the ball on a bonus is unpredictable`,
			`The only way to get an invincible bonus is through a random`,
			`The "empty" bonus can be a good weapon`,
			`Doing something suicidal can unlock achievements`,
			`Activating a smoke bomb at the net can fool the enemy`,
		];
	}
}

const closeMatchMaking = function() {
	tipsUpdater.stop();
	if (matchMakingTracker) {
		matchMakingTracker.stop();
	}
	Session.set('lightbox', false);
	Session.set('lightbox.closable', true);
};

const tipsUpdater = new TipsUpdater();
let matchMakingTracker;

Template.matchMaking.onCreated(function() {
	tipsUpdater.start();
	Meteor.subscribe('matchMakings');
	Meteor.subscribe('playableTournaments', Meteor.userId());
});

Template.matchMaking.destroyed = function() {
	closeMatchMaking();
	Session.set('matchMaking.modeSelection', null);
	Session.set('matchMaking.tournamentId', null);
	Session.set('matchMaking.shapeIsSelected', false);
	Session.set('matchMaking.onGoing', false);
};

Template.matchMaking.helpers({
	showModeSelection: function() {
		return showModeSelection();
	},

	tournaments: function() {
		return PlayableTournaments.find({}, {sort: [['startDate', 'asc']]});
	},

	name: function() {
		if (this.name) {
			return this.name;
		}

		return this.mode.name;
	},

	description: function() {
		if (this.description) {
			return this.description;
		}

		return this.mode.description;
	},

	hasPlayersWaiting: function(modeSelection, tournamentId) {
		const match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});

		return match && match.usersToMatch && match.usersToMatch.length > 0;
	},

	numberOfPlayersWaiting: function(modeSelection, tournamentId) {
		const match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});

		if (match && match.usersToMatch) {
			return match.usersToMatch.length;
		}

		return 0;
	},

	showTournamentNotAvailable: function() {
		return showTournamentNotAvailable();
	},

	showShapeSelection: function() {
		return !showModeSelection() && !showTournamentNotAvailable() && showShapeSelection();
	},

	shapeEditionAllowed: function() {
		const configuration = new MatchMakingGameConfiguration(PlayableTournaments, Session.get('matchMaking.tournamentId'));
		const allowedListOfShapes = configuration.allowedListOfShapes() || [];

		return allowedListOfShapes.length > 1;
	},

	selectedShape: function() {
		const configuration = new MatchMakingGameConfiguration(PlayableTournaments, Session.get('matchMaking.tournamentId'));
		const allowedListOfShapes = configuration.allowedListOfShapes() || [];
		const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});
		let selectedShape = null;

		if (userConfiguration && userConfiguration.matchMakingSelectedShape) {
			selectedShape = userConfiguration.matchMakingSelectedShape;
		}

		if (allowedListOfShapes.indexOf(selectedShape) === -1) {
			selectedShape = allowedListOfShapes[0];
		}

		return selectedShape;
	},

	allowedListOfShapes: function() {
		const configuration = new MatchMakingGameConfiguration(PlayableTournaments, Session.get('matchMaking.tournamentId'));

		return configuration.allowedListOfShapes() || [];
	},

	showStartMatchMaking: function() {
		return !showModeSelection() && !showTournamentNotAvailable() && !Session.get('matchMaking.onGoing');
	},

	isMatchMakingOnGoing: function() {
		return Session.get('matchMaking.onGoing');
	},

	selectedMode: function() {
		switch (Session.get('matchMaking.modeSelection')) {
			case '1vs1':
				return '1 VS 1';
			case 'tournament':
				const tournament = PlayableTournaments.findOne({_id: Session.get('matchMaking.tournamentId')});

				if (tournament) {
					return tournament.name || tournament.mode.name;
				}
		}

		return '';
	},

	selectedTournamentDescription: function() {
		switch (Session.get('matchMaking.modeSelection')) {
			case 'tournament':
				const tournament = PlayableTournaments.findOne({_id: Session.get('matchMaking.tournamentId')});

				if (tournament) {
					return tournament.description || tournament.mode.description;
				}
		}

		return '';
	},

	modeSelection: function() {
		return Session.get('matchMaking.modeSelection');
	},

	tournamentId: function() {
		return Session.get('matchMaking.tournamentId');
	},

	tournamentIdForUrl: function() {
		return Session.get('matchMaking.tournamentId') || 'none';
	},

	tips: function() {
		return Session.get('matchMaking.tips');
	}
});

Template.matchMaking.events({
	'click [data-action=select-mode-selection]': function(e) {
		Session.set('matchMaking.tournamentId', $(e.currentTarget).attr('data-tournament-id'));
		Session.set('matchMaking.modeSelection', $(e.currentTarget).attr('data-mode-selection'));
	},

	'click [data-action=start-match-making]': function(e) {
		ButtonEnabler.disableButton(e.target);
		Session.set('matchMaking.shapeIsSelected', true);
		Session.set('matchMaking.onGoing', true);

		matchMakingTracker = MatchMakers.find().observeChanges({
			changed: (id, fields) => {
				if (fields.hasOwnProperty('matched')) {
					const match = MatchMakers.findOne({'matched.users': Meteor.userId()});

					if (match) {
						let gameId;
						for (let matched of match.matched) {
							if (matched.users.indexOf(Meteor.userId()) !== -1) {
								gameId = matched.gameId;
								break;
							}
						}

						if (gameId) {
							Session.set('appLoadingMask', true);
							Session.set('appLoadingMask.text', 'Creating game...');

							if (match.tournamentId) {
								Router.go('tournamentGame', {tournamentId: match.tournamentId, gameId: gameId});
							} else {
								Router.go('game', {_id: gameId});
							}

							closeMatchMaking();
						}
					}
				}
			}
		});

		Meteor.call(
			'startMatchMaking',
			Session.get('matchMaking.modeSelection') || '1vs1',
			Session.get('matchMaking.tournamentId'),
			function(error) {}
		);
	},

	'click [data-action=cancel-match-making]': function(e) {
		ButtonEnabler.disableButton(e.target);
		Meteor.call('cancelMatchMaking', function(error, cancelAllowed) {
			ButtonEnabler.enableButton(e.target);
			if (cancelAllowed) {
				closeMatchMaking();
			}
		});
	}
});
