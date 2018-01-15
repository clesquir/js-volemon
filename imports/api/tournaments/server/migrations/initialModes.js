import {Meteor} from 'meteor/meteor';
import {TournamentModes} from '/imports/api/tournaments/tournamentModes.js';
import {
	TOURNAMENT_MODE_CLASSIC,
	TOURNAMENT_MODE_HARDCORE,
	TOURNAMENT_MODE_RANDOM_BONUSES,
	TOURNAMENT_MODE_INSTANT_DEATH_BONUS,
	TOURNAMENT_MODE_SMOKE_BOMB,
	TOURNAMENT_MODE_SUDDEN_DEATH,
	TOURNAMENT_MODE_SUPER_BOUNCE_WALLS,
	TOURNAMENT_MODE_MOON_GRAVITY,
	TOURNAMENT_MODE_JUPITER_GRAVITY,
	TOURNAMENT_MODE_NO_BONUSES,
	TOURNAMENT_MODE_MASSIVE_HARDCORE_BLIND_BULLETPROOF,
	TOURNAMENT_MODE_BIG_DRUNK,
	TOURNAMENT_MODE_HIDDEN_SHAPE,
	TOURNAMENT_MODE_SPAGHETTI_ON_THE_CARPET
} from '/imports/api/tournaments/tournamentModesConstants.js';

Meteor.startup(function() {
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
			"_id": TOURNAMENT_MODE_INSTANT_DEATH_BONUS,
			"name": "Instant death bonus tournament",
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
		},
		{
			"_id": TOURNAMENT_MODE_MOON_GRAVITY,
			"name": "Moon gravity",
			"description": "The gravity force is weak with this one"
		},
		{
			"_id": TOURNAMENT_MODE_JUPITER_GRAVITY,
			"name": "Jupiter gravity",
			"description": "The gravity force is strong with this one"
		},
		{
			"_id": TOURNAMENT_MODE_NO_BONUSES,
			"name": "No bonuses"
		},
		{
			"_id": TOURNAMENT_MODE_MASSIVE_HARDCORE_BLIND_BULLETPROOF,
			"name": "Massive hardcore blind bulletproof",
			"description": "Jupiter's gravity and lots of invisible/invincible bonuses"
		},
		{
			"_id": TOURNAMENT_MODE_BIG_DRUNK,
			"name": "Big drunk",
			"description": "Bonuses spawning are big monster and drunk monster"
		},
		{
			"_id": TOURNAMENT_MODE_HIDDEN_SHAPE,
			"name": "Hidden shape",
			"description": "Monsters shapes are randomly picked and hidden"
		},
		{
			"_id": TOURNAMENT_MODE_SPAGHETTI_ON_THE_CARPET,
			"name": "Spaghetti on the carpet",
			"description": "Only available shapes are hyphen and obelisk"
		}
	];

	for (let expectedMode of modes) {
		let actualMode = TournamentModes.findOne({_id: expectedMode._id});
		if (!actualMode) {
			TournamentModes.insert(expectedMode);
		} else {
			const updates = {};
			if (actualMode.name !== expectedMode.name) {
				updates.name = expectedMode.name;
			}
			if (actualMode.description !== expectedMode.description) {
				updates.description = expectedMode.description;
			}

			if (Object.keys(updates).length) {
				TournamentModes.update({_id: actualMode._id}, {$set: updates});
			}
		}
	}
});
