import Skin from "../../../skins/skins/Skin";
import DefaultSkin from "../../../skins/skins/DefaultSkin";
import Plugin from "../../../skins/plugins/Plugin";
import MainScene from "../scene/MainScene";
import GameConfiguration from "../../configuration/GameConfiguration";

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

	preload(loader: Phaser.Loader.LoaderPlugin) {
		let atlasJSONHash = this.skin.atlasJSONHash();
		let imagesToLoad = this.skin.imagesToLoad(
			this.gameConfiguration.width(),
			this.gameConfiguration.height()
		);
		let spriteSheetToLoad = this.skin.spriteSheetsToLoad();

		for (let plugin of this.plugins) {
			atlasJSONHash = atlasJSONHash.concat(plugin.atlasJSONHash());
			imagesToLoad = imagesToLoad.concat(plugin.imagesToLoad());
			spriteSheetToLoad = spriteSheetToLoad.concat(plugin.spriteSheetsToLoad());
		}

		for (let atlas of atlasJSONHash) {
			loader.atlas(atlas.key, atlas.imagePath, atlas.jsonPath);
		}
		for (let image of imagesToLoad) {
			loader.image(image.key, image.path);
		}
		for (let spriteSheet of spriteSheetToLoad) {
			loader.spritesheet(spriteSheet.key, spriteSheet.path, { frameWidth: spriteSheet.width, frameHeight: spriteSheet.height });
		}
	}

	createGroundComponents(scene: MainScene) {
		let groundComponents = [];

		groundComponents = groundComponents.concat(this.skin.groundComponents());

		for (let plugin of this.plugins) {
			groundComponents = groundComponents.concat(plugin.groundComponents());
		}

		for (let groundComponent of groundComponents) {
			let y = this.gameConfiguration.height() - this.gameConfiguration.groundHeight() / 2;
			let groundHeight = this.gameConfiguration.groundHeight();
			if (groundComponent.height) {
				y = this.gameConfiguration.height() - this.gameConfiguration.groundHeight() + groundComponent.height / 2;
				groundHeight = groundComponent.height;
			}

			scene.add.tileSprite(
				this.gameConfiguration.width() / 2,
				y,
				this.gameConfiguration.width(),
				groundHeight,
				groundComponent.key,
				groundComponent.frame
			);
		}
	}

	createNetComponent(scene: MainScene) {
		scene.add.image(
			this.gameConfiguration.width() / 2,
			this.gameConfiguration.height() - this.gameConfiguration.groundHeight() - this.gameConfiguration.netHeight() / 2,
			this.skin.netComponent().key,
			this.skin.netComponent().frame
		);
	}

	createBallComponent(scene: MainScene): Phaser.Physics.Matter.Sprite {
		const ballComponent = this.skin.ballComponent();

		let frame = ballComponent.frame;
		if (ballComponent.animation) {
			frame = ballComponent.animation.frames[0];
		}

		const ballObject = scene.matter.add.sprite(
			this.gameConfiguration.ballInitialHostX(),
			this.gameConfiguration.ballInitialY(),
			ballComponent.key,
			frame
		);

		if (ballComponent.animation) {
			this.animate(scene, ballObject, ballComponent);
		}

		return ballObject;
	}

	createBackgroundComponents(scene: MainScene) {
		let backgroundComponents = this.skin.backgroundComponents(
			this.gameConfiguration.width(),
			this.gameConfiguration.height()
		);

		this.renderBackgroundComponents(scene, backgroundComponents);

		for (let plugin of this.plugins) {
			for (let modifier of plugin.backgroundColorModifier()) {
				scene.add.rectangle(
					this.gameConfiguration.width() / 2,
					this.gameConfiguration.height() / 2,
					this.gameConfiguration.width(),
					this.gameConfiguration.height(),
					modifier.color,
					modifier.opacity
				);
			}

			this.renderBackgroundComponents(
				scene,
				plugin.backgroundComponents(
					this.gameConfiguration.width(),
					this.gameConfiguration.height()
				)
			);
		}
	}

	cheer(
		scene: MainScene,
		forHost: boolean
	) {
		const confettis = this.skin.confettisComponent();
		const x = forHost ? 0 : this.gameConfiguration.width();
		const y = this.gameConfiguration.height() * 0.10 + 25;

		const particles = scene.add.particles(confettis.key);
		let emittedParticles = 0;
		const maxParticles = 50;
		const emitter = particles.createEmitter({
			frame: (forHost ? confettis.hostFrames : confettis.clientFrames),
			x: x,
			y: y,
			lifespan: 5000,
			maxParticles: maxParticles,
			angle: {min: (forHost ? 10 : 120), max: (forHost ? 60 : 170)},
			speed: {min: (forHost ? 1 : -1) * 25, max: (forHost ? 1 : -1) * 300},
			rotate: {min: 0, max: 360},
			gravityY: 100,
			emitCallback: () => {
				emittedParticles++;

				if (emittedParticles > maxParticles) {
					emitter.stop();
					particles.destroy();
				}
			},
		});
	}

	private renderBackgroundComponents(
		scene: MainScene,
		backgroundComponents: { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number }, x: number, y: number, width: number, height: number }[]
	) {
		for (let backgroundComponent of backgroundComponents) {
			let frame = backgroundComponent.frame;
			if (backgroundComponent.animation) {
				frame = backgroundComponent.animation.frames[0];
			}

			const background = scene.add.tileSprite(
				backgroundComponent.x + backgroundComponent.width / 2,
				backgroundComponent.y + backgroundComponent.height / 2,
				backgroundComponent.width,
				backgroundComponent.height,
				backgroundComponent.key,
				frame
			);

			if (backgroundComponent.animation) {
				this.animate(scene, background, backgroundComponent);
			}
		}
	}

	private animate(
		scene: MainScene,
		sprite: Phaser.GameObjects.Sprite,
		component: { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number } }
	) {
		const frames = [];
		for (let frame of component.animation.frames) {
			frames.push({
				key: component.key,
				frame: frame
			});
		}

		scene.anims.create({
			key: component.animation.frame,
			frames: frames,
			frameRate: component.animation.speed,
			repeat: -1
		});

		if (sprite.anims) {
			//@todo Animate tilesprite
			sprite.anims.play(component.animation.frame);
		}
	}
}
