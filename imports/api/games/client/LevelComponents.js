import Collisions from '/imports/api/games/client/Collisions.js';
import LevelConfiguration from '/imports/api/games/client/LevelConfiguration.js';
import {NORMAL_SCALE_PHYSICS_DATA} from '/imports/api/games/constants.js';
import {PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js';

export default class LevelComponents {
	/**
	 * @param {Collisions} collisions
	 * @param {GameSkin} gameSkin
	 * @param {Engine} engine
	 * @param {LevelConfiguration} levelConfiguration
	 */
	constructor(collisions, gameSkin, engine, levelConfiguration) {
		this.collisions = collisions;
		this.gameSkin = gameSkin;
		this.engine = engine;
		this.levelConfiguration = levelConfiguration;
	}

	preload() {
		for (let shape of PLAYER_LIST_OF_SHAPES) {
			this.engine.loadImage('shape-' + shape, '/assets/component/shape/player-' + shape + '.png');
		}

		this.engine.loadData(NORMAL_SCALE_PHYSICS_DATA, '/assets/component/shape/physicsData.json');

		this.engine.loadAtlas('bonus-icon', '/assets/bonus/texture-atlas-icons.png', '/assets/bonus/texture-atlas-icons.json');
		this.engine.loadImage('cloud', '/assets/bonus/cloud.png');
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
			this.levelConfiguration.width,
			this.levelConfiguration.height,
			this.levelConfiguration.groundHeight,
			this.groundGroup
		);
	}

	createNet() {
		this.gameSkin.createNetComponent(
			this.engine,
			(this.levelConfiguration.width / 2) - (this.levelConfiguration.netWidth / 2),
			this.levelConfiguration.height - this.levelConfiguration.groundHeight - this.levelConfiguration.netHeight,
			this.groundGroup
		);
	}

	createBounds() {
		//Host limits
		this.engine.addBound(
			(this.levelConfiguration.width / 4) * 3 - (this.levelConfiguration.netWidth / 4),
			(this.levelConfiguration.height / 2),
			(this.levelConfiguration.width / 2) + (this.levelConfiguration.netWidth / 2),
			this.levelConfiguration.height,
			this.collisions.playerDelimiterMaterial,
			this.collisions.hostPlayerDelimiterCollisionGroup,
			[this.collisions.hostPlayerCollisionGroup]
		);

		//Client limits
		this.engine.addBound(
			(this.levelConfiguration.width / 4) + (this.levelConfiguration.netWidth / 4),
			(this.levelConfiguration.height / 2),
			(this.levelConfiguration.width / 2) + (this.levelConfiguration.netWidth / 2),
			this.levelConfiguration.height,
			this.collisions.playerDelimiterMaterial,
			this.collisions.clientPlayerDelimiterCollisionGroup,
			[this.collisions.clientPlayerCollisionGroup]
		);

		//Ground limits
		this.groundBound = this.createGroundBound();

		//Net limit
		this.engine.addBound(
			this.levelConfiguration.width / 2,
			this.levelConfiguration.height - (this.levelConfiguration.groundHeight + this.levelConfiguration.netHeight) / 2,
			this.levelConfiguration.netWidth,
			this.levelConfiguration.groundHeight + this.levelConfiguration.netHeight,
			this.collisions.netDelimiterMaterial,
			this.collisions.netHitDelimiterCollisionGroup,
			[
				this.collisions.ballCollisionGroup,
				this.collisions.bonusCollisionGroup
			]
		);
	}

	createGroundBound() {
		return this.engine.addBound(
			this.levelConfiguration.width / 2,
			this.levelConfiguration.height - (this.levelConfiguration.groundHeight / 2),
			this.levelConfiguration.width,
			this.levelConfiguration.groundHeight,
			this.collisions.groundDelimiterMaterial,
			this.collisions.groundHitDelimiterCollisionGroup,
			[
				this.collisions.hostPlayerCollisionGroup,
				this.collisions.clientPlayerCollisionGroup,
				this.collisions.ballCollisionGroup,
				this.collisions.bonusCollisionGroup
			]
		);
	}

	shake() {
		this.engine.shake(this.groundGroup, 5, 20);
	}
}
