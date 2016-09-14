var assert = require('assert');
var superagent = require('superagent');
var status = require('http-status');
var bodyparser = require('body-parser');

var URL_ROOT = 'http://localhost:3001';

module.exports = function (Client) {

var Client = Client;

describe('Clients API', function () {

    beforeEach(function (done) {
        Client.remove({}, function (error) {
            assert.ifError(error);
            done();
        });
    });

    beforeEach(function (done) {
        var data = [
            {
            "_id" : '000000000000000000000001',
            "name" : "Gabriel",
            "address" : "Street 23",
            "city"  : "London"
            },
            {
            "_id" : '000000000000000000000002',
            "name" : "Gonçalves",
            "address" : "Street 32",
            "city"  : "Madrid"
            },
        ];

        Client.create(data, function (err) {
            assert.ifError(err);
            done();
        });
    });

    it('return all clients', function (done) {
        var url = URL_ROOT + '/client';

        superagent.get(url, function (error, res) {
            assert.ifError(error);
            assert.equal(res.status, status.OK);

            var results;
            assert.doesNotThrow(function (){
                results = JSON.parse(res.text).clients;
            });

            assert.equal(results.length, 2);
            done();
        });
    });

    it('return a client by name', function (done) {
        var url = URL_ROOT + '/client/name/Gabriel';
        superagent.get(url, function (error, res) {
            assert.ifError(error);
            assert.equal(res.status, status.OK);

            var results;
            assert.doesNotThrow(function (){
                results = JSON.parse(res.text).client;
            });

            assert.equal(results.length, 1);
            assert.equal(results[0].name, "gabriel");
            done();
        });
    });

     it('can create a Client', function (done) {
        var url = URL_ROOT + '/client/';
        superagent.post(url)
            .send({
                'name' : 'New Client',
                'address' : 'New Address to New Client',
                'city' : 'New City to New Client'
            })
            .end(function (error, res) {
                assert.ifError(error);
                assert.equal(res.status, status.OK);
                Client.find({}, function (error, clients) {
                    assert.ifError(error);
                    assert.equal(clients.length, 3);
                    done()
                });
            });
    });

     it('can\'t create a Client invalid', function (done) {
        var url = URL_ROOT + '/client/';

        superagent.post(url)
            .send({
                'name' : 'New Client',
                'address' : 'New Address to New Client',
            })
            .end(function (error, res) {
                assert.equal(res.status, status.INTERNAL_SERVER_ERROR);
                assert.equal(res.body.error, "ValidationError: Path `city` is required.");
                Client.find({}, function (error, clients) {
                    assert.ifError(error);
                    assert.equal(clients.length, 2);
                    done()
                });
            });
    });

     it('can update a Client', function (done) {
        var url = URL_ROOT + '/client/id/000000000000000000000001';

        superagent.put(url)
            .send({
                'name' : 'Update Client',
            })
            .end(function (error, res) {
                assert.ifError(error);
                assert.equal(res.status, status.OK);

                Client.find({'_id' : '000000000000000000000001'}, function (error, client) {
                    assert.ifError(error);
                    assert.equal(client.length, 1);
                    assert.equal(client[0].name, 'Update Client');
                    assert.equal(client[0].address, 'Street 23');
                    assert.equal(client[0].city, 'London');
                    done()
                });
            });
    });

    it('can delete a Client', function (done) {
        var url = URL_ROOT + '/client/id/000000000000000000000001';

        superagent.del(url)
            .end(function (error, res) {
                assert.ifError(error);
                assert.equal(res.status, status.OK);

                Client.find({'_id' : '000000000000000000000001'}, function (error, client) {
                    assert.ifError(error);
                    assert.equal(client.length, 0);
                    done()
                });
            });
    });


});

}