import MatchMaker from "./MatchMaker";
import EloMatchMaker from "./EloMatchMaker";
import ImmediateMatchMaker from "./ImmediateMatchMaker";
import RandomMatchMaker from "./RandomMatchMaker";

export default class MatchMakerFactory {
	static fromConfiguration(configuration: string): MatchMaker {
		switch (configuration) {
			case 'immediate':
				return new ImmediateMatchMaker();
			case 'elo':
				return new EloMatchMaker();
			case 'random':
				return new RandomMatchMaker();
		}

		throw 'Invalid match maker';
	}
}
