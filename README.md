# npn-proxy

A tls npn proxy layer on top of tcp.

The NPN tls extension can be used to hide services behind a single
port. During the handshake the protocol is negotiated and the connection
is redirected accordingly to the correct service.

## Server

    # Install node (tested with 0.6.x)
    $ apt-get install nodejs

    $ cp npn-server.config.js.sample npn-server.config.js
    $ cat npn-server.config.js
    var config = {};

    config.port = 8000;
    config.key  = '/etc/ssl/private/ssl-cert-snakeoil.key';
    config.cert = '/etc/ssl/certs/ssl-cert-snakeoil.pem';

    // Use this protocol if client doesn't support npn
    // Set this to null to drop the connection.
    config.default = 'http';
    var ssl_options = {
        rejectUnauthorized: false
    };
    config.protocols = {
        // Hidden protocols are not advertised during
        // handshake.
        ssh:  {host: '127.0.0.1', port: 22, hidden: true},
        http: {host: '127.0.0.1', port: 80, hidden: true},
        // You might want to speak ssl with the backend but hide
        // that from the client. Remember, the client already speaks
        // ssl with the node proxy.
        imap:  {host: '127.0.0.1', port: 993, hidden: true, wrap_ssl: ssl_options},
        // nc -l -p 3000
        echo: {host: '127.0.0.1', port: 3000, hidden: false}
    };

    module.exports = config;

    $ vim npn-server.config.js

    # start server
    $ sudo nodejs npn-proxy.js

## Client

    $ cp npn-client.config.js.sample npn-client.config.js
    $ cat npn-client.config.js
    var config = {};

    config.npn_port = 8000;
    config.npn_host = '127.0.0.1';

    module.exports = config;

    # start client
    $ nodejs npn-client.js ssh 127.0.0.1 2222

    $ ssh -p 2222 127.0.0.1

## Why?

Because you can wrap every ssl protocol without breaking anything (https,
imaps), just fallback to the standard service for this port.

## SSH

On the client side you can add something like the following snippet to your
~/.ssh/config, assuming with have a recent openssl version.

    host npnserver
        ProxyCommand openssl s_client -connect npnserver:443 -nextprotoneg ssh 2>/dev/null


