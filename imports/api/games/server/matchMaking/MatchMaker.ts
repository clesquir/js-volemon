import {Games} from "../../games";
import {MatchMakers} from "../../matchMakers";
import UserMatch from "./UserMatch";
import {Random} from 'meteor/random';
import {ONE_VS_ONE_GAME_MODE, TOURNAMENT_GAME_SELECTION} from "../../constants";
import {Tournaments} from "../../../tournaments/tournaments";

export default class MatchMaker {
	subscribe(user: {id: string}, modeSelection: string, tournamentId: string) {
		let match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});

		if (match) {
			if (!this.userPresentInArray(match.usersToMatch, user.id)) {
				this.addToUserToMatch(user, modeSelection, tournamentId);
			}
		} else {
			this.initMatchMaker(user, modeSelection, tournamentId);
		}

		//Complete match
		match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});
		const matchedUsers = this.matchedUsers(match);
		if (matchedUsers.length > 0) {
			UserMatch.match(modeSelection, tournamentId, matchedUsers);
		}
	}

	canUnsubscribe(userId: string): boolean {
		const match = MatchMakers.findOne({'matched.users.id': userId});

		if (match) {
			for (let matched of match.matched) {
				if (this.userPresentInArray(matched.users, userId)) {
					const game = Games.findOne(matched.gameId);

					if (game) {
						return !game.isReady;
					}
				}
			}
		}

		return true;
	}

	unsubscribe(userId: string): boolean {
		if (!this.canUnsubscribe(userId)) {
			return false;
		}

		let match = MatchMakers.findOne({'usersToMatch.id': userId});
		if (match) {
			MatchMakers.update(
				{_id: match._id},
				{$pull: {usersToMatch: {id: userId}}}
			);

			//Remove all computers left alone
			let hasHumans = false;
			let hasCpu = false;
			for (let userToMatch of match.usersToMatch) {
				if (userToMatch.id !== userId) {
					if (userToMatch.id === 'CPU') {
						hasCpu = true;
					} else {
						hasHumans = true;
					}
				}
			}

			if (!hasHumans && hasCpu) {
				MatchMakers.update(
					{_id: match._id},
					{$pull: {usersToMatch: {id: 'CPU'}}}
				);
			}
		}

		match = MatchMakers.findOne({'matched.users.id': userId});
		if (match) {
			MatchMakers.update(
				{_id: match._id},
				{$pull: {matched: {'users.id': userId}}}
			);
		}

		return true;
	}

	protected matchedUsers(match: any): {id: string, name: string, isMachineLearning?: boolean}[] {
		throw 'Abstract';
	}

	protected gameMode(match: any): string {
		let gameMode = match.modeSelection;
		if (match.modeSelection === TOURNAMENT_GAME_SELECTION) {
			const tournament = Tournaments.findOne(match.tournamentId);

			if (tournament && tournament.gameMode) {
				gameMode = tournament.gameMode;
			} else {
				gameMode = ONE_VS_ONE_GAME_MODE;
			}
		}

		return gameMode;
	}

	protected randomizeUsers(usersToMatch: {id: string, name: string}[]): {id: string, name: string}[] {
		const randomize = arr => arr
			.map(a => [Math.random(), a])
			.sort((a, b) => a[0] - b[0])
			.map(a => a[1]);

		return randomize(usersToMatch);
	}

	protected numberOfMatchedComputers(usersToMatch: {id: string}[]): number {
		let count = 0;

		for (let user of usersToMatch) {
			if (user.id === 'CPU') {
				count++;
			}
		}

		return count;
	}

	protected getMatchedComputers(usersToMatch: {id: string}[]): any[] {
		let computers = [];

		for (let user of usersToMatch) {
			if (user.id === 'CPU') {
				computers.push(user);
			}
		}

		return computers;
	}

	protected getMatchedHumans(usersToMatch: {id: string}[]): any[] {
		let humans = [];

		for (let user of usersToMatch) {
			if (user.id !== 'CPU') {
				humans.push(user);
			}
		}

		return humans;
	}

	private userPresentInArray(users: {id: string}[], userId: string): boolean {
		for (let user of users) {
			if (user.id === userId && userId !== 'CPU') {
				return true;
			}
		}

		return false;
	}

	private initMatchMaker(user: {id: string}, modeSelection: string, tournamentId: string) {
		MatchMakers.insert(
			{
				_id: Random.id(5),
				modeSelection: modeSelection,
				tournamentId: tournamentId,
				usersToMatch: [user],
				matched: []
			}
		);
	}

	private addToUserToMatch(user: {id: string}, modeSelection: string, tournamentId: string) {
		//Add to the usersToMatch
		MatchMakers.update(
			{modeSelection: modeSelection, tournamentId: tournamentId},
			{$push: {usersToMatch: user}}
		);
	}
}
