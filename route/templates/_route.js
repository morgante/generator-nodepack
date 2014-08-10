'use strict';

module.exports = function (app) {
	app.<%= verb %>('<%= path %>', function (req, res) {
		res.send('new route');
	});
};
