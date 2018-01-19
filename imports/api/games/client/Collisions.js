export default class Collisions {
	/**
	 * @param {Game} game
	 * @param {GameBonus} gameBonus
	 * @param {GameSkin} gameSkin
	 * @param {GameConfiguration} gameConfiguration
	 * @param {Engine} engine
	 */
	constructor(game, gameBonus, gameSkin, gameConfiguration, engine) {
		this.game = game;
		this.gameBonus = gameBonus;
		this.gameSkin = gameSkin;
		this.gameConfiguration = gameConfiguration;
		this.engine = engine;
	}

	init() {
		this.createGroups();
		this.createMaterials();
		this.createContacts();
	}

	setupPlayerBody(player) {
		this.engine.setMaterial(player, this.playerMaterial);
		this.engine.setCollisionGroup(player, player.data.playerCollisionGroup);
		this.collidesWithGroundHitDelimiter(player);

		if (player.data.playerCollisionGroup === this.hostPlayerCollisionGroup) {
			this.collidesWithHostPlayer(player);
			this.engine.collidesWith(player, this.hostPlayerDelimiterCollisionGroup);
		} else if (player.data.playerCollisionGroup === this.clientPlayerCollisionGroup) {
			this.collidesWithClientPlayer(player);
			this.engine.collidesWith(player, this.clientPlayerDelimiterCollisionGroup);
		}
		this.collidesWithBall(player);
		this.collidesWithBonus(player);
	}

	setupBallBody(ball, onBallHitPlayer, onBallHitGround, scope) {
		this.engine.setMaterial(ball, this.ballMaterial);
		this.engine.setCollisionGroup(ball, this.ballCollisionGroup);

		this.collidesWithHostPlayer(ball, onBallHitPlayer, scope);
		this.collidesWithClientPlayer(ball, onBallHitPlayer, scope);
		this.collidesWithNetHitDelimiter(ball);
		this.collidesWithGroundHitDelimiter(ball, onBallHitGround, scope);
		this.collidesWithBonus(ball);
	}

	setupBonusBody(bonus, onBonusHitPlayer, scope) {
		this.engine.setMaterial(bonus, this.bonusMaterial);
		this.engine.setCollisionGroup(bonus, this.bonusCollisionGroup);

		this.collidesWithHostPlayer(bonus, (bonusItem, player) => {
			onBonusHitPlayer.call(scope, bonus, player);
		}, scope);
		this.collidesWithClientPlayer(bonus, (bonusItem, player) => {
			onBonusHitPlayer.call(scope, bonus, player);
		}, scope);
		this.collidesWithNetHitDelimiter(bonus);
		this.collidesWithGroundHitDelimiter(bonus);
		this.collidesWithBall(bonus);
		this.engine.collidesWith(bonus, this.bonusCollisionGroup);
	}

	/**
	 * @private
	 */
	createGroups() {
		this.hostPlayerCollisionGroup = this.engine.createCollisionGroup();
		this.clientPlayerCollisionGroup = this.engine.createCollisionGroup();
		this.ballCollisionGroup = this.engine.createCollisionGroup();
		this.hostPlayerDelimiterCollisionGroup = this.engine.createCollisionGroup();
		this.clientPlayerDelimiterCollisionGroup = this.engine.createCollisionGroup();
		this.netHitDelimiterCollisionGroup = this.engine.createCollisionGroup();
		this.groundHitDelimiterCollisionGroup = this.engine.createCollisionGroup();
		//Bonus
		this.bonusCollisionGroup = this.engine.createCollisionGroup();
	}

	/**
	 * @private
	 */
	createMaterials() {
		this.playerMaterial = this.engine.createMaterial('player');
		this.ballMaterial = this.engine.createMaterial('ball');
		this.playerDelimiterMaterial = this.engine.createMaterial('netPlayerDelimiter');
		this.netDelimiterMaterial = this.engine.createMaterial('netDelimiter');
		this.groundDelimiterMaterial = this.engine.createMaterial('groundDelimiter');
		//Bonus
		this.bonusMaterial = this.engine.createMaterial('bonus');
	}

	/**
	 * @private
	 */
	createContacts() {
		this.engine.initWorldContactMaterial();

		this.createContactMaterialWithWorld(this.ballMaterial, {restitution: this.gameConfiguration.worldRestitution()});
		this.createContactMaterialWithGroundDelimiter(this.ballMaterial, {restitution: 1});

		this.createContactMaterialWithWorld(this.playerMaterial, {stiffness: 1e20, relaxation: 3, friction: 0});
		this.createContactMaterialWithGroundDelimiter(this.playerMaterial, {stiffness: 1e20, relaxation: 3, friction: 0});
		this.engine.createContactMaterial(this.playerMaterial, this.playerDelimiterMaterial, {stiffness: 1e20, relaxation: 3, friction: 0});
		this.engine.createContactMaterial(this.playerMaterial, this.playerMaterial, {stiffness: 1e20, relaxation: 3, friction: 0});

		this.createContactMaterialWithWorld(this.bonusMaterial, {restitution: this.gameConfiguration.worldRestitution()});
		this.createContactMaterialWithNetDelimiter(this.bonusMaterial, {restitution: 0.7});
		this.createContactMaterialWithGroundDelimiter(this.bonusMaterial, {restitution: 1});
	}

	/**
	 * @private
	 */
	createContactMaterialWithWorld(material, config) {
		this.engine.createWorldContactMaterial(material, config);
	}

	/**
	 * @private
	 */
	createContactMaterialWithNetDelimiter(material, config) {
		this.engine.createContactMaterial(material, this.netDelimiterMaterial, config);
	}

	/**
	 * @private
	 */
	createContactMaterialWithGroundDelimiter(material, config) {
		this.engine.createContactMaterial(material, this.groundDelimiterMaterial, config);
	}

	/**
	 * @private
	 * @param sprite
	 * @param callback
	 * @param scope
	 */
	collidesWithNetHitDelimiter(sprite, callback, scope) {
		this.engine.collidesWith(sprite, this.netHitDelimiterCollisionGroup, callback, scope);
	}

	/**
	 * @private
	 * @param sprite
	 * @param callback
	 * @param scope
	 */
	collidesWithGroundHitDelimiter(sprite, callback, scope) {
		this.engine.collidesWith(sprite, this.groundHitDelimiterCollisionGroup, callback, scope);
	}

	/**
	 * @private
	 * @param sprite
	 * @param callback
	 * @param scope
	 */
	collidesWithHostPlayer(sprite, callback, scope) {
		this.engine.collidesWith(sprite, this.hostPlayerCollisionGroup, callback, scope);
	}

	/**
	 * @private
	 * @param sprite
	 * @param callback
	 * @param scope
	 */
	collidesWithClientPlayer(sprite, callback, scope) {
		this.engine.collidesWith(sprite, this.clientPlayerCollisionGroup, callback, scope);
	}

	/**
	 * @private
	 * @param sprite
	 * @param callback
	 * @param scope
	 */
	collidesWithBall(sprite, callback, scope) {
		this.engine.collidesWith(sprite, this.ballCollisionGroup, callback, scope);
	}

	/**
	 * @private
	 * @param sprite
	 * @param callback
	 * @param scope
	 */
	collidesWithBonus(sprite, callback, scope) {
		this.engine.collidesWith(sprite, this.bonusCollisionGroup, callback, scope);
	}
}
