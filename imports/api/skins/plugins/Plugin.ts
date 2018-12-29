export default interface Plugin {
	start();

	init();

	atlasJSONHash(): { key: string, imagePath: string, jsonPath: string }[];

	imagesToLoad(): { key: string, path: string }[];

	spriteSheetsToLoad(): { key: string, path: string, width: number, height: number }[];

	backgroundColorModifier(): { color: string, opacity: number }[];

	backgroundComponents(xSize: number, ySize: number): { key: string, frame: string, animation: { frame: string, frames: string[], speed: number }, x: number, y: number, width: number, height: number }[];

	groundComponents(): { key: string, frame: string, height?: number }[];
}
