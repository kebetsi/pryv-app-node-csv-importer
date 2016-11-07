/*global describe, it, before, after*/

var pryv = require('pryv'),
  async = require('async'),
  pryvCsvParser = require('../../src/main');

var testUser = require('../data/testUser.json');

describe('CSV importer', function () {

  var connection,
    supportStream = {id: 'supportStream', name: 'csvData'},
    xStream = {id: 'xStream', name: 'xStream', parentId: supportStream.id},
    yStream = {id: 'yStream', name: 'yStream', parentId: supportStream.id},
    zStream = {id: 'zStream', name: 'zStream', parentId: supportStream.id};

  before(function (done) {
    connection = new pryv.Connection(testUser);
    connection.batchCall([
      {
        method: 'streams.create',
        params: supportStream
      },
      {
        method: 'streams.create',
        params: xStream
      },
      {
        method: 'streams.create',
        params: yStream
      },
      {
        method: 'streams.create',
        params: zStream
      }
    ], function (err, results) {
      if (err) {
        return done(err);
      }
      console.log(results)
      done();
    });
  });


  after(function (done) {
    connection.batchCall([
      {
        method: 'streams.delete',
        params: {
          id: supportStream.id,
          mergeEventsWithParent: false
        }
      },
      {
        method: 'streams.delete',
        params: {
          id: supportStream.id,
          mergeEventsWithParent: false
        }
      }
    ], function (err, results) {
      if (err) {
        return done(err);
      }
      console.log(results);
      done();
    })
  });

  it('should import a valid CSV file according to the input parameters', function (done) {

    var batch = [];

    parser = pryvCsvParser.read({
      file: __dirname + '/../data/accData.csv',
      delimiter: null,
      numItems: 4,
      onLine: function (line) {
        sLine = line.split(',');
        if (sLine.length !== 4) {
          console.error('parsed line has wrong number of items');
          params.onClose();
        }
        var timestamp = sLine[0] / 1000;
        batch.push(
          {
            method: 'events.create',
            params: {
              time: timestamp,
              type: 'acceleration/m-s2',
              streamId: xStream.id,
              content: sLine[1]
            }
          },
          {
            method: 'events.create',
            params: {
              time: timestamp,
              type: 'acceleration/m-s2',
              streamId: yStream.id,
              content: sLine[2]
            }
          },
          {
            method: 'events.create',
            params: {
              time: timestamp,
              type: 'acceleration/m-s2',
              streamId: zStream.id,
              content: sLine[3]
            }
          });
      },
      onClose: function () {
        connection.batchCall(batch, function (err, results) {
          if (err) {
            return done(err);
          }
          console.log('created ', results.length, 'data points');
          done();
        });
      },
      onError: null
    });
  })

});