import Skin from './Skin';

export default class JujuWorldSkin implements Skin {
	init() {
	}

	atlasJSONHash(): { key: string, imagePath: string, jsonPath: string }[] {
		return [
			{
				key: 'juju-world-skin',
				imagePath: '/assets/skin/juju-world/texture-atlas.png',
				jsonPath: '/assets/skin/juju-world/texture-atlas.json'
			}
		];
	}

	imagesToLoad(xSize: number, ySize: number): { key: string, path: string }[] {
		let background = 840;
		if (xSize > 840) {
			background = 1020;
		}

		return [
			{key: 'background', path: `/assets/skin/juju-world/background-${background}.png`}
		];
	}

	backgroundColor(): string {
		return '#000000';
	}

	backgroundComponents(xSize: number, ySize: number): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number }, x: number, y: number, width: number, height: number }[] {
		return [
			{key: 'background', x: 0, y: 0, width: xSize, height: ySize}
		];
	}

	ballComponent(): { key: string, frame?: string, animation?: { frame: string, frames: string[], speed: number } } {
		return {
			key: 'juju-world-skin',
			animation: {
				frame: 'ball',
				frames: ['ball-1', 'ball-2', 'ball-3', 'ball-4', 'ball-5', 'ball-6', 'ball-7', 'ball-8'],
				speed: 5
			}
		};
	}

	netComponent(): { key: string; frame: string } {
		return {
			key: 'juju-world-skin',
			frame: 'net'
		};
	}

	soccerNetComponent(): { key: string; frame: string } {
		return {
			key: 'juju-world-skin',
			frame: 'soccer-net'
		};
	}

	soccerPostComponent(): { key: string; frame: string } {
		return {
			key: 'juju-world-skin',
			frame: 'soccer-post'
		};
	}

	groundComponents(): { key: string; frame: string, height?: number }[] {
		return [
			{
				key: 'juju-world-skin',
				frame: 'ground'
			}
		];
	}

	confettisComponent(): { clientFrames: string[]; hostFrames: string[]; key: string } {
		return {
			key: 'juju-world-skin',
			hostFrames: ['confettis-juju-nipple', 'confettis-kwak'],
			clientFrames: ['confettis-chateau-nipple', 'confettis-chateau-beard']
		};
	}
}
