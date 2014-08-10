var fs = require('fs');

var routes = {};

require('fs').readdirSync(__dirname + '/').forEach(function (file) {
	if (file.match(/.+\.js/g) !== null && file !== 'index.js') {
		var name = file.replace('.js', '');
		routes[name] = require('./' + file);
	}
});

module.exports = routes;
