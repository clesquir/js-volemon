import {Meteor} from 'meteor/meteor';
import {TournamentModes} from '/imports/api/tournaments/tournamentModes.js';
import {
	TOURNAMENT_MODE_CLASSIC,
	TOURNAMENT_MODE_HARDCORE,
	TOURNAMENT_MODE_RANDOM_BONUSES,
	TOURNAMENT_MODE_SHAPE_SHIFT,
	TOURNAMENT_MODE_DEATH_BONUS,
	TOURNAMENT_MODE_SMOKE_BOMB,
	TOURNAMENT_MODE_SUDDEN_DEATH,
	TOURNAMENT_MODE_SUPER_BOUNCE_WALLS
} from '/imports/api/tournaments/tournamentModesConstants.js';

Meteor.startup(function() {
	if (TournamentModes.find().count() === 0) {
		const modes = [
			{
				"_id": TOURNAMENT_MODE_CLASSIC,
				"name": "Classic tournament"
			},
			{
				"_id": TOURNAMENT_MODE_HARDCORE,
				"name": "Hardcore tournament",
				"description": "Bonuses spawning at a very fast pace"
			},
			{
				"_id": TOURNAMENT_MODE_RANDOM_BONUSES,
				"name": "Random bonuses tournament",
				"description": "Only random bonuses are spawning"
			},
			{
				"_id": TOURNAMENT_MODE_SHAPE_SHIFT,
				"name": "Shape shift tournament",
				"description": "Player shapes are shifting continuously"
			},
			{
				"_id": TOURNAMENT_MODE_DEATH_BONUS,
				"name": "Death bonus tournament",
				"description": "Bonuses spawning are only instant death"
			},
			{
				"_id": TOURNAMENT_MODE_SMOKE_BOMB,
				"name": "Smoke bomb tournament",
				"description": "Bonuses spawning are only smoke bomb"
			},
			{
				"_id": TOURNAMENT_MODE_SUDDEN_DEATH,
				"name": "Sudden death tournament",
				"description": "Only one point to score to win"
			},
			{
				"_id": TOURNAMENT_MODE_SUPER_BOUNCE_WALLS,
				"name": "Super bounce walls tournament",
				"description": "Walls are super bouncy"
			}
		];

		for (let mode of modes) {
			TournamentModes.insert(mode);
		}
	}
});
