export default class GameSkin {
	/**
	 * @param {Skin} skin
	 * @param {Plugin[]} plugins
	 */
	constructor(skin, plugins) {
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
		let imagesToLoad = this.skin.imagesToLoad();
		let spriteSheetToLoad = this.skin.spriteSheetsToLoad();
		let dataToLoad = this.skin.dataToLoad();
		let background = this.skin.backgroundColor();

		for (let plugin of this.plugins) {
			imagesToLoad = imagesToLoad.concat(plugin.imagesToLoad());
			spriteSheetToLoad = spriteSheetToLoad.concat(plugin.spriteSheetsToLoad());
			dataToLoad = dataToLoad.concat(plugin.dataToLoad());
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

		for (let plugin of this.plugins) {
			backgroundComponents = backgroundComponents.concat(plugin.backgroundComponents());
		}

		for (let backgroundComponent of backgroundComponents) {
			const background = engine.addTileSprite(
				0,
				0,
				xSize,
				ySize,
				backgroundComponent.key,
				undefined,
				true
			);
			if (backgroundComponent.animate) {
				background.animations.add('animation');
				background.animations.play('animation', 5, true);
			}
		}
	}

	/**
	 * @param {Engine} engine
	 * @param xSize
	 * @param ySize
	 * @param groundHeight
	 * @param levelGroup
	 */
	createGroundComponents(engine, xSize, ySize, groundHeight, levelGroup) {
		let groundComponents = [];

		for (let plugin of this.plugins) {
			groundComponents = groundComponents.concat(plugin.groundComponents());
		}

		for (let groundComponent of groundComponents) {
			engine.addTileSprite(
				0,
				ySize - groundHeight,
				xSize,
				groundHeight,
				groundComponent,
				levelGroup,
				true
			);
		}
	}
}
