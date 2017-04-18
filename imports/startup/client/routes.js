import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Profiles } from '/collections/profiles.js';
import {HomeController} from '/imports/startup/client/controllers/HomeController.js';
import GameData from '/imports/game/client/GameData.js';
import GameInitiator from '/imports/game/client/GameInitiator.js';
import GameReaction from '/imports/game/client/GameReaction.js';
import GameRematch from '/imports/game/client/GameRematch.js';
import ClientSocketIo from '/imports/lib/stream/client/ClientSocketIo.js';
import '/imports/ui/components/reactions.js';

Router.configure({
	layoutTemplate: 'app',
	loadingTemplate: 'loading',
	waitOn: function() {
		return Meteor.subscribe('userData');
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
				profiles: Profiles.find()
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

			Template.game.rendered = function() {
				stream = new ClientSocketIo();
				stream.init();
				stream.connect(Session.get('game'));
				gameData = new GameData(Session.get('game'));
				gameData.init();
				gameInitiator = new GameInitiator(Session.get('game'), stream, gameData);
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

				Template.game.rendered = null;
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
let stream = null;
/** @type {GameData} */
let gameData = null;
/** @type {GameInitiator}|null */
let gameInitiator = null;
/** @type {GameRematch}|null */
let gameRematch = null;
/** @type {GameReaction} */
export let gameReaction = null;
