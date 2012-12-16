var tls = require('tls');
var net = require('net');
var config = require('./npn-client.config');

var args = process.argv.slice(2);
console.log(args);
var protocol = args[0];
var local_host = args[1];
var local_port = args[2];

var options= {
    NPNProtocols: [protocol],
    rejectUnauthorized: false
};

var local = net.createServer(function(c) {
    c.pause();

    console.log('client connection accepted from', c.remoteAddress);
    var stream = tls.connect(config.npn_port,
			     config.npn_host,
			     options, function (){
				 c.pipe(this);
				 c.resume();
				 this.pipe(c);
			     });

    stream.on('error', function(e) {
	console.log('npn-server connection:', e.code);
	c.end();
    });
});

local.listen(local_port, local_host, function (){
    console.log('npn-client listening on:', local_host, local_port);
});


