export default class CustomReactions {
	constructor(button5, button6, button7, button8, button9, button0) {
		this.reactions = [
			{
				index: 5,
				text: button5
			},
			{
				index: 6,
				text: button6
			},
			{
				index: 7,
				text: button7
			},
			{
				index: 8,
				text: button8
			},
			{
				index: 9,
				text: button9
			},
			{
				index: 0,
				text: button0
			}
		];
	}

	/**
	 * @param userReactions
	 * @returns {CustomReactions}
	 */
	static fromUserReactions(userReactions) {
		if (userReactions) {
			return new CustomReactions(
				userReactions.button5,
				userReactions.button6,
				userReactions.button7,
				userReactions.button8,
				userReactions.button9,
				userReactions.button0
			);
		}

		return CustomReactions.defaultReactions();
	}

	/**
	 * @returns {CustomReactions}
	 */
	static defaultReactions() {
		return new CustomReactions(
			'Good game!',
			'What a shot!',
			'Lucky you!',
			'Calculated.',
			'Boring!',
			'Oops!'
		);
	}
}
