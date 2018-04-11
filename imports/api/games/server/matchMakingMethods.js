import MatchMakingGameConfiguration from '/imports/api/games/configuration/MatchMakingGameConfiguration.js';
import {PLAYER_SHAPE_RANDOM} from '/imports/api/games/shapeConstants.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {htmlEncode} from '/imports/lib/utils.js';
import ImmediateMatchMaker from '/imports/api/games/server/matchMaking/ImmediateMatchMaker.js';
import {Meteor} from "meteor/meteor";

Meteor.methods({
	updateMatchMakingShape: function(tournamentId, selectedShape) {
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

	startMatchMaking: function(modeSelection, tournamentId) {
		const matchMaker = new ImmediateMatchMaker();

		matchMaker.subscribe(Meteor.userId(), modeSelection, tournamentId);
	},

	cancelMatchMaking: function() {
		const matchMaker = new ImmediateMatchMaker();

		if (!matchMaker.canUnsubscribe(Meteor.userId())) {
			return false;
		}

		return matchMaker.unsubscribe(Meteor.userId());
	}
});
