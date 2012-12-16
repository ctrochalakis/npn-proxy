var tls = require('tls');
var net = require('net');
var fs = require('fs');
var config = require('./npn-server.config');

var npnProtocols = [];
Object.keys(config.protocols).forEach(function(key) {
    npnProtocols.push(key);
});
console.log(npnProtocols);

var options = {
    key: fs.readFileSync(config.key),
    cert: fs.readFileSync(config.cert),
    NPNProtocols: npnProtocols
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

    var client = net.connect(dst.port, dst.host, function() {
	stream.pipe(this);
	stream.resume();
	this.pipe(stream);
    });

    client.on('error', function (e) {
	console.log('proxied connection:', e.code);
	stream.end();
    });

});

server.listen(config.port, function() {
  console.log('npn-server bound to:', config.port);
});

