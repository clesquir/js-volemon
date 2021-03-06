import {EloScores} from "../../games/eloscores";
import {Profiles} from "../profiles";
import {DEFAULT_PROFILE_DATA, INITIAL_ELO_RATING} from "../constants";
import {getUTCTimeStamp} from "../../../lib/utils";

export default class ProfileUpdater {
	getEloRating(userId: string): number {
		return this.findOrCreate(userId).eloRating;
	}

	updateElo(userId: string, eloRating: number, eloRatingLastChange: number) {
		if (userId !== 'CPU') {
			const profile = this.findOrCreate(userId);

			Profiles.update(
				{_id: profile._id},
				{$set: {eloRating: eloRating, eloRatingLastChange: eloRatingLastChange}}
			);
		}
	}

	increateNumberOfWin(userId: string) {
		if (userId !== 'CPU') {
			const profile = this.findOrCreate(userId);

			const numberOfWin = profile.numberOfWin + 1;
			const soloNumberOfWin = profile.soloNumberOfWin + 1;
			Profiles.update(
				{_id: profile._id},
				{$set: {
					numberOfWin: numberOfWin,
					soloNumberOfWin: soloNumberOfWin,
				}}
			);
		}
	}

	increateNumberOfLost(userId: string) {
		if (userId !== 'CPU') {
			const profile = this.findOrCreate(userId);

			const numberOfLost = profile.numberOfLost + 1;
			const soloNumberOfLost = profile.soloNumberOfLost + 1;
			Profiles.update(
				{_id: profile._id},
				{$set: {
					numberOfLost: numberOfLost,
					soloNumberOfLost: soloNumberOfLost,
				}}
			);
		}
	}

	increateNumberOfShutouts(userId: string) {
		if (userId !== 'CPU') {
			const profile = this.findOrCreate(userId);

			const numberOfShutouts = profile.numberOfShutouts + 1;
			const soloNumberOfShutouts = profile.soloNumberOfShutouts + 1;
			Profiles.update(
				{_id: profile._id},
				{$set: {
					numberOfShutouts: numberOfShutouts,
					soloNumberOfShutouts: soloNumberOfShutouts,
				}}
			);
		}
	}

	increateNumberOfShutoutLosses(userId: string) {
		if (userId !== 'CPU') {
			const profile = this.findOrCreate(userId);

			const numberOfShutoutLosses = profile.numberOfShutoutLosses + 1;
			const soloNumberOfShutoutLosses = profile.soloNumberOfShutoutLosses + 1;
			Profiles.update(
				{_id: profile._id},
				{$set: {
					numberOfShutoutLosses: numberOfShutoutLosses,
					soloNumberOfShutoutLosses: soloNumberOfShutoutLosses,
				}}
			);
		}
	}

	protected findOrCreate(userId: string) {
		if (userId === 'CPU') {
			return this.defaultProfileData(userId);
		}

		let profile = this.findProfile(userId);

		if (!profile) {
			this.createInitialProfile(userId);
			profile = this.findProfile(userId);

			this.createInitialEloScore(userId);
		}

		return profile;
	}

	protected findProfile(userId: string) {
		return Profiles.findOne({userId: userId});
	}

	protected defaultProfileData(userId: string): Object {
		return Object.assign(
			{
				userId: userId
			},
			DEFAULT_PROFILE_DATA
		);
	}

	protected createInitialProfile(userId: string) {
		Profiles.insert(this.defaultProfileData(userId));
	}

	protected createInitialEloScore(userId: string) {
		EloScores.insert({
			timestamp: getUTCTimeStamp(),
			userId: userId,
			eloRating: INITIAL_ELO_RATING
		});
	}
}
