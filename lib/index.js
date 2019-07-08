const fs = require('fs');
const path = require('path');
const util = require('./util');
const basename = path.basename;
const server = require('./server');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');

exports = module.exports = (options = {}) => {
	const parsedOptions = Object.assign({}, {
		port: options.port || process.env.PORT || 3000
	}, options);
	const domains = process.env.DOMAINS ? JSON.parse(process.env.DOMAINS) : options.domains;

	server.init(options);
	server.onRequest = server.onRequest.bind(server);

	app.disable('x-powered-by');
	app.use(compression());

    if(domains) {
        for(let i in domains) {
			const domain = domains[i];
			app.get('/' + domain + '*', server.onRequest);
            app.post('/' + domain + '*', bodyParser.json({ type: () => true }), server.onRequest)
        }
    }

	app.listen(parsedOptions, () => util.log(`Prerender server accepting requests on port ${parsedOptions.port}`))

	return server;
};

fs.readdirSync(__dirname + '/plugins').forEach((filename) => {
	if (!/\.js$/.test(filename)) return;

	var name = basename(filename, '.js');

	function load() {
		return require('./plugins/' + name);
	};

	Object.defineProperty(exports, name, {
		value: load
	});
});