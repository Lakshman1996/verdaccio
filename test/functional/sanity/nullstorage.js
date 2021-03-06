import assert from 'assert';
import crypto from 'crypto';
import {readFile} from '../lib/test.utils';

function getBinary() {
  return readFile('../fixtures/binary');
}

export default function (server, server2) {

  describe('should check whether test-nullstorage is on server1', () => {
    test('trying to fetch non-existent package / null storage', () => {
      return server.getPackage('test-nullstorage-nonexist')
               .status(404)
               .body_error(/no such package/);
    });
  });

  describe('should check whether test-nullstorage is on server2', () => {
    beforeAll(function() {
      return server2.addPackage('test-nullstorage2');
    });

    test('should creaate a new package on server2', () => {/* test for before() */});

    test('should fails on download a non existent tarball', () => {
      return server.getTarball('test-nullstorage2', 'blahblah')
               .status(404)
               .body_error(/no such file/);
    });

    describe('test and publish test-nullstorage2 package', () => {
      beforeAll(function() {
        return server2.putTarball('test-nullstorage2', 'blahblah', getBinary())
                 .status(201)
                 .body_ok(/.*/);
      });

      beforeAll(function() {
        let pkg = require('../fixtures/package')('test-nullstorage2');
        pkg.dist.shasum = crypto.createHash('sha1').update(getBinary()).digest('hex');
        return server2.putVersion('test-nullstorage2', '0.0.1', pkg)
                 .status(201)
                 .body_ok(/published/);
      });

      test('should upload a new version for test-nullstorage2', () => {/* test for before() */});

      test('should fetch the newly created published tarball for test-nullstorage2', () => {
        return server.getTarball('test-nullstorage2', 'blahblah')
                 .status(200)
                 .then(function(body) {
                   assert.deepEqual(body, getBinary());
                 });
      });

      test('should check whether the metadata for test-nullstorage2 match', () => {
        return server.getPackage('test-nullstorage2')
                 .status(200)
                 .then(function(body) {
                   assert.equal(body.name, 'test-nullstorage2');
                   assert.equal(body.versions['0.0.1'].name, 'test-nullstorage2');
                   assert.equal(body.versions['0.0.1'].dist.tarball, 'http://localhost:55551/test-nullstorage2/-/blahblah');
                   assert.deepEqual(body['dist-tags'], {latest: '0.0.1'});
                 });
      });
    });
  });
}
