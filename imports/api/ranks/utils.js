export const highlightSelectedChartPeriodItem = function(e) {
	const parent = $(e.target).parents('.display-chart-period')[0];
	const displayChartPeriodItems = $(parent).find('span');

	displayChartPeriodItems.each(function(index, field) {
		$(field).removeClass('active');
	});

	$(e.target).addClass('active');
};
