import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {HomeController} from '/imports/startup/client/controllers/HomeController.js';
import GameData from '/imports/game/client/GameData.js';
import GameInitiator from '/imports/game/client/GameInitiator.js';
import GameReaction from '/imports/game/client/GameReaction.js';
import GameRematch from '/imports/game/client/GameRematch.js';
import ServerNormalizedTime from '/imports/game/client/ServerNormalizedTime.js';
import ClientSocketIo from '/imports/lib/stream/client/ClientSocketIo.js';

import '/imports/ui/pages/home.js';
import '/imports/ui/pages/gamesList.js';

import '/imports/ui/components/achievementPopup.js';
import '/imports/ui/components/achievements.js';
import '/imports/ui/components/reactions.js';
import '/imports/ui/components/recentGames.js';
import '/imports/ui/components/statistics.js';

Router.configure({
	layoutTemplate: 'app',
	loadingTemplate: 'loading',
	waitOn: function() {
		return [
			Meteor.subscribe('userData'),
			Meteor.subscribe('achievements'),
			Meteor.subscribe('userAchievements', Meteor.userId())
		];
	}
});

Router.map(function() {
	this.route('home', {
		path: '/',
		controller: HomeController
	});

	//This is use for various game environment tests
	if (Meteor.isDevelopment) {
		this.route('test-environment', {
			path: '/test-environment'
		});
	}

	this.route('games-list', {
		path: '/games-list',
		waitOn: function() {
			return Meteor.subscribe('games');
		},
		data: function() {
			return {
				games: Games.find({}, {sort: [['createdAt', 'desc']]})
			};
		}
	});

	this.route('rank', {
		path: '/rank',
		waitOn: function() {
			return Meteor.subscribe('ranks');
		},
		data: function() {
			return {
				users: Meteor.users.find(),
				profiles: Profiles.find({}, {sort: [['eloRating', 'desc']]})
			};
		}
	});

	this.route('game', {
		path: '/:_id',
		waitOn: function() {
			return Meteor.subscribe('game', this.params._id);
		},
		data: function() {
			return {
				game: Games.findOne(this.params._id),
				players: Players.find({gameId: this.params._id}, {sort: ['joinedAt']}),
				profiles: Profiles.find(),
				eloScores: EloScores.find({gameId: this.params._id})
			};
		},
		onBeforeAction: function() {
			const game = Games.findOne(this.params._id);

			if (!game) {
				Router.go('home');
			} else {
				Session.set('game', this.params._id);
			}

			this.next();
		},
		action: function() {
			this.render('game');

			let connectionIndicatorTimer;

			Template.game.rendered = function() {
				stream = new ClientSocketIo();
				stream.init();
				stream.connect(Session.get('game'));
				gameData = new GameData(Session.get('game'));
				gameData.init();
				serverNormalizedTime = new ServerNormalizedTime();
				gameInitiator = new GameInitiator(Session.get('game'), stream, gameData, serverNormalizedTime);
				gameInitiator.init();
				gameRematch = new GameRematch(Session.get('game'), gameData);
				gameRematch.init();
				gameReaction = new GameReaction(Session.get('game'), stream, gameData, gameInitiator);
				gameReaction.init();

				$(window).bind('beforeunload', function() {
					if (Session.get('game')) {
						Meteor.call('quitGame', Session.get('game'), function() {});

						if (gameInitiator) {
							gameInitiator.stop();
						}
						if (gameRematch) {
							gameRematch.stop();
						}
						if (gameReaction) {
							gameReaction.stop();
						}
						if (stream) {
							stream.disconnect(Session.get('game'));
						}
					}
				});

				const setConnectionIndicatorClass = function() {
					let connectionIndicatorClass = 'connection-indicator-light-gray';

					if (stream) {
						if (stream.usingPeerConnection) {
							connectionIndicatorClass = 'connection-indicator-light-green';
						} else if (stream.usingP2P) {
							connectionIndicatorClass = 'connection-indicator-light-yellow';
						} else if (stream.usingSocket) {
							connectionIndicatorClass = 'connection-indicator-light-red';
						}
					}

					Session.set('connection-indicator-class', connectionIndicatorClass);

					connectionIndicatorTimer = Meteor.setTimeout(setConnectionIndicatorClass, 1000);
				};

				connectionIndicatorTimer = Meteor.setTimeout(setConnectionIndicatorClass, 1000);

				Template.game.rendered = null;
			};

			Template.game.destroyed = function() {
				Meteor.clearTimeout(connectionIndicatorTimer);

				Template.game.destroyed = null;
			};
		},
		onStop: function() {
			Meteor.call('quitGame', Session.get('game'), function() {});

			if (gameInitiator) {
				gameInitiator.stop();
			}
			if (gameRematch) {
				gameRematch.stop();
			}
			if (gameReaction) {
				gameReaction.stop();
			}
			if (stream) {
				stream.disconnect(Session.get('game'));
			}

			Session.set('game', undefined);
			Session.set('userCurrentlyPlaying', false);
		}
	});
});

/** @type {Stream} */
export let stream = null;
/** @type {GameData} */
let gameData = null;
/** @type {ServerNormalizedTime} */
export let serverNormalizedTime = null;
/** @type {GameInitiator}|null */
let gameInitiator = null;
/** @type {GameRematch}|null */
let gameRematch = null;
/** @type {GameReaction} */
export let gameReaction = null;
