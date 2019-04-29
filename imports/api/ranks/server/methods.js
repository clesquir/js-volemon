import {EloScores} from '/imports/api/games/eloscores.js';
import {TeamEloScores} from '/imports/api/games/teameloscores';
import {UserConfigurations} from '/imports/api/users/userConfigurations';
import {Meteor} from 'meteor/meteor';

Meteor.methods({
	ranksChart: function(eloMode, minDate) {
		const usernameByUserId = {};

		UserConfigurations.find().forEach((userConfiguration) => {
			usernameByUserId[userConfiguration.userId] = userConfiguration.name;
		});

		let eloScores;
		if (eloMode === 'solo') {
			eloScores = EloScores;
		} else {
			eloScores = TeamEloScores;
		}

		const ranksChartData = [];
		eloScores.find({timestamp: {$gt: minDate}}).forEach((eloScore) => {
			ranksChartData.push(
				Object.assign(
					eloScore,
					{
						username: usernameByUserId[eloScore.userId]
					}
				)
			);
		});

		return ranksChartData;
	}
});
