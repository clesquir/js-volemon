import Skin from './Skin';

export default class DefaultSkin implements Skin {
	init() {
	}

	atlasJSONHash(): { key: string, imagePath: string, jsonPath: string }[] {
		return [
			{
				key: 'default-skin',
				imagePath: '/assets/skin/default/texture-atlas.png',
				jsonPath: '/assets/skin/default/texture-atlas.json'
			}
		];
	}

	imagesToLoad(xSize: number, ySize: number): { key: string, path: string }[] {
		return [];
	}

	spriteSheetsToLoad(): { key: string, path: string, width: number, height: number }[] {
		return [];
	}

	backgroundColor(): string {
		return '#9ad3de';
	}

	backgroundComponents(xSize: number, ySize: number): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number }, x: number, y: number, width: number, height: number }[] {
		return [];
	}

	ballComponent(): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number } } {
		return {
			key: 'default-skin',
			frame: 'ball'
		};
	}

	netComponent(): { key: string; frame: string } {
		return {
			key: 'default-skin',
			frame: 'net'
		};
	}

	groundComponents(): { key: string; frame: string, height?: number }[] {
		return [
			{
				key: 'default-skin',
				frame: 'ground'
			}
		];
	}

	confettisComponent(): { clientFrames: string[]; hostFrames: string[]; key: string } {
		return {
			key: 'default-skin',
			hostFrames: ['confettis-red-1', 'confettis-red-2', 'confettis-red-3', 'confettis-red-4', 'confettis-red-5'],
			clientFrames: ['confettis-blue-1', 'confettis-blue-2', 'confettis-blue-3', 'confettis-blue-4', 'confettis-blue-5']
		};
	}
}
