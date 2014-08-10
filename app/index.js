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

	_newPackage: function () {
		return !this.dest.exists('package.json');
	},

	_getDetails: function (cb) {
		if (this.dest.exists('package.json')) {
			// do something
			console.log('read from package.json');
			var pkg = this.dest.readJSON('package.json');

			var props = {
				'pkgName': pkg.name,
				'description': pkg.description,
				'homepage': pkg.homepage,
				'license': pkg.license,
				'authorName': pkg.author.name,
				'authorEmail': pkg.author.email,
				'authorUrl': pkg.author.url,
				'keywords': pkg.keywords
			};

			// parse author github from URL
			var repo = pkg.repository.url.match(/https:\/\/github.com\/(\w+)\/(\w+)/);
			props.githubUsername = repo[1];

			cb(null, props);
		} else {
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
			}];

			this.prompt(prompts, function (props) {
				props.keywords = props.keywords.split(',');

				cb(null, props);
			});
		}
	},

	askFor: function () {
		var done = this.async();

		this.currentYear = (new Date()).getFullYear();

		this._getDetails(function (err, props) {
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

			done();
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
				'name': this.slugName,
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

		this.dest.write('package.json', JSON.stringify(pkg, null, '\t'));
	},

	projectfiles: function () {
		this.mkdir('lib');
		this.template('lib/name.js', 'lib/' + this.slugname + '.js');
		this.mkdir('test');
		this.template('test/name_test.js', 'test/' + this.slugname + '_test.js');
		this.mkdir('example');
		this.template('example/name_example.js', 'example/' + this.slugname + '_example.js');

		this.template('_index.js', 'index.js');
	},

	install: function () {
		this.installDependencies({
			bower: false,
			skipInstall: this.options['skip-install']
		});
	}
});

module.exports = NodeGenerator;
