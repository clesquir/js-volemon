export default class CustomReactions {

	constructor(button5, button6, button7, button8, button9, button0) {
		this.reactionsList = [
			{
				index: 5,
				label: '5',
				text: button5 || 'Good game!'
			},
			{
				index: 6,
				label: '6',
				text: button6 || 'What a shot!'
			},
			{
				index: 7,
				label: '7',
				text: button7 || 'Lucky you!'
			},
			{
				index: 8,
				label: '8',
				text: button8 || 'Calculated.'
			},
			{
				index: 9,
				label: '9',
				text: button9 ||'Boring!'
			},
			{
				index: 0,
				label: '0',
				text: button0 || 'Oops!'
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
