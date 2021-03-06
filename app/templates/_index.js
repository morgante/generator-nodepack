var express = require('express');
var _ = require('lodash');

var routes = require('./src/routes');

var app = express();

<% if (publicize) { %>
// serve static assets at server root, from /public
app.use(express.static(__dirname + '/public'));
<% } %>

_.each(routes, function(route) {
	route(app);
});

var port = process.env.PORT || <%= port %>;

app.listen(port);
console.log('server is listening on port %s', port);
