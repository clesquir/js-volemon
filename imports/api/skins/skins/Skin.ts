export default interface Skin {
	init();

	atlasJSONHash(): { key: string, imagePath: string, jsonPath: string }[];

	imagesToLoad(xSize: number, ySize: number): { key: string, path: string }[];

	backgroundColor(): string;

	backgroundComponents(xSize: number, ySize: number): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number }, x: number, y: number, width: number, height: number }[];

	ballComponent(): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number } };

	netComponent(): { key: string, frame: string };

	soccerNetComponent(): { key: string; frame: string };

	soccerPostComponent(): { key: string; frame: string };

	groundComponents(): { key: string, frame: string, height?: number }[];

	confettisComponent(): { key: string, hostFrames: string[], clientFrames: string[] };
}
