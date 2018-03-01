import Collisions from '/imports/api/games/collisions/Collisions.js';
import {NORMAL_SCALE_PHYSICS_DATA} from '/imports/api/games/constants.js';
import {PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js';

export default class LevelComponents {
	/**
	 * @param {Collisions} collisions
	 * @param {GameSkin} gameSkin
	 * @param {Engine} engine
	 * @param {GameConfiguration} gameConfiguration
	 */
	constructor(collisions, gameSkin, engine, gameConfiguration) {
		this.collisions = collisions;
		this.gameSkin = gameSkin;
		this.engine = engine;
		this.gameConfiguration = gameConfiguration;
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
			this.gameConfiguration.width(),
			this.gameConfiguration.height(),
			this.gameConfiguration.groundHeight(),
			this.groundGroup
		);
	}

	createNet() {
		this.gameSkin.createNetComponent(
			this.engine,
			(this.gameConfiguration.width() / 2) - (this.gameConfiguration.netWidth() / 2),
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() - this.gameConfiguration.netHeight(),
			this.gameConfiguration.netWidth(),
			this.gameConfiguration.netHeight(),
			this.groundGroup
		);
	}

	createBounds() {
		//Host limits
		this.engine.addBound(
			(this.gameConfiguration.width() / 4) * 3 - (this.gameConfiguration.netWidth() / 4),
			(this.gameConfiguration.height() / 2),
			(this.gameConfiguration.width() / 2) + (this.gameConfiguration.netWidth() / 2),
			this.gameConfiguration.height(),
			this.collisions.playerDelimiterMaterial,
			this.collisions.hostPlayerDelimiterCollisionGroup,
			[this.collisions.hostPlayerCollisionGroup]
		);

		//Client limits
		this.engine.addBound(
			(this.gameConfiguration.width() / 4) + (this.gameConfiguration.netWidth() / 4),
			(this.gameConfiguration.height() / 2),
			(this.gameConfiguration.width() / 2) + (this.gameConfiguration.netWidth() / 2),
			this.gameConfiguration.height(),
			this.collisions.playerDelimiterMaterial,
			this.collisions.clientPlayerDelimiterCollisionGroup,
			[this.collisions.clientPlayerCollisionGroup]
		);

		//Ground limits
		this.groundBound = this.createGroundBound();

		//Net limit
		this.engine.addBound(
			this.gameConfiguration.width() / 2,
			this.gameConfiguration.height() - (this.gameConfiguration.groundHeight() + this.gameConfiguration.netHeight()) / 2,
			this.gameConfiguration.netWidth(),
			this.gameConfiguration.groundHeight() + this.gameConfiguration.netHeight(),
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
			this.gameConfiguration.width() / 2,
			this.gameConfiguration.height() - (this.gameConfiguration.groundHeight() / 2),
			this.gameConfiguration.width(),
			this.gameConfiguration.groundHeight(),
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
		for (let child of this.groundGroup.getChildren()) {
			this.engine.shake(child, 5, 20);
		}
	}
}
