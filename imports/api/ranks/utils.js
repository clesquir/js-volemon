export const highlightSelectedEloModeItem = function(node) {
	const parent = node.parents('.display-elo-mode')[0];
	const displayEloModeItems = $(parent).find('span');

	displayEloModeItems.each(function(index, field) {
		$(field).removeClass('active');
	});

	node.addClass('active');
};

export const highlightSelectedChartPeriodItem = function(node) {
	const parent = node.parents('.display-chart-period')[0];
	const displayChartPeriodItems = $(parent).find('span');

	displayChartPeriodItems.each(function(index, field) {
		$(field).removeClass('active');
	});

	node.addClass('active');
};
