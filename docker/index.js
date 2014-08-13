'use strict';

var exec = require('child_process').exec;

var BaseGenerator = require('../lib/generator');

var DockerGenerator = BaseGenerator.extend({
	init: function () {
	},

	askFor: function () {
		var done = this.async();
		var self = this;

		self.destDir = process.cwd();

		this._getDetails([
			'pkgName',
			'authorName',
			'authorEmail',
			'githubUsername'
		], function (err, props) {
			self.props = props;

			self.dockerTag = props.githubUsername + '/' + props.pkgName;

			self.prompt([
				{
					'name': 'gulp',
					'message': 'Use Gulp?',
					'type': 'confirm'
				}
			], function (answers) {
				self.gulp = answers.gulp;
				self.port = 3000;

				done();
			});
		}.bind(this));


	},

	dockerfile: function () {
		this.config.save();

		this.template('_Dockerfile', 'Dockerfile');
	},

	install: function () {
		var done = this.async();
		var self = this;

		var cmd = 'docker build -t ' + this.dockerTag + ' .';
		self.log('Building Docker container for you.');
		exec(cmd, function (err, stdout, stderr) {
			self.log(stderr);
			self.log(stdout);

			done();
		});
	},

	end: function() {
		var self = this;

		var cmd = 'docker run -i -p 49170:' + self.port + ' -v ' + self.destDir + ':/app/src -t ' + self.dockerTag;
		self.log('The app can be run in a Docker container with this command:\n' + cmd);
	}
});

module.exports = DockerGenerator;
