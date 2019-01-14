import MainScene from "./scene/MainScene";
import DeviceController from "../deviceController/DeviceController";
import GameData from "../data/GameData";
import SkinManager from "./skin/SkinManager";
import StreamBundler from "./streamBundler/StreamBundler";
import ServerNormalizedTime from "./ServerNormalizedTime";
import GameConfiguration from "../configuration/GameConfiguration";

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
	game: Phaser.Game;
	mainScene: MainScene | any;
	system: Phaser.Scenes.Systems;

	constructor(
		deviceController: DeviceController,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		skinManager: SkinManager,
		streamBundler: StreamBundler,
		serverNormalizedTime: ServerNormalizedTime
	) {
		this.deviceController = deviceController;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.skinManager = skinManager;
		this.streamBundler = streamBundler;
		this.serverNormalizedTime = serverNormalizedTime;
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
				postBoot: postBoot
			}
		});

		this.game.scene.add(
			'MainScene',
			MainScene,
			true,
			{
				deviceController: this.deviceController,
				gameData: this.gameData,
				gameConfiguration: this.gameConfiguration,
				skinManager: this.skinManager,
				streamBundler: this.streamBundler,
				serverNormalizedTime: this.serverNormalizedTime
			}
		);

		this.mainScene = this.game.scene.getScene('MainScene');
	}

	stop() {
		this.game.destroy(true);
	}
}
