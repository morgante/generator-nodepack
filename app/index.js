'use strict';

var path = require('path');
var npmName = require('npm-name');
var yeoman = require('yeoman-generator');

var BaseGenerator = require('../lib/generator');

var NodeGenerator = BaseGenerator.extend({
	init: function () {
		this.pkg = require('../package.json');
		this.log(
			this.yeoman +
			'\nThe name of your project shouldn\'t contain "node" or "js" and' +
			'\nshould be a unique ID not already in use at search.npmjs.org.');
	},

	_newPackage: function () {
		return !this.dest.exists('package.json');
	},


	askFor: function () {
		var done = this.async();
		var self = this;

		this.currentYear = (new Date()).getFullYear();

		this._getDetails([
			'pkgName',
			'description',
			'homepage',
			'license',
			'authorName',
			'authorEmail',
			'authorUrl',
			'keywords',
			'githubUsername'
		], function (err, props) {
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

			this.keywords = props.keywords;

			this.props = props;

			// ask for our specific options
			this.prompt([{
				name: 'port',
				message: 'Port to listen on',
				default: 3000
			}, {
				name: 'public',
				message: 'Serve static files in public?',
				type: 'confirm',
				default: true
			}], function (answers) {
				self.port = answers.port;
				self.publicize = answers.public;

				done();
			});
		}.bind(this));
	},

	app: function () {
		this.config.save();

		this.copy('jshintrc', '.jshintrc');
		this.copy('gitignore', '.gitignore');
		this.copy('travis.yml', '.travis.yml');

		this.template('_README.md', 'README.md');

		this._deps();
	},

	_deps: function () {
		var pkg;

		if (!this.dest.exists('package.json')) {
			pkg = {
				'name': this.slugname,
				'version': '0.0.0',
				'main': 'server.js',
				'description': this.props.description,
				'bugs': this.repoUrl + '/issues',
				'author': {
					'name': this.props.authorName,
					'email': this.props.authorEmail
				},
				'repository': {
					'type': 'git',
					'url': this.repoUrl
				},
				'license': this.props.license,
				'files': ['lib'],
				'keywords': this.keywords,
				'dependencies': {},
				'devDependencies': {},
				'scripts': {}
			};

			if (this.props.homepage) {
				pkg.homepage = this.props.homepage;
			}

			if (this.props.authorUrl) {
				pkg.author.url = this.props.authorUrl;
			}
		} else {
			pkg = this.dest.readJSON('package.json');
		}

		pkg.dependencies = pkg.dependencies || {};

		pkg.dependencies['express'] = '^4.8.2';
		pkg.dependencies['lodash'] = '^2.4.1';

		this.dest.write('package.json', JSON.stringify(pkg, null, '\t'));
	},

	projectfiles: function () {
		this.mkdir('lib');
		this.template('lib/name.js', 'lib/' + this.slugname + '.js');
		this.mkdir('test');
		this.template('test/name_test.js', 'test/' + this.slugname + '_test.js');
		this.mkdir('example');
		this.template('example/name_example.js', 'example/' + this.slugname + '_example.js');

		if (this.publicize) {
			this.mkdir('public');
			this.template('public/robots.txt', 'public/robots.txt');
		}

		this.template('_index.js', 'index.js');

		this.mkdir('src/routes');
		this.copy('src/routes/index.js', 'src/routes/index.js');
	},

	install: function () {
		this.installDependencies({
			bower: false,
			skipInstall: this.options['skip-install']
		});
	}
});

module.exports = NodeGenerator;
