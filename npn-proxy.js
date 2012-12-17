var tls = require('tls');
var net = require('net');
var fs = require('fs');
var config = require('./npn-server.config');

var publicNpnProtocols = [];
Object.keys(config.protocols).forEach(function(key) {
    if(!config.protocols[key].hidden)
	publicNpnProtocols.push(key);
});
console.log('public protocols:', publicNpnProtocols);

var options = {
    key: fs.readFileSync(config.key),
    cert: fs.readFileSync(config.cert),
    NPNProtocols: publicNpnProtocols
};

var server = tls.createServer(options, function(stream) {
    stream.pause();
    console.log('npn-client connected', stream.npnProtocol,
		'from', stream.remoteAddress);

    var protocol = stream.npnProtocol || config.default;
    var dst = config.protocols[protocol];

    if(!dst){
	console.log(protocol, 'not supported closing connection');
	stream.end();
        return;
    }

    console.log('protocol:', dst.host, dst.port);

    function pipe() {
	stream.pipe(this);
	stream.resume();
	this.pipe(stream);
    };

    if(options = dst.wrap_ssl) {
	var client = tls.connect(dst.port, dst.host, options, pipe);
    } else {
	var client = net.connect(dst.port, dst.host, pipe);
    }

    client.on('error', function (e) {
	console.log('proxied connection:', e.code);
	stream.end();
    });

});

server.listen(config.port, function() {
  console.log('npn-server bound to:', config.port);
});

