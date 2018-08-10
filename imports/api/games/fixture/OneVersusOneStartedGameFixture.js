import {ONE_VS_ONE_GAME_MODE} from '/imports/api/games/constants.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {
	PLAYER_ALLOWED_LIST_OF_SHAPES,
	PLAYER_DEFAULT_SHAPE,
	PLAYER_LIST_OF_SHAPES
} from '/imports/api/games/shapeConstants.js';
import {GAME_STATUS_STARTED} from '/imports/api/games/statusConstants.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';
import {Random} from 'meteor/random';

export default class OneVersusOneStartedGameFixture {
	/**
	 * @returns {OneVersusOneStartedGameFixture}
	 */
	static create() {
		const fixture = new OneVersusOneStartedGameFixture();

		fixture.gameId = Random.id(5);
		fixture.creatorUserId = Random.id(5);
		const creatorName = Random.hexString(5);
		fixture.opponentUserId = Random.id(5);
		const opponentName = Random.hexString(5);
		Games.insert({
			_id: fixture.gameId,
			gameMode: ONE_VS_ONE_GAME_MODE,
			modeSelection: ONE_VS_ONE_GAME_MODE,
			tournamentId: null,
			status: GAME_STATUS_STARTED,
			createdAt: getUTCTimeStamp(),
			createdBy: fixture.creatorUserId,
			players: [{id: fixture.creatorUserId, name: creatorName}, {id: fixture.opponentUserId, name: opponentName}],
			isPracticeGame: false,
			isPrivate: false,
			hostPoints: 0,
			clientPoints: 0,
			lastPointTaken: null,
			forfeitMinimumPoints: 3,
			maximumPoints: 5,
			hasBonuses: true,
			listOfShapes: PLAYER_LIST_OF_SHAPES,
			allowedListOfShapes: PLAYER_ALLOWED_LIST_OF_SHAPES,
			activeBonuses: [],
			viewers: []
		});
		Players.insert({
			userId: fixture.creatorUserId,
			name: creatorName,
			gameId: fixture.gameId,
			joinedAt: getUTCTimeStamp(),
			isReady: true,
			askedForRematch: undefined,
			hasQuit: false,
			selectedShape: PLAYER_DEFAULT_SHAPE,
			shape: PLAYER_DEFAULT_SHAPE
		});
		Players.insert({
			userId: fixture.opponentUserId,
			name: opponentName,
			gameId: fixture.gameId,
			joinedAt: getUTCTimeStamp(),
			isReady: true,
			askedForRematch: undefined,
			hasQuit: false,
			selectedShape: PLAYER_DEFAULT_SHAPE,
			shape: PLAYER_DEFAULT_SHAPE
		});
		Players.insert({gameId: fixture.gameId, userId: fixture.opponentUserId});

		return fixture;
	}
}
