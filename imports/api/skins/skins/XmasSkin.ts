import Skin from './Skin';

export default class XmasSkin implements Skin {
	init() {
	}

	atlasJSONHash(): { key: string, imagePath: string, jsonPath: string }[] {
		return [
			{
				key: 'xmas-skin',
				imagePath: '/assets/skin/xmas/texture-atlas.png',
				jsonPath: '/assets/skin/xmas/texture-atlas.json'
			}
		];
	}

	imagesToLoad(xSize: number, ySize: number): { key: string, path: string }[] {
		let background = 840;
		if (xSize > 840) {
			background = 1020;
		}

		return [
			{key: 'background', path: `/assets/skin/xmas/background-${background}.png`}
		];
	}

	backgroundColor(): string {
		return '#00ccff';
	}

	backgroundComponents(xSize: number, ySize: number): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number }, x: number, y: number, width: number, height: number }[] {
		return [
			{key: 'background', x: 0, y: 0, width: xSize, height: ySize}
		];
	}

	ballComponent(): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number } } {
		return {
			key: 'xmas-skin',
			frame: 'ball'
		};
	}

	netComponent(): { key: string; frame: string } {
		return {
			key: 'xmas-skin',
			frame: 'net'
		};
	}

	soccerNetComponent(): { key: string; frame: string } {
		return {
			key: 'xmas-skin',
			frame: 'soccer-net'
		};
	}

	soccerPostComponent(): { key: string; frame: string } {
		return {
			key: 'xmas-skin',
			frame: 'soccer-post'
		};
	}

	groundComponents(): { key: string; frame: string, height?: number }[] {
		return [
			{
				key: 'xmas-skin',
				frame: 'ground'
			}
		];
	}

	confettisComponent(): { clientFrames: string[]; hostFrames: string[]; key: string } {
		return {
			key: 'xmas-skin',
			hostFrames: ['confettis-1', 'confettis-2', 'confettis-3', 'confettis-4'],
			clientFrames: ['confettis-1', 'confettis-2', 'confettis-3', 'confettis-4']
		};
	}
}
