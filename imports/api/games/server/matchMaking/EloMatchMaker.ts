import {
	isTwoVersusTwoGameMode,
	ONE_VS_COMPUTER_GAME_MODE,
	ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE,
	ONE_VS_ONE_GAME_MODE,
	TWO_VS_TWO_GAME_MODE
} from "../../constants";
import MatchMaker from "./MatchMaker";
import {INITIAL_ELO_RATING} from "../../../profiles/constants";
import {Profiles} from "../../../profiles/profiles";

export default class EloMatchMaker extends MatchMaker {
	protected matchedUsers(match: any): {id: string, name: string, isMachineLearning?: boolean}[] {
		let gameMode = this.gameMode(match);

		switch (gameMode) {
			case ONE_VS_COMPUTER_GAME_MODE:
				return [match.usersToMatch[0], {id: 'CPU', name: 'CPU'}];
			case ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE:
				return [match.usersToMatch[0], {id: 'CPU', isMachineLearning: true, name: 'ML CPU'}];
			case ONE_VS_ONE_GAME_MODE:
				if (match.usersToMatch.length === 2) {
					const matchedUsers = this.sortByEloRating(
						gameMode,
						match.usersToMatch,
						match.tournamentId
					);

					//Highest is host
					return [matchedUsers[1], matchedUsers[0]];
				}
				break;
			case TWO_VS_TWO_GAME_MODE:
				if (match.usersToMatch.length === 4) {
					let matchedUsers = [];

					if (this.numberOfMatchedComputers(match.usersToMatch) === 2) {
						const matchedComputers = this.getMatchedComputers(match.usersToMatch);
						const matchedHumans = this.sortByEloRating(
							gameMode,
							this.getMatchedHumans(match.usersToMatch),
							match.tournamentId
						);

						matchedUsers = [
							matchedComputers[0],
							matchedHumans[0],
							matchedComputers[1],
							matchedHumans[1],
						];
					} else {
						matchedUsers = this.sortByEloRating(
							gameMode,
							match.usersToMatch,
							match.tournamentId
						);
					}

					//Match highest 3 with lowest 0 and both middle together
					//Highest will be the host
					return [matchedUsers[3], matchedUsers[1], matchedUsers[0], matchedUsers[2]];
				}
				break;
		}

		return [];
	}

	private sortByEloRating(
		gameMode: string,
		usersToMatch: {id: string, name: string}[],
		tournamentId: string
	): {id: string, name: string}[] {
		const randomizedUsers = this.randomizeUsers(usersToMatch);
		const unsortedUsers = {};
		for (let user of randomizedUsers) {
			const eloRating = this.getEloRating(gameMode, tournamentId, user.id);

			if (unsortedUsers[eloRating] === undefined) {
				unsortedUsers[eloRating] = [];
			}
			unsortedUsers[eloRating].push(user);
		}

		const sortedUsers = [];
		Object.keys(unsortedUsers).sort((a, b) => parseInt(a) - parseInt(b)).forEach(function(key) {
			for (let user of unsortedUsers[key]) {
				sortedUsers.push(user);
			}
		});

		return sortedUsers;
	}

	private getEloRating(gameMode: string, tournamentId: string, userId: string): number {
		let profile = Profiles.findOne({userId: userId});

		if (profile) {
			if (isTwoVersusTwoGameMode(gameMode)) {
				return profile.teamEloRating || INITIAL_ELO_RATING;
			} else {
				return profile.eloRating || INITIAL_ELO_RATING;
			}
		} else {
			return INITIAL_ELO_RATING;
		}
	}
}
