export default class GameSkin {
	/**
	 * @param {Skin} skin
	 */
	constructor(skin) {
		this.skin = skin;
	}

	init() {
		this.skin.init();
	}

	/**
	 * @param {Engine} engine
	 */
	preload(engine) {
		for (let image of this.skin.imagesToLoad()) {
			engine.loadImage(image.key, image.path);
		}
		for (let spriteSheet of this.skin.spriteSheetsToLoad()) {
			engine.loadSpriteSheet(spriteSheet.key, spriteSheet.path, spriteSheet.width, spriteSheet.height);
		}
		for (let data of this.skin.dataToLoad()) {
			engine.loadData(data.key, data.path);
		}

		engine.changeBackgroundColor(this.skin.backgroundColor());
	}

	/**
	 * @param {Engine} engine
	 * @param xSize
	 * @param ySize
	 */
	createBackgroundComponent(engine, xSize, ySize) {
		for (let backgroundComponent of this.skin.backgroundComponents()) {
			const background = engine.addTileSprite(xSize / 2, ySize / 2, xSize, ySize, backgroundComponent.key);
			if (backgroundComponent.animate) {
				background.animations.add('animation');
				background.animations.play('animation', 5, true);
			}
			engine.setStatic(background, true);
			background.sendToBack();
		}
	}
}
