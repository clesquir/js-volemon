import MainScene from "./scene/MainScene";
import DeviceController from "../deviceController/DeviceController";
import GameData from "../data/GameData";
import SkinManager from "./components/SkinManager";
import StreamBundler from "./streamBundler/StreamBundler";
import ServerNormalizedTime from "./ServerNormalizedTime";
import GameConfiguration from "../configuration/GameConfiguration";
import ServerAdapter from "./serverAdapter/ServerAdapter";
import {MainSceneConfigurationData} from "./scene/MainSceneConfigurationData";
const MatterBody = require('phaser/src/physics/matter-js/lib/body/Body');

export declare type GameBootConfiguration = {
	type?: number;
	postBoot?: BootCallback;
	debug?: boolean;
};

export class GameBoot {
	deviceController: DeviceController;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;
	streamBundler: StreamBundler;
	serverNormalizedTime: ServerNormalizedTime;
	serverAdapter: ServerAdapter;
	game: Phaser.Game;
	mainScene: MainScene | any;
	system: Phaser.Scenes.Systems;

	constructor(
		deviceController: DeviceController,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		skinManager: SkinManager,
		streamBundler: StreamBundler,
		serverNormalizedTime: ServerNormalizedTime,
		serverAdapter: ServerAdapter
	) {
		this.deviceController = deviceController;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.skinManager = skinManager;
		this.streamBundler = streamBundler;
		this.serverNormalizedTime = serverNormalizedTime;
		this.serverAdapter = serverAdapter;
	}

	init(configuration: GameBootConfiguration) {
		let type = Phaser.AUTO;
		let postBoot = undefined;
		let debug = false;

		if (configuration.type !== undefined) {
			type = configuration.type;
		}
		if (configuration.postBoot !== undefined) {
			postBoot = configuration.postBoot;
		}
		if (configuration.debug !== undefined) {
			debug = configuration.debug;
		}

		this.game = new Phaser.Game({
			type: type,
			parent: 'game-container',
			width: this.gameConfiguration.width(),
			height: this.gameConfiguration.height(),
			backgroundColor: this.skinManager.backgroundColor(),
			physics: {
				default: 'matter',
				matter: {
					gravity: {
						x: 0,
						y: this.gameConfiguration.worldGravity()
					},
					setBounds: false,
					debug: debug
				}
			},
			callbacks: {
				postBoot: (game: Phaser.Game) => {
					this.mainScene = <any>game.scene.getScene('MainScene');

					postBoot(game);
				}
			}
		});

		this.game.scene.add(
			'MainScene',
			MainScene,
			true,
			<MainSceneConfigurationData>{
				deviceController: this.deviceController,
				gameData: this.gameData,
				gameConfiguration: this.gameConfiguration,
				skinManager: this.skinManager,
				streamBundler: this.streamBundler,
				serverNormalizedTime: this.serverNormalizedTime,
				serverAdapter: this.serverAdapter
			}
		);
	}

	stop() {
		this.deviceController.stopMonitoring();
		this.mainScene.destroy();
		this.game.destroy(true);

		//@todo https://github.com/photonstorm/phaser/pull/4334
		MatterBody._nextCategory = 0x0001;
	}
}
