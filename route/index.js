'use strict';

var yeoman = require('yeoman-generator');

var RouteGenerator = yeoman.generators.Base.extend({
	init: function () {
	},

	askFor: function () {
		var done = this.async();
		var self = this;

		this.prompt([
			{
				'name': 'name',
				'message': 'What is the name of this route?'
			},
			{
				'name': 'path',
				'message': 'Where should this route listen?',
				'default': '/'
			},
			{
				'name': 'verb',
				'message': 'What verb should this route use?',
				'type': 'list',
				'choices': ['GET', 'POST', 'PUT', 'DELETE'],
				'default': 'GET'
			}
		], function (answers) {
			self.name = self._.slugify(answers.name);

			self.verb = answers.verb.toLowerCase();
			self.path = answers.path;

			done();
		});
	},

	route: function () {
		this.config.save();

		this.template('_route.js', 'src/routes/' + this.name + '.js');
	},

	install: function () {
	}
});

module.exports = RouteGenerator;
