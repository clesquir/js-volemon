import {TournamentModes} from '/imports/api/tournaments/tournamentModes.js';
import {
	TOURNAMENT_MODE_BIG_DRUNK,
	TOURNAMENT_MODE_BLANK_SCREEN,
	TOURNAMENT_MODE_BONUS_DURATION,
	TOURNAMENT_MODE_BONUS_OVERRIDE,
	TOURNAMENT_MODE_CATCH_ME_IF_YOU_CAN,
	TOURNAMENT_MODE_CLASSIC,
	TOURNAMENT_MODE_FOOTBALL_FIELD,
	TOURNAMENT_MODE_GRAVITY_OVERRIDE,
	TOURNAMENT_MODE_HARDCORE,
	TOURNAMENT_MODE_HIDDEN_SHAPE,
	TOURNAMENT_MODE_MASSIVE_HARDCORE_BLIND_BULLETPROOF,
	TOURNAMENT_MODE_NO_BONUSES,
	TOURNAMENT_MODE_NOT_ENOUGH_SPACE,
	TOURNAMENT_MODE_NOTHING_BONUS,
	TOURNAMENT_MODE_PAUSE_PLAY,
	TOURNAMENT_MODE_PLAYER_VELOCITY,
	TOURNAMENT_MODE_RANDOM_BONUSES,
	TOURNAMENT_MODE_SHAPE_SHIFTER,
	TOURNAMENT_MODE_SMOKE_BOMB,
	TOURNAMENT_MODE_SPAGHETTI_ON_THE_CARPET,
	TOURNAMENT_MODE_SUDDEN_DEATH,
	TOURNAMENT_MODE_SUPER_BOUNCE_WALLS,
	TOURNAMENT_MODE_TALL_NET,
	TOURNAMENT_MODE_TEENY_TINY_WORLD,
	TOURNAMENT_MODE_TINY_NET
} from '/imports/api/tournaments/tournamentModesConstants.js';
import {Meteor} from 'meteor/meteor';

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
		},
		{
			"_id": TOURNAMENT_MODE_NOTHING_BONUS,
			"name": "Nothing bonus",
			"description": "Bonuses spawning are doing nothing but obstruct"
		},
		{
			"_id": TOURNAMENT_MODE_SHAPE_SHIFTER,
			"name": "Shape shifter",
			"description": "Bonuses spawning are shape shift at a very fast pace"
		},
		{
			"_id": TOURNAMENT_MODE_TINY_NET,
			"name": "Tiny net",
			"description": "Virtually no net"
		},
		{
			"_id": TOURNAMENT_MODE_TALL_NET,
			"name": "Tall net"
		},
		{
			"_id": TOURNAMENT_MODE_TEENY_TINY_WORLD,
			"name": "Teeny-tiny world",
			"description": "Super fast spawning bonuses are small-monster and small-ball and the net is tiny"
		},
		{
			"_id": TOURNAMENT_MODE_BLANK_SCREEN,
			"name": "Blank screen",
			"description": "Fast spawning bonuses are only derived from invisible"
		},
		{
			"_id": TOURNAMENT_MODE_CATCH_ME_IF_YOU_CAN,
			"name": "Catch me if you can",
			"description": "Fast spawning bonuses are freeze and fast monster"
		},
		{
			"_id": TOURNAMENT_MODE_FOOTBALL_FIELD,
			"name": "Football field",
			"description": "2 VS 2 level size"
		},
		{
			"_id": TOURNAMENT_MODE_NOT_ENOUGH_SPACE,
			"name": "Not enough space",
			"description": "Too small level size with super fast spawning bonuses"
		},
		{
			"_id": TOURNAMENT_MODE_PAUSE_PLAY,
			"name": "Pause/play",
			"description": "Fast spawning bonuses are freeze and unfreeze"
		},
		{
			"_id": TOURNAMENT_MODE_BONUS_DURATION,
			"name": "Bonus duration",
			"description": "Bonus effect time changed"
		},
		{
			"_id": TOURNAMENT_MODE_BONUS_OVERRIDE,
			"name": "Bonus overridden",
			"description": "Available bonuses changed"
		},
		{
			"_id": TOURNAMENT_MODE_GRAVITY_OVERRIDE,
			"name": "Gravity overridden",
			"description": "Gravity changed"
		},
		{
			"_id": TOURNAMENT_MODE_PLAYER_VELOCITY,
			"name": "Player velocity",
			"description": "Player velocity changed"
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
