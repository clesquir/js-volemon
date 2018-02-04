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
			engine.loadAtlas(atlas.key, atlas.imagePath, atlas.jsonPath);
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
				engine.playAnimation(background, backgroundComponent.animation);
			}
		}
	}

	/**
	 * @param {Engine} engine
	 * @param initialXLocation
	 * @param initialYLocation
	 * @returns {*}
	 */
	createBallComponent(engine, initialXLocation, initialYLocation) {
		const ballComponent = this.skin.ballComponent();
		const sprite = engine.addSprite(initialXLocation, initialYLocation, ballComponent.key, false, ballComponent.frame);

		if (ballComponent.animation) {
			engine.playAnimation(sprite, ballComponent.animation);
		}

		return sprite;
	}

	createNetComponent(engine, initialXLocation, initialYLocation, width, height, groundGroup) {
		const netComponent = this.skin.netComponent();

		const net = engine.addImage(
			initialXLocation,
			initialYLocation,
			netComponent.key,
			netComponent.frame
		);
		engine.setWidth(net, width);
		engine.setHeight(net, height);
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
