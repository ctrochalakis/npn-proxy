npn-proxy
=========

A tls npn proxy layer on top of tcp.

The NPN tls extension can be used to hide services behind a single
port. During the handshake the protocol is negotiated and the connection
is redirected accordingly to the correct service.

    # Install node (tested with 0.6.x)
    apt-get install nodejs

    cp npn-server.config.js.sample npn-server.config.js
    cp npn-client.config.js.sample npn-client.config.js

    vim npn-server.config.js

    # start server
    sudo nodejs npn-proxy.js

    # start client
    nodejs npn-client.js ssh 127.0.0.1 2222

    ssh -p 2222 127.0.0.1



