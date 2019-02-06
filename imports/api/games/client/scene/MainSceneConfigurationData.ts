import DeviceController from "../../deviceController/DeviceController";
import GameData from "../../data/GameData";
import GameConfiguration from "../../configuration/GameConfiguration";
import SkinManager from "../component/SkinManager";
import StreamBundler from "../streamBundler/StreamBundler";
import ServerNormalizedTime from "../ServerNormalizedTime";
import ServerAdapter from "../serverAdapter/ServerAdapter";

export declare type MainSceneConfigurationData = {
	deviceController: DeviceController;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;
	streamBundler: StreamBundler;
	serverNormalizedTime: ServerNormalizedTime;
	serverAdapter: ServerAdapter;
}
