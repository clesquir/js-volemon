export default class Engine {
	/**
	 * @param worldConfiguration
	 * @param worldConfiguration.width
	 * @param worldConfiguration.height
	 * @param worldConfiguration.gravity
	 * @param worldConfiguration.bonusRadius
	 * @param worldConfiguration.renderTo
	 * @param preloadGame
	 * @param createGame
	 * @param updateGame
	 * @param scope
	 * @param config
	 */
	start(worldConfiguration, preloadGame, createGame, updateGame, scope, config = {}) {
	}

	stop() {
	}

	createGame() {
	}

	loadImage(key, path) {
	}

	loadAtlas(key, imagePath, jsonPath) {
	}

	loadSpriteSheet(key, path, width, height) {
	}

	loadSpriteTexture(sprite, key) {
	}

	loadData(key, path) {
	}

	loadPolygon(sprite, key, object) {
	}

	changeBackgroundColor(hex) {
	}

	drawRectangle(x, y, w, h, config) {
	}

	addGroup(enableBody = false) {
	}

	addText(x, y, text, style, group) {
	}

	updateText(textComponent, text) {
	}

	addBound(x, y, w, h, material, collisionGroup, colliders, name, debug) {
	}

	addImage(x, y, key, frame, group) {
	}

	addSprite(x, y, key, disableBody = false, frame, debugBody = false) {
	}

	addGroupedSprite(x, y, key, group, disableBody = false, frame, debugBody = false) {
	}

	addTileSprite(x, y, width, height, key, frame, disableBody = true, group, debugBody = false) {
	}

	addBonus(x, bonusGravityScale, bonus, bonusZIndexGroup) {
	}

	drawBonus(x, y, bonus, progress) {
	}

	updateBonusProgress(x, bonusSprite, progress) {
	}

	sortBonusGroup(bonusZIndexGroup) {
	}

	showBallHitPoint(x, y, diameter) {
	}

	activateAnimationBonus(x, y, bonus) {
	}

	constrainVelocity(sprite, maxVelocity) {
	}

	limitBallThroughNet(ball) {
	}

	spawn(sprite, x, y) {
	}

	addPlayerEye(player, isHost, currentPolygonKey, currentPolygonObject) {
	}

	updatePlayerEye(player, ball) {
	}

	getVerticalSpeed(sprite) {
	}

	setVerticalSpeed(sprite, velocityY) {
	}

	getHorizontalSpeed(sprite) {
	}

	setHorizontalSpeed(sprite, velocityX) {
	}

	getCenterX() {
	}

	getCenterY() {
	}

	getXPosition(sprite) {
	}

	getYPosition(sprite) {
	}

	getWidth(sprite) {
	}

	setWidth(sprite, width) {
	}

	getHeight(sprite) {
	}

	setHeight(sprite, height) {
	}

	isTimerRunning(timer) {
	}

	getTimerRemainingDuration(timer) {
	}

	setDamping(sprite, damping) {
	}

	freeze(sprite) {
	}

	unfreeze(sprite) {
	}

	getIsFrozen(sprite) {
	}

	setFixedRotation(sprite, fixedRotation) {
	}

	setMass(sprite, mass) {
	}

	getMass(sprite) {
	}

	setWorldGravity(gravity) {
	}

	setGravity(sprite, gravity) {
	}

	getGravity(sprite) {
	}

	setAnchor(sprite, anchor) {
	}

	setOpacity(sprite, opacity) {
	}

	getOpacity(sprite) {
	}

	animateSetOpacity(sprite, opacityTo, opacityFrom, duration) {
	}

	setTint(sprite, hex) {
	}

	/**
	 * @param sprite
	 * @param {{frame: {string}, frames: {string}[], speed: {int}}} animation
	 */
	playAnimation(sprite, animation) {
	}

	createTimer(seconds, fn, scope) {
	}

	getKey(spriteBody) {
	}

	/**
	 * @param sprite
	 * @returns {{x: number, y: number, velocityX: number, velocityY: number}}
	 */
	getPositionData(sprite) {
	}

	/**
	 * @param sprite
	 * @returns {{x: number, y: number, velocityX: number, velocityY: number, gravityScale: number, width: number, height: number}}
	 */
	fullPositionData(sprite) {
	}

	interpolateMoveTo(sprite, serverNormalizedTimestamp, data, canMoveCallback, slideToLocation = false) {
	}

	scale(sprite, x, y) {
	}

	animateScale(sprite, xTo, yTo, xFrom, yFrom, duration) {
	}

	initWorldContactMaterial() {
	}

	createCollisionGroup() {
	}

	setCollisionGroup(sprite, collisionGroup) {
	}

	createMaterial(material) {
	}

	setMaterial(sprite, material) {
	}

	createWorldContactMaterial(material, config) {
	}

	createContactMaterial(materialA, materialB, config) {
	}

	collidesWith(sprite, collisionGroup, callback, scope) {
	}

	hasSurfaceTouchingPlayerBottom(player) {
	}

	shake(sprite, move, time) {
	}

	kill(sprite) {
	}

	drawBallPrediction(px, py, color) {
	}
}
