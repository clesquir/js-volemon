import MatchMakingGameConfiguration from '/imports/api/games/configuration/MatchMakingGameConfiguration.js';
import {Games} from '/imports/api/games/games.js';
import EloMatchMaker from '/imports/api/games/server/matchMaking/EloMatchMaker.js';
import {PLAYER_SHAPE_RANDOM} from '/imports/api/games/shapeConstants.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {htmlEncode} from '/imports/lib/utils.js';
import {Meteor} from "meteor/meteor";

Meteor.methods({
	updateMatchMakingShape: function(gameId, tournamentId, selectedShape) {
		const user = Meteor.user();

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to update your shape');
		}

		const configuration = new MatchMakingGameConfiguration(Tournaments, tournamentId);

		const allowedListOfShapes = configuration.allowedListOfShapes() || [];
		const listOfShapes = configuration.listOfShapes() || [];

		if (allowedListOfShapes.indexOf(selectedShape) === -1) {
			throw new Meteor.Error(
				'not-allowed',
				'The requested shape is not allowed: ' + htmlEncode(selectedShape)
			);
		}

		let shape = selectedShape;
		if (selectedShape === PLAYER_SHAPE_RANDOM) {
			shape = Random.choice(listOfShapes);
		}

		Games.update({_id: gameId, 'players.id': user._id}, {$set: {'players.$.selectedShape': selectedShape, 'players.$.shape': shape}});
		UserConfigurations.update(
			{userId: this.userId},
			{
				$set: {
					lastShapeUsed: selectedShape,
					matchMakingSelectedShape: selectedShape,
					matchMakingShape: shape
				}
			}
		);
	},

	addComputerToMatch: function(modeSelection, tournamentId) {
		const matchMaker = new EloMatchMaker();

		matchMaker.subscribe('CPU', 'CPU', modeSelection, tournamentId);
	},

	startMatchMaking: function(modeSelection, tournamentId) {
		const matchMaker = new EloMatchMaker();

		const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});
		let userName = '';
		if (userConfiguration) {
			userName = userConfiguration.name;
		}

		matchMaker.subscribe(Meteor.userId(), userName, modeSelection, tournamentId);
	},

	cancelMatchMaking: function(userId) {
		const matchMaker = new EloMatchMaker();

		if (!matchMaker.canUnsubscribe(userId)) {
			return false;
		}

		return matchMaker.unsubscribe(userId);
	}
});
