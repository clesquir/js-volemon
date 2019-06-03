import {
	ACHIEVEMENT_ALL_BONUSES_IN_A_GAME,
	ACHIEVEMENT_BATTLE_OF_THE_GIANTS,
	ACHIEVEMENT_BLANK_SCREEN,
	ACHIEVEMENT_BONUSES_IN_A_GAME,
	ACHIEVEMENT_BONUSES_IN_A_LIFETIME,
	ACHIEVEMENT_BONUSES_IN_A_POINT,
	ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED,
	ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED,
	ACHIEVEMENT_CONSECUTIVE_LOST_GAMES,
	ACHIEVEMENT_CONSECUTIVE_WON_GAMES,
	ACHIEVEMENT_CRUSHING_METAL,
	ACHIEVEMENT_DAVID_VS_GOLIATH,
	ACHIEVEMENT_FORTUNE_TELLER,
	ACHIEVEMENT_FULL_STOP,
	ACHIEVEMENT_GAME_TIME,
	ACHIEVEMENT_GAMES_PLAYED,
	ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE,
	ACHIEVEMENT_GAMES_WON_WITH_X_SHAPE,
	ACHIEVEMENT_GONE_BUT_NOT_FORGOTTEN,
	ACHIEVEMENT_HIT_THE_CEILING,
	ACHIEVEMENT_HOW_TO_TIE_A_TIE,
	ACHIEVEMENT_I_WAS_THERE_WAITING,
	ACHIEVEMENT_INTOXICATED,
	ACHIEVEMENT_INVINCIBLE_IN_A_LIFETIME,
	ACHIEVEMENT_INVISIBLE_IN_A_GAME,
	ACHIEVEMENT_INVISIBLE_IN_A_LIFETIME,
	ACHIEVEMENT_INVISIBLE_IN_A_POINT,
	ACHIEVEMENT_LUDOMANIA,
	ACHIEVEMENT_NINJA,
	ACHIEVEMENT_ONE_OF_THE_THREE,
	ACHIEVEMENT_PAUSE_IN_A_GAME,
	ACHIEVEMENT_PAUSE_IN_A_LIFETIME,
	ACHIEVEMENT_PAUSE_IN_A_POINT,
	ACHIEVEMENT_POINT_TIME,
	ACHIEVEMENT_RAKSHASA,
	ACHIEVEMENT_RANDOM_IN_A_GAME,
	ACHIEVEMENT_SERIAL_WINNER,
	ACHIEVEMENT_SHUTOUTS,
	ACHIEVEMENT_SIMULTANEOUS_ACTIVATED_BONUSES,
	ACHIEVEMENT_SNOOZER,
	ACHIEVEMENT_STEEL_PRACTICING,
	ACHIEVEMENT_SUICIDAL_TENDENCIES,
	ACHIEVEMENT_TEENY_TINY_WORLD,
	ACHIEVEMENT_THEY_ARE_ALL_OVER,
	ACHIEVEMENT_TO_THE_SKY,
	ACHIEVEMENT_TRIPLE_COLON,
	ACHIEVEMENT_UNDESIRABLE,
	ACHIEVEMENT_UNTOUCHABLE,
	ACHIEVEMENT_YOU_HAVE_GOT_BALLS,
	TYPE_MS,
	TYPE_QUANTITY,
	TYPE_TIMES
} from '/imports/api/achievements/constants';

export const INITIAL_ACHIVEMENTS = [
	{
		"_id": ACHIEVEMENT_POINT_TIME,
		"name": "Why won't you die?",
		"description": "Time for a point",
		"type": TYPE_MS,
		"displayOrder": 1,
		"levels": [{"level": 1, "number": 120000}, {"level": 2, "number": 150000}, {"level": 3, "number": 180000}]
	},
	{
		"_id": ACHIEVEMENT_GAME_TIME,
		"name": "It is never ending!",
		"description": "Time for a game",
		"type": TYPE_MS,
		"displayOrder": 2,
		"levels": [{"level": 1, "number": 300000}, {"level": 2, "number": 450000}, {"level": 3, "number": 600000}]
	},
	{
		"_id": ACHIEVEMENT_GAMES_PLAYED,
		"name": "Warm-up",
		"description": "# of games played",
		"type": TYPE_QUANTITY,
		"displayOrder": 3,
		"levels": [{"level": 1, "number": 250}, {"level": 2, "number": 500}, {"level": 3, "number": 1000}]
	},
	{
		"_id": ACHIEVEMENT_SHUTOUTS,
		"name": "Bulletproof",
		"description": "# of shutouts",
		"type": TYPE_QUANTITY,
		"displayOrder": 4,
		"conditionalForTournamentGame": true,
		"levels": [{"level": 1, "number": 50}, {"level": 2, "number": 100}, {"level": 3, "number": 200}]
	},
	{
		"_id": ACHIEVEMENT_CONSECUTIVE_WON_GAMES,
		"name": "Undefeatable",
		"description": "# of consecutive won games",
		"type": TYPE_QUANTITY,
		"displayOrder": 5,
		"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 10}, {"level": 3, "number": 25}]
	},
	{
		"_id": ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED,
		"name": "I'm an addict...",
		"description": "# of consecutive days played",
		"type": TYPE_QUANTITY,
		"displayOrder": 6,
		"levels": [{"level": 1, "number": 7}, {"level": 2, "number": 14}, {"level": 3, "number": 30}]
	},
	{
		"_id": ACHIEVEMENT_PAUSE_IN_A_POINT,
		"name": "Ice baby",
		"description": "# of pause bonuses caught in a point",
		"type": TYPE_QUANTITY,
		"displayOrder": 7,
		"levels": [{"level": 1, "number": 2}, {"level": 2, "number": 3}, {"level": 3, "number": 4}]
	},
	{
		"_id": ACHIEVEMENT_PAUSE_IN_A_GAME,
		"name": "Barely moving",
		"description": "# of pause bonuses caught in a game",
		"type": TYPE_QUANTITY,
		"displayOrder": 8,
		"levels": [{"level": 1, "number": 3}, {"level": 2, "number": 5}, {"level": 3, "number": 7}]
	},
	{
		"_id": ACHIEVEMENT_PAUSE_IN_A_LIFETIME,
		"name": "Frozen fossil",
		"description": "# of pause bonuses caught in a lifetime",
		"type": TYPE_QUANTITY,
		"displayOrder": 9,
		"levels": [{"level": 1, "number": 25}, {"level": 2, "number": 50}, {"level": 3, "number": 100}]
	},
	{
		"_id": ACHIEVEMENT_INVISIBLE_IN_A_POINT,
		"name": "Blindfolded",
		"description": "# of invisible bonuses caught in a point",
		"type": TYPE_QUANTITY,
		"displayOrder": 10,
		"levels": [{"level": 1, "number": 3}, {"level": 2, "number": 6}, {"level": 3, "number": 9}]
	},
	{
		"_id": ACHIEVEMENT_INVISIBLE_IN_A_GAME,
		"name": "Vision loss",
		"description": "# of invisible bonuses caught in a game",
		"type": TYPE_QUANTITY,
		"displayOrder": 11,
		"levels": [{"level": 1, "number": 4}, {"level": 2, "number": 8}, {"level": 3, "number": 12}]
	},
	{
		"_id": ACHIEVEMENT_INVISIBLE_IN_A_LIFETIME,
		"name": "No idea what I'm doing",
		"description": "# of invisible bonuses caught in a lifetime",
		"type": TYPE_QUANTITY,
		"displayOrder": 12,
		"levels": [{"level": 1, "number": 50}, {"level": 2, "number": 100}, {"level": 3, "number": 200}]
	},
	{
		"_id": ACHIEVEMENT_BONUSES_IN_A_POINT,
		"name": "Mine, mine",
		"description": "# of bonuses caught in a point",
		"type": TYPE_QUANTITY,
		"displayOrder": 13,
		"levels": [{"level": 1, "number": 10}, {"level": 2, "number": 15}, {"level": 3, "number": 20}]
	},
	{
		"_id": ACHIEVEMENT_BONUSES_IN_A_GAME,
		"name": "All mine!",
		"description": "# of bonuses caught in a game",
		"type": TYPE_QUANTITY,
		"displayOrder": 14,
		"levels": [{"level": 1, "number": 15}, {"level": 2, "number": 30}, {"level": 3, "number": 45}]
	},
	{
		"_id": ACHIEVEMENT_BONUSES_IN_A_LIFETIME,
		"name": "Bonuses magnet",
		"description": "# of bonuses caught in a lifetime",
		"type": TYPE_QUANTITY,
		"displayOrder": 15,
		"levels": [{"level": 1, "number": 250}, {"level": 2, "number": 750}, {"level": 3, "number": 1500}]
	},
	{
		"_id": ACHIEVEMENT_SIMULTANEOUS_ACTIVATED_BONUSES,
		"name": "Fully equipped",
		"description": "# of simultaneously active bonuses",
		"type": TYPE_QUANTITY,
		"displayOrder": 16,
		"levels": [{"level": 1, "number": 3}, {"level": 2, "number": 4}, {"level": 3, "number": 5}]
	},
	{
		"_id": ACHIEVEMENT_ALL_BONUSES_IN_A_GAME,
		"name": "Catch'em all",
		"description": "Caught all bonuses in a game",
		"type": TYPE_TIMES,
		"displayOrder": 17,
		"conditionalForTournamentGame": true,
		"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 2}, {"level": 3, "number": 3}]
	},
	{
		"_id": ACHIEVEMENT_GAMES_WON_WITH_X_SHAPE,
		"isSecret": true,
		"name": "Letter, number or operator",
		"description": "# on won games with the X shape",
		"type": TYPE_QUANTITY,
		"displayOrder": 18,
		"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 10}, {"level": 3, "number": 25}]
	},
	{
		"_id": ACHIEVEMENT_INVINCIBLE_IN_A_LIFETIME,
		"isSecret": true,
		"name": "Always my armor on",
		"description": "# of invincible bonuses caught in a lifetime",
		"type": TYPE_QUANTITY,
		"displayOrder": 19,
		"conditionalForTournamentGame": true,
		"levels": [{"level": 1, "number": 2}, {"level": 2, "number": 4}, {"level": 3, "number": 8}]
	},
	{
		"_id": ACHIEVEMENT_CONSECUTIVE_LOST_GAMES,
		"isSecret": true,
		"name": "Master of nothing",
		"description": "# of consecutive lost games",
		"type": TYPE_QUANTITY,
		"displayOrder": 20,
		"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 10}, {"level": 3, "number": 25}]
	},
	{
		"_id": ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE,
		"isSecret": true,
		"name": "Birdie",
		"description": "# of games won under a minute",
		"type": TYPE_TIMES,
		"displayOrder": 21,
		"conditionalForTournamentGame": true,
		"levels": [{"level": 1, "number": 2}, {"level": 2, "number": 4}, {"level": 3, "number": 8}]
	},
	{
		"_id": ACHIEVEMENT_RANDOM_IN_A_GAME,
		"isSecret": true,
		"name": "Gambler",
		"description": "# of random bonuses caught in a game",
		"type": TYPE_QUANTITY,
		"displayOrder": 22,
		"conditionalForTournamentGame": true,
		"levels": [{"level": 1, "number": 3}, {"level": 2, "number": 6}, {"level": 3, "number": 12}]
	},
	{
		"_id": ACHIEVEMENT_HOW_TO_TIE_A_TIE,
		"isSecret": true,
		"name": "How to tie a tie",
		"description": "# of tie games",
		"type": TYPE_QUANTITY,
		"displayOrder": 23,
		"conditionalForTournamentGame": true,
		"levels": [{"level": 1, "number": 10}, {"level": 2, "number": 25}, {"level": 3, "number": 50}]
	},
	{
		"_id": ACHIEVEMENT_BATTLE_OF_THE_GIANTS,
		"isSecret": true,
		"name": "Battle of the giants",
		"description": "# of points scored when both players are big",
		"type": TYPE_QUANTITY,
		"displayOrder": 24,
		"deniedForTwoVersusTwo": true,
		"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 2}, {"level": 3, "number": 3}]
	},
	{
		"_id": ACHIEVEMENT_NINJA,
		"isSecret": true,
		"name": "Ninja",
		"description": "# of games over 2:00 without activating any bonuses",
		"type": TYPE_QUANTITY,
		"displayOrder": 25,
		"conditionalForTournamentGame": true,
		"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 5}, {"level": 3, "number": 10}]
	},
	{
		"_id": ACHIEVEMENT_I_WAS_THERE_WAITING,
		"isSecret": true,
		"name": "I was there waiting...",
		"description": "# of points scored when paused",
		"type": TYPE_QUANTITY,
		"displayOrder": 26,
		"deniedForTwoVersusTwo": true,
		"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 10}, {"level": 3, "number": 20}]
	},
	{
		"_id": ACHIEVEMENT_TO_THE_SKY,
		"isSecret": true,
		"name": "To the sky",
		"description": "Bonuses combo: Small monster, big jump and bouncy",
		"type": TYPE_TIMES,
		"displayOrder": 27,
		"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 2}, {"level": 3, "number": 4}]
	},
	{
		"_id": ACHIEVEMENT_BLANK_SCREEN,
		"isSecret": true,
		"name": "Blank screen",
		"description": "Bonuses combo: Invisible ball, both players either invisible or cloaked",
		"type": TYPE_TIMES,
		"displayOrder": 28,
		"deniedForTwoVersusTwo": true,
		"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 2}, {"level": 3, "number": 3}]
	},
	{
		"_id": ACHIEVEMENT_DAVID_VS_GOLIATH,
		"isSecret": true,
		"name": "David VS Goliath",
		"description": "# of won games against opponent with ELO 150 points higher",
		"type": TYPE_QUANTITY,
		"displayOrder": 29,
		"deniedForTwoVersusTwo": true,
		"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 10}, {"level": 3, "number": 20}]
	},
	{
		"_id": ACHIEVEMENT_SNOOZER,
		"isSecret": true,
		"name": "Snoozer",
		"description": "# of won games when opponent was leading 4-0",
		"type": TYPE_QUANTITY,
		"displayOrder": 30,
		"conditionalForTournamentGame": true,
		"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 10}, {"level": 3, "number": 20}]
	},
	{
		"_id": ACHIEVEMENT_CAREFULLY_RANDOMLY_PICKED,
		"isSecret": true,
		"name": "Carefully randomly picked",
		"description": "# of won games with every shape when selecting random shape",
		"type": TYPE_QUANTITY,
		"displayOrder": 31,
		"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 2}, {"level": 3, "number": 3}]
	},
	{
		"_id": ACHIEVEMENT_RAKSHASA,
		"isSecret": true,
		"name": "Rakshasa",
		"description": "Morph into all shapes in a life time",
		"type": TYPE_TIMES,
		"displayOrder": 32,
		"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 3}, {"level": 3, "number": 6}]
	},
	{
		"_id": ACHIEVEMENT_TRIPLE_COLON,
		"isSecret": true,
		"name": "Triple colon",
		"description": "# of won games with the ::: shape against a different shape player",
		"type": TYPE_QUANTITY,
		"displayOrder": 33,
		"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 25}, {"level": 3, "number": 50}]
	},
	{
		"_id": ACHIEVEMENT_FULL_STOP,
		"isSecret": true,
		"name": "Full stop",
		"description": "# of shutouts with the dot shape against a different shape player",
		"type": TYPE_QUANTITY,
		"displayOrder": 34,
		"conditionalForTournamentGame": true,
		"deniedForTwoVersusTwo": true,
		"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 5}, {"level": 3, "number": 10}]
	},
	{
		"_id": ACHIEVEMENT_UNDESIRABLE,
		"isSecret": true,
		"name": "Undesirable",
		"description": "Time a bonus bounces around without being caught",
		"type": TYPE_MS,
		"displayOrder": 35,
		"levels": [{"level": 1, "number": 30000}, {"level": 2, "number": 60000}, {"level": 3, "number": 120000}]
	},
	{
		"_id": ACHIEVEMENT_TEENY_TINY_WORLD,
		"isSecret": true,
		"name": "Teeny-tiny world",
		"description": "Bonuses combo: Small ball, both players are small",
		"type": TYPE_TIMES,
		"displayOrder": 36,
		"deniedForTwoVersusTwo": true,
		"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 5}, {"level": 3, "number": 10}]
	},
	{
		"_id": ACHIEVEMENT_SERIAL_WINNER,
		"isSecret": true,
		"name": "Serial winner",
		"description": "# of tournaments won",
		"type": TYPE_TIMES,
		"displayOrder": 37,
		"levels": [{"level": 1, "number": 1}, {"level": 2, "number": 5}, {"level": 3, "number": 10}]
	},
	{
		"_id": ACHIEVEMENT_ONE_OF_THE_THREE,
		"isSecret": true,
		"name": "One of the three",
		"description": "# of tournaments podium finish",
		"type": TYPE_TIMES,
		"displayOrder": 38,
		"levels": [{"level": 1, "number": 3}, {"level": 2, "number": 6}, {"level": 3, "number": 12}]
	},
	{
		"_id": ACHIEVEMENT_LUDOMANIA,
		"isSecret": true,
		"name": "Ludomania",
		"description": "# of tournaments participated",
		"type": TYPE_TIMES,
		"displayOrder": 39,
		"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 10}, {"level": 3, "number": 20}]
	},
	{
		"_id": ACHIEVEMENT_THEY_ARE_ALL_OVER,
		"isSecret": true,
		"name": "They are all over",
		"description": "# of bonuses on screen",
		"type": TYPE_QUANTITY,
		"displayOrder": 40,
		"levels": [{"level": 1, "number": 10}, {"level": 2, "number": 20}, {"level": 3, "number": 30}]
	},
	{
		"_id": ACHIEVEMENT_SUICIDAL_TENDENCIES,
		"isSecret": true,
		"name": "Suicidal tendencies",
		"description": `# of random bonuses caught in an "Instant Death" tournament`,
		"type": TYPE_QUANTITY,
		"displayOrder": 41,
		"levels": [{"level": 1, "number": 15}, {"level": 2, "number": 30}, {"level": 3, "number": 60}]
	},
	{
		"_id": ACHIEVEMENT_INTOXICATED,
		"isSecret": true,
		"name": "Intoxicated",
		"description": "# of poison bonuses caught in a lifetime",
		"type": TYPE_QUANTITY,
		"displayOrder": 42,
		"levels": [{"level": 1, "number": 25}, {"level": 2, "number": 50}, {"level": 3, "number": 100}]
	},
	{
		"_id": ACHIEVEMENT_GONE_BUT_NOT_FORGOTTEN,
		"isSecret": true,
		"name": "Gone but not forgotten",
		"description": "# of points scored when killed",
		"type": TYPE_QUANTITY,
		"displayOrder": 43,
		"levels": [{"level": 1, "number": 15}, {"level": 2, "number": 30}, {"level": 3, "number": 60}]
	},
	{
		"_id": ACHIEVEMENT_CRUSHING_METAL,
		"isSecret": true,
		"name": "Crushing metal",
		"description": "# of shutout in 1 VS CPU",
		"type": TYPE_TIMES,
		"displayOrder": 44,
		"conditionalForTournamentGame": true,
		"deniedForTwoVersusTwo": true,
		"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 10}, {"level": 3, "number": 20}]
	},
	{
		"_id": ACHIEVEMENT_STEEL_PRACTICING,
		"isSecret": true,
		"name": "Steel practicing",
		"description": "# of shutout in 1 VS Machine Learning CPU",
		"type": TYPE_TIMES,
		"displayOrder": 45,
		"conditionalForTournamentGame": true,
		"deniedForTwoVersusTwo": true,
		"levels": [{"level": 1, "number": 10}, {"level": 2, "number": 20}, {"level": 3, "number": 30}]
	},
	{
		"_id": ACHIEVEMENT_UNTOUCHABLE,
		"isSecret": true,
		"name": "Untouchable",
		"description": "# of consecutive shutouts",
		"type": TYPE_QUANTITY,
		"displayOrder": 46,
		"deniedForTwoVersusTwo": true,
		"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 10}, {"level": 3, "number": 25}]
	},
	{
		"_id": ACHIEVEMENT_HIT_THE_CEILING,
		"isSecret": true,
		"name": "Hit the ceiling",
		"description": "Bonuses combo: Small player, high player jumps, low gravity",
		"type": TYPE_TIMES,
		"displayOrder": 47,
		"levels": [{"level": 1, "number": 10}, {"level": 2, "number": 20}, {"level": 3, "number": 40}]
	},
	{
		"_id": ACHIEVEMENT_YOU_HAVE_GOT_BALLS,
		"isSecret": true,
		"name": "You've got balls!",
		"description": "# of balls on screen",
		"type": TYPE_QUANTITY,
		"displayOrder": 48,
		"levels": [{"level": 1, "number": 4}, {"level": 2, "number": 8}, {"level": 3, "number": 16}]
	},
	{
		"_id": ACHIEVEMENT_FORTUNE_TELLER,
		"isSecret": true,
		"name": "Fortune teller",
		"description": "# of times reaching 8 balls",
		"type": TYPE_TIMES,
		"displayOrder": 49,
		"levels": [{"level": 1, "number": 5}, {"level": 2, "number": 10}, {"level": 3, "number": 20}]
	}
];
