import MainScene from "../scene/MainScene";
import DeviceController from "../../deviceController/DeviceController";
import GameData from "../../data/GameData";
import SkinManager from "../component/SkinManager";
import StreamBundler from "../streamBundler/StreamBundler";
import GameConfiguration from "../../configuration/GameConfiguration";
import ServerAdapter from "../serverAdapter/ServerAdapter";
import NormalizedTime from "../../../../lib/normalizedTime/NormalizedTime";

// @ts-ignore
window.PIXI = require('phaser-ce/build/custom/pixi');
// @ts-ignore
window.p2 = require('phaser-ce/build/custom/p2');
// @ts-ignore
window.Phaser = require('phaser-ce/build/custom/phaser-split');

export declare type GameBootConfiguration = {
	renderer?: number;
	parent?: string;
	postBoot?: () => void;
	debug?: boolean;
};

export class GameBoot {
	deviceController: DeviceController;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;
	streamBundler: StreamBundler;
	normalizedTime: NormalizedTime;
	serverAdapter: ServerAdapter;

	game: Phaser.Game;
	mainScene: MainScene;

	constructor(
		deviceController: DeviceController,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		skinManager: SkinManager,
		streamBundler: StreamBundler,
		normalizedTime: NormalizedTime,
		serverAdapter: ServerAdapter
	) {
		this.deviceController = deviceController;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.skinManager = skinManager;
		this.streamBundler = streamBundler;
		this.normalizedTime = normalizedTime;
		this.serverAdapter = serverAdapter;
	}

	start(configuration: GameBootConfiguration) {
		let renderer = Phaser.AUTO;
		let parent = 'game-container';
		let postBoot = () => {};
		let debug = false;

		if (configuration.renderer !== undefined) {
			renderer = configuration.renderer;
		}
		if (configuration.parent !== undefined) {
			parent = configuration.parent;
		}
		if (configuration.postBoot !== undefined) {
			postBoot = configuration.postBoot;
		}
		if (configuration.debug !== undefined) {
			debug = configuration.debug;
		}

		this.game = new Phaser.Game({
			renderer: renderer,
			enableDebug: debug,
			parent: parent,
			disableVisibilityChange: true,
			physicsConfig: {
				p2: true
			},
			width: this.gameConfiguration.width(),
			height: this.gameConfiguration.height(),
			backgroundColor: this.skinManager.backgroundColor()
		});

		this.mainScene = new MainScene(
			this.game,
			this.deviceController,
			this.gameData,
			this.gameConfiguration,
			this.skinManager,
			this.streamBundler,
			this.normalizedTime,
			this.serverAdapter
		);

		this.game.state.add('boot', {
			create: () => {
				this.game.physics.startSystem(Phaser.Physics.P2JS);
				this.game.physics.p2.setImpactEvents(true);
				this.game.physics.p2.gravity.y = this.gameConfiguration.worldGravity();
				this.game.physics.p2.world.defaultContactMaterial.friction = 0;
				this.game.physics.p2.world.setGlobalStiffness(1e10);
				this.game.physics.p2.restitution = 0;

				postBoot();
				this.game.state.start('load');
			}
		});

		this.game.state.add('load', {
			create: () => {
				this.mainScene.preload.call(this.mainScene);

				this.game.load.onLoadComplete.add(() => {
					if (this.game.state) {
						this.game.state.start('play');
					}
				}, this);
				this.game.load.start();
			}
		});

		this.game.state.add('play', {
			preload: () => {},
			create: () => {
				this.mainScene.create.call(this.mainScene);
			},
			update: () => {
				this.mainScene.update.call(this.mainScene);
			}
		});

		this.game.state.start('boot');
	}

	stop() {
		this.deviceController.stopMonitoring();
		this.mainScene.destroy();
		this.game.state.destroy();
		this.game.destroy();
	}
}
