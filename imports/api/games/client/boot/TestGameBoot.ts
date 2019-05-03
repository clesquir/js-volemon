import DeviceController from "../../deviceController/DeviceController";
import GameData from "../../data/GameData";
import SkinManager from "../component/SkinManager";
import StreamBundler from "../streamBundler/StreamBundler";
import ServerNormalizedTime from "../ServerNormalizedTime";
import GameConfiguration from "../../configuration/GameConfiguration";
import ServerAdapter from "../serverAdapter/ServerAdapter";
import {GameBoot} from "./GameBoot";
import {PLAYER_LIST_OF_SHAPES} from "../../shapeConstants";

export class TestGameBoot {
	deviceController: DeviceController;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;
	streamBundler: StreamBundler;
	serverNormalizedTime: ServerNormalizedTime;
	serverAdapter: ServerAdapter;
	gameBoot: GameBoot;

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

		this.gameBoot = new GameBoot(
			this.deviceController,
			this.gameData,
			this.gameConfiguration,
			this.skinManager,
			this.streamBundler,
			this.serverNormalizedTime,
			this.serverAdapter
		);
	}

	init() {
		const parent = 'test-game-boot';

		const element = document.createElement('div');
		element.setAttribute('id', parent);

		// @ts-ignore
		window.PhaserGlobal = {
			disableAudio: true,
			disableWebAudio: true,
			hideBanner: true,
		};

		this.gameBoot.start({
			renderer: Phaser.HEADLESS,
			parent: parent,
		});
	}

	warmUpCache() {
		for (let shape of PLAYER_LIST_OF_SHAPES) {
			this.gameBoot.game.cache.addImage('shape-' + shape + '-host', '', {});
			this.gameBoot.game.cache.addImage('shape-' + shape + '-client', '', {});
		}
		this.gameBoot.game.cache.addImage('default-skin', '', {});
		this.gameBoot.game.cache.addImage('bonus-icon', '', {});
	}
}
