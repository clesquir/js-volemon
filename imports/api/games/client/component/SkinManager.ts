import Skin from "../../../skins/skins/Skin";
import DefaultSkin from "../../../skins/skins/DefaultSkin";
import Plugin from "../../../skins/plugins/Plugin";
import MainScene from "../scene/MainScene";
import GameConfiguration from "../../configuration/GameConfiguration";
import {DEPTH_LEVEL} from "../../constants";

export default class SkinManager {
	gameConfiguration: GameConfiguration;
	skin: Skin;
	plugins: Plugin[];

	constructor(gameConfiguration: GameConfiguration, skin: Skin, plugins: Plugin[] = []) {
		this.gameConfiguration = gameConfiguration;
		this.skin = skin;
		this.plugins = plugins;
	}

	static withDefaults(gameConfiguration: GameConfiguration): SkinManager {
		return new SkinManager(gameConfiguration, new DefaultSkin(), []);
	}

	init() {
		this.skin.init();

		for (let plugin of this.plugins) {
			plugin.init();
		}
	}

	backgroundColor(): string {
		return this.skin.backgroundColor();
	}

	preload(loader: Phaser.Loader) {
		let atlasJSONHash = this.skin.atlasJSONHash();
		let imagesToLoad = this.skin.imagesToLoad(
			this.gameConfiguration.width(),
			this.gameConfiguration.height()
		);

		for (let plugin of this.plugins) {
			atlasJSONHash = atlasJSONHash.concat(plugin.atlasJSONHash());
			imagesToLoad = imagesToLoad.concat(plugin.imagesToLoad());
		}

		for (let atlas of atlasJSONHash) {
			loader.atlasJSONHash(atlas.key, atlas.imagePath, atlas.jsonPath);
		}
		for (let image of imagesToLoad) {
			loader.image(image.key, image.path);
		}
	}

	createGroundComponents(scene: MainScene): Phaser.TileSprite[] {
		const groundTileSprites = [];
		let groundComponents = [];

		groundComponents = groundComponents.concat(this.skin.groundComponents());

		for (let plugin of this.plugins) {
			groundComponents = groundComponents.concat(plugin.groundComponents());
		}

		for (let groundComponent of groundComponents) {
			let y = this.gameConfiguration.height() - this.gameConfiguration.groundHeight();
			let groundHeight = this.gameConfiguration.groundHeight();
			if (groundComponent.height) {
				groundHeight = groundComponent.height;
			}

			const ground = scene.game.add.tileSprite(
				0,
				y,
				this.gameConfiguration.width(),
				groundHeight,
				groundComponent.key,
				groundComponent.frame
			);
			groundTileSprites.push(ground);

			// @ts-ignore
			ground.depth = DEPTH_LEVEL;
			scene.zIndexGroup.add(ground);
		}

		return groundTileSprites;
	}

	createNetComponent(scene: MainScene) {
		const net = scene.game.add.tileSprite(
			this.gameConfiguration.width() / 2 - this.gameConfiguration.netWidth() / 2,
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() - this.gameConfiguration.netHeight(),
			this.gameConfiguration.netWidth(),
			this.gameConfiguration.netHeight(),
			this.skin.netComponent().key,
			this.skin.netComponent().frame
		);

		// @ts-ignore
		net.depth = DEPTH_LEVEL;
		scene.zIndexGroup.add(net);
	}

	createSoccerNetComponent(scene: MainScene) {
		const hostNet = scene.game.add.tileSprite(
			0,
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() - this.gameConfiguration.soccerNetHeight(),
			this.gameConfiguration.soccerNetWidth(),
			this.gameConfiguration.soccerNetHeight(),
			this.skin.soccerHostNetComponent().key,
			this.skin.soccerHostNetComponent().frame
		);

		// @ts-ignore
		hostNet.depth = DEPTH_LEVEL;
		scene.zIndexGroup.add(hostNet);

		const clientNet = scene.game.add.tileSprite(
			this.gameConfiguration.width() - this.gameConfiguration.soccerNetWidth(),
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() - this.gameConfiguration.soccerNetHeight(),
			this.gameConfiguration.soccerNetWidth(),
			this.gameConfiguration.soccerNetHeight(),
			this.skin.soccerClientNetComponent().key,
			this.skin.soccerClientNetComponent().frame
		);

		// @ts-ignore
		clientNet.depth = DEPTH_LEVEL;
		scene.zIndexGroup.add(clientNet);
	}

	createBallComponent(scene: MainScene): Phaser.Sprite {
		const ballComponent = this.skin.ballComponent();

		let frame = ballComponent.frame;
		if (ballComponent.animation) {
			frame = ballComponent.animation.frames[0];
		}

		const ballObject = scene.game.add.sprite(
			this.gameConfiguration.ballInitialHostX(),
			this.gameConfiguration.ballInitialY(),
			ballComponent.key,
			frame
		);

		if (ballComponent.animation) {
			this.animate(ballObject, ballComponent);
		}

		return ballObject;
	}

	createBackgroundComponents(gameObjectFactory: Phaser.GameObjectFactory) {
		let backgroundComponents = this.skin.backgroundComponents(
			this.gameConfiguration.width(),
			this.gameConfiguration.height()
		);

		this.renderBackgroundComponents(gameObjectFactory, backgroundComponents);

		for (let plugin of this.plugins) {
			for (let modifier of plugin.backgroundColorModifier()) {
				const graphics = gameObjectFactory.graphics(0, 0);

				graphics.beginFill(modifier.color, modifier.opacity);
				graphics.drawRect(0, 0, this.gameConfiguration.width(), this.gameConfiguration.height());
				graphics.endFill();
			}

			this.renderBackgroundComponents(
				gameObjectFactory,
				plugin.backgroundComponents(
					this.gameConfiguration.width(),
					this.gameConfiguration.height()
				)
			);
		}
	}

	cheer(
		gameObjectFactory: Phaser.GameObjectFactory,
		forHost: boolean
	) {
		const confettis = this.skin.confettisComponent();
		const x = forHost ? 0 : this.gameConfiguration.width();
		const y = this.gameConfiguration.height() * 0.10 + 25;

		const emitter = gameObjectFactory.emitter(x, y);
		emitter.bounce.setTo(0.5);
		emitter.setXSpeed((forHost ? 1 : -1) * 50, (forHost ? 1 : -1) * 250);
		emitter.setYSpeed(25, 150);
		emitter.makeParticles(confettis.key, (forHost ? confettis.hostFrames : confettis.clientFrames), 50);
		emitter.start(false, 3000, 0, 500);
	}

	private renderBackgroundComponents(
		gameObjectFactory: Phaser.GameObjectFactory,
		backgroundComponents: { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number }, x: number, y: number, width: number, height: number }[]
	) {
		for (let backgroundComponent of backgroundComponents) {
			let frame = backgroundComponent.frame;
			if (backgroundComponent.animation) {
				frame = backgroundComponent.animation.frames[0];
			}

			const background = gameObjectFactory.tileSprite(
				backgroundComponent.x,
				backgroundComponent.y,
				backgroundComponent.width,
				backgroundComponent.height,
				backgroundComponent.key,
				frame
			);

			if (backgroundComponent.animation) {
				this.animate(background, backgroundComponent);
			}
		}
	}

	private animate(
		sprite: Phaser.Sprite | Phaser.TileSprite,
		component: { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number } }
	) {
		sprite.animations.add(
			component.animation.frame,
			component.animation.frames,
			component.animation.speed,
			true
		);
		sprite.animations.play(component.animation.frame);
	}
}
