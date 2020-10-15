const {client: clientFactory, server: serverFactory, Event} = require('../dist');
const {equals} = require('./utils');
const assert = require('assert');

describe('tiny-ipc', () => {
    describe('communication', () => {
        let server;
        let client;
        let clients = [];

        beforeEach(done => {
            server = serverFactory(null, () => {
                client = clientFactory();
                client.on(Event.CONNECT, () => {
                    done();
                });
                client.connect();
            });

            server.on(Event.CONNECT, (client) => {
                clients.push(client);
            })

            server.listen();
        });

        afterEach((done) => {
            client.close();
            server.close();
            clients = [];

            done();
        });

        it('should send message to all clients', (done) => {
            const message = {
                id: 0,
                foo: 'bar',
            };

            client.on(Event.DATA, (data) => {
                assert(equals(message, data));

                return done();
            });

            setTimeout(() => {
                server.emit(message);
            }, 25);
        });

        it('should send message to server', (done) => {
            const message = {
                id: 0,
                foo: 'bar',
            };

            client.emit(message)

            server.on(Event.DATA, (data) => {
                assert(equals(message, data));

                return done();
            });

            setTimeout(() => {
                server.emit(message);
            }, 150);
        });

        it('should have several clients', (done) => {
            client.on(Event.CONNECT, () => {
                clientFactory(null, () => {
                    assert(clients.length === 2);
                    done();
                }).connect();
            });
        });


        it('should have several clients', (done) => {
            client.on(Event.CONNECT, () => {
                clientFactory(null, () => {
                    assert(clients.length === 2);
                    done();
                }).connect();
            });
        });

    });
});