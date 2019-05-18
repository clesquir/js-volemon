import MatchMakingGameConfiguration from '/imports/api/games/configuration/MatchMakingGameConfiguration';
import {Games} from '/imports/api/games/games.js';
import MatchMakerFactory from '/imports/api/games/server/matchMaking/MatchMakerFactory';
import {PLAYER_SHAPE_RANDOM} from '/imports/api/games/shapeConstants.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {htmlEncode} from '/imports/lib/utils.js';
import {Meteor} from "meteor/meteor";

const computerAdded = {};

Meteor.methods({
	updateMatchMakingShape: function(modeSelection, tournamentId, gameId, selectedShape) {
		const user = Meteor.user();

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to update your shape');
		}

		const configuration = new MatchMakingGameConfiguration(modeSelection, Tournaments, tournamentId);

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
		//Allow 1s before adding another CPU
		if (computerAdded[modeSelection + '_' + tournamentId] === undefined) {
			const matchMaker = MatchMakerFactory.fromConfiguration('random');

			matchMaker.subscribe({id: 'CPU', name: 'CPU'}, modeSelection, tournamentId);

			computerAdded[modeSelection + '_' + tournamentId] = true;
			Meteor.setTimeout(() => {
				delete computerAdded[modeSelection + '_' + tournamentId];
			}, 1000);
		}
	},

	addMachineLearningComputerToMatch: function(modeSelection, tournamentId) {
		//Allow 1s before adding another CPU
		if (computerAdded[modeSelection + '_' + tournamentId] === undefined) {
			const matchMaker = MatchMakerFactory.fromConfiguration('random');

			matchMaker.subscribe({id: 'CPU', isMachineLearning: true, name: 'ML CPU'}, modeSelection, tournamentId);

			computerAdded[modeSelection + '_' + tournamentId] = true;
			Meteor.setTimeout(() => {
				delete computerAdded[modeSelection + '_' + tournamentId];
			}, 1000);
		}
	},

	startMatchMaking: function(modeSelection, tournamentId) {
		const matchMaker = MatchMakerFactory.fromConfiguration('random');

		const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});
		let userName = '';
		if (userConfiguration) {
			userName = userConfiguration.name;
		}

		matchMaker.subscribe({id: Meteor.userId(), name: userName}, modeSelection, tournamentId);
	},

	cancelMatchMaking: function(userId) {
		const matchMaker = MatchMakerFactory.fromConfiguration('random');

		if (!matchMaker.canUnsubscribe(userId)) {
			return false;
		}

		return matchMaker.unsubscribe(userId);
	}
});
