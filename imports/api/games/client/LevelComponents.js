import {NORMAL_SCALE_PHYSICS_DATA} from '/imports/api/games/constants.js';
import {PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js';
import {GAME_NET_HEIGHT, GAME_NET_THICKNESS} from '/imports/api/games/constants.js';

export default class LevelComponents {
	/**
	 * @param {Game} game
	 * @param {GameBonus} gameBonus
	 * @param {GameSkin} gameSkin
	 * @param {Engine} engine
	 * @param {{width: {integer}, height: {integer}, groundHeight: {integer}}} dimensions
	 */
	constructor(game, gameBonus, gameSkin, engine, dimensions) {
		this.game = game;
		this.gameBonus = gameBonus;
		this.gameSkin = gameSkin;
		this.engine = engine;
		this.dimensions = dimensions;
	}

	preload() {
		for (let shape of PLAYER_LIST_OF_SHAPES) {
			this.engine.loadImage('shape-' + shape, '/assets/component/shape/player-' + shape + '.png');
		}

		this.engine.loadData(NORMAL_SCALE_PHYSICS_DATA, '/assets/component/shape/physicsData.json');

		this.engine.loadAtlasJSONHash('bonus-icon', '/assets/bonus/texture-atlas-icons.png', '/assets/bonus/texture-atlas-icons.json');
		this.engine.loadAtlasJSONHash('bonus-cloud', '/assets/bonus/texture-atlas-cloud.png', '/assets/bonus/texture-atlas-cloud.json');
		this.engine.loadImage('shape-hidden', '/assets/component/shape/player-hidden.png');
	}

	createLevelComponents() {
		this.groundGroup = this.engine.addGroup(false);

		this.createGround();
		this.createNet();
		this.createBounds();
	}

	createGround() {
		this.gameSkin.createGroundComponents(
			this.engine,
			this.dimensions.width,
			this.dimensions.height,
			this.dimensions.groundHeight,
			this.groundGroup
		);
	}

	createNet() {
		this.gameSkin.createNetComponent(
			this.engine,
			(this.dimensions.width / 2) - (GAME_NET_THICKNESS / 2),
			this.dimensions.height - this.dimensions.groundHeight - GAME_NET_HEIGHT,
			this.groundGroup
		);
	}

	createBounds() {
		//Host limits
		this.engine.addBound(
			(this.dimensions.width / 4) * 3 - (GAME_NET_THICKNESS / 4),
			(this.dimensions.height / 2),
			(this.dimensions.width / 2) + (GAME_NET_THICKNESS / 2),
			this.dimensions.height,
			this.game.collisions.playerDelimiterMaterial,
			this.game.collisions.hostPlayerDelimiterCollisionGroup,
			[this.game.collisions.hostPlayerCollisionGroup]
		);

		//Client limits
		this.engine.addBound(
			(this.dimensions.width / 4) + (GAME_NET_THICKNESS / 4),
			(this.dimensions.height / 2),
			(this.dimensions.width / 2) + (GAME_NET_THICKNESS / 2),
			this.dimensions.height,
			this.game.collisions.playerDelimiterMaterial,
			this.game.collisions.clientPlayerDelimiterCollisionGroup,
			[this.game.collisions.clientPlayerCollisionGroup]
		);

		//Ground limits
		const bound = this.createGroundBound();
		this.game.addPlayerCanJumpOnBody(this.game.player1, bound);
		this.game.addPlayerCanJumpOnBody(this.game.player2, bound);

		//Net limit
		this.engine.addBound(
			this.dimensions.width / 2,
			this.dimensions.height - (this.dimensions.groundHeight + GAME_NET_HEIGHT) / 2,
			GAME_NET_THICKNESS,
			this.dimensions.groundHeight + GAME_NET_HEIGHT,
			this.game.collisions.netDelimiterMaterial,
			this.game.collisions.netHitDelimiterCollisionGroup,
			[
				this.game.collisions.ballCollisionGroup,
				this.game.collisions.bonusCollisionGroup
			]
		);
	}

	createGroundBound() {
		return this.engine.addBound(
			this.dimensions.width / 2,
			this.dimensions.height - (this.dimensions.groundHeight / 2),
			this.dimensions.width,
			this.dimensions.groundHeight,
			this.game.collisions.groundDelimiterMaterial,
			this.game.collisions.groundHitDelimiterCollisionGroup,
			[
				this.game.collisions.hostPlayerCollisionGroup,
				this.game.collisions.clientPlayerCollisionGroup,
				this.game.collisions.ballCollisionGroup,
				this.game.collisions.bonusCollisionGroup
			]
		);
	}

	shake() {
		this.engine.shake(this.groundGroup, 5, 20);
	}
}
