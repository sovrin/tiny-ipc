<h1 align="left">Tiny IPC - Inter Process Communicator</h1>

minimal library for communication between nodejs processes

***

## Installation

```bash
$ npm i @sovrin/tiny-ipc
```

## Examples
Server side:
```js
const ipc = require('@sovrin/tiny-ipc');

const {listen} = ipc({
    path: '/tmp/tinyipc.sock',
    //host: '127.0.0.1',
    //port: '1337',
});

// start listening to path or host and port configuration
// returns the instance of net.Server
listen((server) => console.info(server.address()))
    // fires, if a client has connected
    .on('connect', (client) => {
        // reply to this specific client
        client.emit('/baz', 'car');
    })
    
    // on custom client 'foo' event 
    .on('foo', (data, cid) => {
        console.info(`server got "${data}" from client: ${cid}`);
    })
    
    // on predefined 'error' event
    .on('error', (err) => {
        console.error(err);
    })

     // emit sends payload to all connected clients
     .emit('announcement', 'hello y\'all')
;
```

Client side:
```js
const ipc = require('@sovrin/tiny-ipc');

const {connect} = ipc({
    path: '/tmp/tinyipc.sock',
    //host: '127.0.0.1',
    //port: '1337',
});

// connects to path or host and port configuration
// returns the instance of net.Socket
connect((socket) => console.info(socket))
    .on('baz', (data) => {
        console.info(`client got "${data}" from server`);
    })
    
    // emit event 'foo' with 'clown' as payload to server 
    .emit('foo', 'clown')
    
    // some custom event
    .on('announcement', (data) => {
        console.info(`server has an announcement: ${data}`);
    })
    
    // on predefined 'error' event
    .on('error', (err) => {
        console.error(err);
    })
    
    // this closes the connection and, thus, finishes the execution
    // omit this, if client has to emit data on a later point of time
    .close()
;
```
