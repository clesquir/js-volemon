export default class GameSkin {
	/**
	 * @param {Skin} skin
	 * @param {Plugin[]} plugins
	 */
	constructor(skin, plugins = []) {
		this.skin = skin;
		this.plugins = plugins;
	}

	init() {
		this.skin.init();

		for (let plugin of this.plugins) {
			plugin.init();
		}
	}

	/**
	 * @param {Engine} engine
	 */
	preload(engine) {
		let atlasJSONHash = this.skin.atlasJSONHash();
		let imagesToLoad = this.skin.imagesToLoad();
		let spriteSheetToLoad = this.skin.spriteSheetsToLoad();
		let dataToLoad = this.skin.dataToLoad();
		let background = this.skin.backgroundColor();

		for (let plugin of this.plugins) {
			atlasJSONHash = atlasJSONHash.concat(plugin.atlasJSONHash());
			imagesToLoad = imagesToLoad.concat(plugin.imagesToLoad());
			spriteSheetToLoad = spriteSheetToLoad.concat(plugin.spriteSheetsToLoad());
			dataToLoad = dataToLoad.concat(plugin.dataToLoad());
		}

		for (let atlas of atlasJSONHash) {
			engine.loadAtlasJSONHash(atlas.key, atlas.imagePath, atlas.jsonPath);
		}
		for (let image of imagesToLoad) {
			engine.loadImage(image.key, image.path);
		}
		for (let spriteSheet of spriteSheetToLoad) {
			engine.loadSpriteSheet(spriteSheet.key, spriteSheet.path, spriteSheet.width, spriteSheet.height);
		}
		for (let data of dataToLoad) {
			engine.loadData(data.key, data.path);
		}

		engine.changeBackgroundColor(background);
	}

	/**
	 * @param {Engine} engine
	 * @param xSize
	 * @param ySize
	 */
	createBackgroundComponents(engine, xSize, ySize) {
		let backgroundComponents = this.skin.backgroundComponents();

		this.renderBackgroundComponents(backgroundComponents, engine);

		for (let plugin of this.plugins) {
			for (let modifier of plugin.backgroundColorModifier()) {
				engine.drawRectangle(0, 0, xSize, ySize, modifier);
			}
			this.renderBackgroundComponents(plugin.backgroundComponents(), engine);
		}
	}

	/**
	 * @private
	 * @param {{key: {string}, frame: {string}, animation: {frame: {string}, frames: {string}[], speed: {int}}, x: {int}, y: {int}, width: {int}, height: {int}}[]} backgroundComponents
	 * @param {Engine} engine
	 */
	renderBackgroundComponents(backgroundComponents, engine) {
		for (let backgroundComponent of backgroundComponents) {
			const background = engine.addTileSprite(
				backgroundComponent.x,
				backgroundComponent.y,
				backgroundComponent.width,
				backgroundComponent.height,
				backgroundComponent.key,
				backgroundComponent.frame,
				true
			);
			if (backgroundComponent.animation) {
				background.animations.add(
					backgroundComponent.animation.frame,
					backgroundComponent.animation.frames,
					backgroundComponent.animation.speed,
					true
				);
				background.animations.play(backgroundComponent.animation.frame);
			}
		}
	}

	createBallComponent(engine, initialXLocation, initialYLocation) {
		const ballComponent = this.skin.ballComponent();
		const sprite = engine.addSprite(initialXLocation, initialYLocation, ballComponent.key, false, ballComponent.frame);

		if (ballComponent.animation) {
			sprite.animations.add(
				ballComponent.animation.frame,
				ballComponent.animation.frames,
				ballComponent.animation.speed,
				true
			);
			sprite.animations.play(ballComponent.animation.frame);
		}

		return sprite;
	}

	createNetComponent(engine, initialXLocation, initialYLocation, groundGroup) {
		const netComponent = this.skin.netComponent();

		const net = engine.addImage(
			initialXLocation,
			initialYLocation,
			netComponent.key,
			netComponent.frame
		);
		groundGroup.add(net);
	}

	/**
	 * @param {Engine} engine
	 * @param xSize
	 * @param ySize
	 * @param groundHeight
	 * @param groundGroup
	 */
	createGroundComponents(engine, xSize, ySize, groundHeight, groundGroup) {
		let groundComponents = [];

		groundComponents = groundComponents.concat(this.skin.groundComponents());

		for (let plugin of this.plugins) {
			groundComponents = groundComponents.concat(plugin.groundComponents());
		}

		for (let groundComponent of groundComponents) {
			engine.addTileSprite(
				0,
				ySize - groundHeight,
				xSize,
				groundComponent.height || groundHeight,
				groundComponent.key,
				groundComponent.frame,
				true,
				groundGroup
			);
		}
	}

	cheer(engine, forHost, x, y) {
		const confettis = this.skin.confettisComponent();

		engine.emitParticules(
			x,
			y,
			(forHost ? 1 : -1) * 50,
			(forHost ? 1 : -1) * 250,
			25,
			150,
			confettis.key,
			(forHost ? confettis.hostFrames : confettis.clientFrames),
			50,
			false,
			3000,
			0,
			500
		);
	}
}
