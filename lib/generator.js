'use strict';

var path = require('path');
var npmName = require('npm-name');
var yeoman = require('yeoman-generator');

var BaseGenerator = yeoman.generators.Base.extend({
	_getDetails: function (required, cb) {
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
	}
});

module.exports = BaseGenerator;
