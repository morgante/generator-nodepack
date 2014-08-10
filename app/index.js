'use strict';

var path = require('path');
var npmName = require('npm-name');
var yeoman = require('yeoman-generator');

var NodeGenerator = yeoman.generators.Base.extend({
	init: function () {
		this.pkg = require('../package.json');
		this.log(
			this.yeoman +
			'\nThe name of your project shouldn\'t contain "node" or "js" and' +
			'\nshould be a unique ID not already in use at search.npmjs.org.');
	},

	askFor: function () {
		var done = this.async();

		var prompts = [{
			name: 'name',
			message: 'Module Name',
			default: path.basename(process.cwd()),
		}, {
			type: 'confirm',
			name: 'pkgName',
			message: 'The name above already exists on npm, choose another?',
			default: true,
			when: function (answers) {
				var done = this.async();

				npmName(answers.name, function (err, available) {
					if (!available) {
						done(true);
					}

					done(false);
				});
			}
		}, {
			name: 'description',
			message: 'Description',
			default: 'The best module ever.'
		}, {
			name: 'homepage',
			message: 'Homepage'
		}, {
			name: 'license',
			message: 'License',
			default: 'MIT'
		}, {
			name: 'githubUsername',
			message: 'GitHub username'
		}, {
			name: 'authorName',
			message: 'Author\'s Name'
		}, {
			name: 'authorEmail',
			message: 'Author\'s Email'
		}, {
			name: 'authorUrl',
			message: 'Author\'s Homepage'
		}, {
			name: 'keywords',
			message: 'Key your keywords (comma to split)'
		}, {
			name: 'browser',
			message: 'Do you need browserify?',
			default: 'yes'
		}];

		this.currentYear = (new Date()).getFullYear();

		this.prompt(prompts, function (props) {

			this.slugname = this._.slugify(props.name);
			this.safeSlugname = this.slugname.replace(
				/-+([a-zA-Z0-9])/g,
				function (g) {
					return g[1].toUpperCase();
				}
			);

			if (props.githubUsername) {
				this.repoUrl = 'https://github.com/' + props.githubUsername + '/' + this.slugname;
			} else {
				this.repoUrl = 'user/repo';
			}

			if (!props.homepage) {
				props.homepage = this.repoUrl;
			}

			this.keywords = props.keywords.split(',');

			this.props = props;

			done();
		}.bind(this));
	},

	app: function () {
		this.config.save();
		this.copy('jshintrc', '.jshintrc');
		this.copy('gitignore', '.gitignore');
		this.copy('travis.yml', '.travis.yml');

		this.template('_README.md', 'README.md');
		this.template('_package.json', 'package.json');
	},

	projectfiles: function () {
		this.mkdir('lib');
		this.template('lib/name.js', 'lib/' + this.slugname + '.js');
		this.mkdir('test');
		this.template('test/name_test.js', 'test/' + this.slugname + '_test.js');
		this.mkdir('example');
		this.template('example/name_example.js', 'example/' + this.slugname + '_example.js');
	},

	install: function () {
		this.installDependencies({
			bower: false,
			skipInstall: this.options['skip-install']
		});
	}
});

module.exports = NodeGenerator;
