/*!
 * Copyright 2019 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

import * as assert from 'assert';
import {EventEmitter} from 'events';
import * as extend from 'extend';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import {util} from '@google-cloud/common-grpc';
import * as pfy from '@google-cloud/promisify';
import {Instance} from '../src';
import { PreciseDate } from '@google-cloud/precise-date';
import * as bu from '../src/backup';
import { Backup, GetBackupInfoResponse } from '../src/backup';
import * as grpc from 'grpc';

let promisified = false;
const fakePfy = extend({}, pfy, {
  promisifyAll(klass, options) {
    if (klass.name !== 'Backup') {
      return;
    }
    promisified = true;
    assert.deepStrictEqual(options.exclude, [
      'getState',
      'getExpireTime',
      'exists'
    ]);
  },
});

class FakeGrpcServiceObject extends EventEmitter {
  calledWith_: IArguments;
  constructor() {
    super();
    this.calledWith_ = arguments;
  }
}

// tslint:disable-next-line no-any
const fakeCodec: any = {
  encode: util.noop,
  Int() {},
  Float() {},
  SpannerDate() {},
};

describe('Backup', () => {
  const sandbox = sinon.createSandbox();

  // tslint:disable-next-line variable-name
  let Backup: typeof bu.Backup;

  const INSTANCE = ({
    request: util.noop,
    requestStream: util.noop,
    formattedName_: 'instance-name',
    databases_: new Map(),
  } as {}) as Instance;

  const BACKUP_NAME = 'backup-name';
  const DATABASE_NAME = 'database-name';
  const DATABASE_FORMATTED_NAME =
    INSTANCE.formattedName_ + '/databases/' + DATABASE_NAME;
  const BACKUP_FORMATTED_NAME =
    INSTANCE.formattedName_ + '/backups/' + BACKUP_NAME;
  const BACKUP_EXPIRE_TIME = new PreciseDate(1977, 1, 9);

  let backup: bu.Backup;

  before(() => {
    Backup = proxyquire('../src/backup.js', {
      '@google-cloud/common-grpc': {
        ServiceObject: FakeGrpcServiceObject,
      },
      '@google-cloud/promisify': fakePfy,
    }).Backup;
  });

  beforeEach(() => {
    fakeCodec.encode = util.noop;
    backup = new Backup(INSTANCE, BACKUP_NAME, DATABASE_FORMATTED_NAME, BACKUP_EXPIRE_TIME);
  });

  afterEach(() => sandbox.restore());

  describe('instantiation', () => {
    it('should promisify all the things', () => {
      assert(promisified);
    });
  });

  describe('create', () => {
    const INSTANCE_NAME = 'instance-name';
    const BACKUP_NAME = 'backup-name';

    it('should make the correct request', async () => {
      const QUERY = {};
      const ORIGINAL_QUERY = extend({}, QUERY);
      const expectedReqOpts = extend({}, QUERY, {
        parent: INSTANCE_NAME,
        backupId: BACKUP_NAME,
        backup: {
          name: BACKUP_FORMATTED_NAME,
          database: DATABASE_FORMATTED_NAME,
          expireTime: BACKUP_EXPIRE_TIME.toStruct()
        }
      });

      backup.request = config => {
        assert.strictEqual(config.client, 'DatabaseAdminClient');
        assert.strictEqual(config.method, 'createBackup');
        assert.deepStrictEqual(config.reqOpts, expectedReqOpts);

        assert.notStrictEqual(config.reqOpts, QUERY);
        assert.deepStrictEqual(QUERY, ORIGINAL_QUERY);
      };

      await backup.create();
    });

    describe('error', () => {
      const REQUEST_RESPONSE_ARGS = [new Error('Error.'), null, {}];

      beforeEach(() => {
        backup.request = (config, callback: Function) => {
          callback.apply(null, REQUEST_RESPONSE_ARGS);
        };
      });

      it('should execute callback with original arguments', done => {
        backup.create((...args) => {
          assert.deepStrictEqual(args, REQUEST_RESPONSE_ARGS);
          done();
        });
      });
    });
  });

  describe('getBackupInfo', () => {
    const BACKUP_NAME = 'backup-name';

    it('should make the correct request', async () => {
      const QUERY = {};
      const ORIGINAL_QUERY = extend({}, QUERY);
      const expectedReqOpts = extend({}, QUERY, {
        name: BACKUP_FORMATTED_NAME,
      });

      backup.request = config => {
        assert.strictEqual(config.client, 'DatabaseAdminClient');
        assert.strictEqual(config.method, 'getBackup');
        assert.deepStrictEqual(config.reqOpts, expectedReqOpts);

        assert.notStrictEqual(config.reqOpts, QUERY);
        assert.deepStrictEqual(QUERY, ORIGINAL_QUERY);
      };

      await backup.getBackupInfo();
    });

    describe('error', () => {
      const REQUEST_RESPONSE_ARGS = [new Error('Error.'), null];

      beforeEach(() => {
        backup.request = (config, callback: Function) => {
          callback.apply(null, REQUEST_RESPONSE_ARGS);
        };
      });

      it('should execute callback with original arguments', done => {
        backup.getBackupInfo((...args) => {
          assert.deepStrictEqual(args, REQUEST_RESPONSE_ARGS);
          done();
        });
      });
    });

    describe('success', () => {
      const INFO = {
        name: 'backup-name',
        database: 'database-name',
        expireTime: BACKUP_EXPIRE_TIME
      };

      // tslint:disable-next-line no-any
      const REQUEST_RESPONSE_ARGS: any = [null, INFO, {}];

      beforeEach(() => {
        backup.request = (config, callback: Function) => {
          callback.apply(null, REQUEST_RESPONSE_ARGS);
        };
      });

      it('should get backup info', done => {
        const fakeInfo = {
          name: BACKUP_NAME,
          database: DATABASE_NAME,
          expireTime: BACKUP_EXPIRE_TIME
        };

        backup.getBackupInfo((...args) => {
          assert.ifError(args[0]);
          assert.strictEqual(args[0], REQUEST_RESPONSE_ARGS[0]);
          const backupInfo = args[1];
          assert.deepStrictEqual(backupInfo, fakeInfo);
          done();
        });
      });
    });
  });

  describe('getState', () => {
    it('should return the state from backup info', async () => {
      const BACKUP_INFO_RESPONSE: GetBackupInfoResponse = [
        {
          state: 'CREATING'
        }
      ];
      backup.getBackupInfo = async () => BACKUP_INFO_RESPONSE;

      const result = await backup.getState();
      assert.strictEqual(result, 'CREATING');
    });
  });

  describe('getExpireTime', () => {
    it('should return the expire time from backup info', async () => {
      const BACKUP_INFO_RESPONSE: GetBackupInfoResponse = [
        {
           expireTime: BACKUP_EXPIRE_TIME.toStruct()
        }
      ];
      backup.getBackupInfo = async () => BACKUP_INFO_RESPONSE;

      const result = await backup.getExpireTime();
      assert.deepStrictEqual(result, BACKUP_EXPIRE_TIME);
    });
  });

  describe('exists', () => {
    it('should return true when backup info indicates backup exists', async () => {
      const BACKUP_INFO_RESPONSE: GetBackupInfoResponse = [{}];
      backup.getBackupInfo = async () => BACKUP_INFO_RESPONSE;

      const result = await backup.exists();
      assert.strictEqual(result, true);
    });

    it('should return false when backup info indicates backup does not exist', async () => {
      backup.getBackupInfo = async () => { throw { code: grpc.status.NOT_FOUND }};

      const result = await backup.exists();
      assert.strictEqual(result, false);
    });

    it('should rethrow other errors', async () => {
      const err = { code: grpc.status.INTERNAL };
      backup.getBackupInfo = async () => { throw err };

      try {
        await backup.exists();
        assert.fail('Should have rethrown error');
      } catch (thrown) {
        assert.deepStrictEqual(thrown, err);
      }
    });
  });

  describe('updateExpireTime', () => {
    const NEW_EXPIRE_TIME = new PreciseDate(1977, 1, 10);

    it('should make the correct request', async () => {
      const QUERY = {};
      const ORIGINAL_QUERY = extend({}, QUERY);
      const expectedReqOpts = extend({}, QUERY, {
        backup: {
          name: BACKUP_FORMATTED_NAME,
          expireTime: NEW_EXPIRE_TIME.toStruct()
        },
        updateMask: {
          paths: ['expire_time']
        }
      });

      backup.request = config => {
        assert.strictEqual(config.client, 'DatabaseAdminClient');
        assert.strictEqual(config.method, 'updateBackup');
        assert.deepStrictEqual(config.reqOpts, expectedReqOpts);

        assert.notStrictEqual(config.reqOpts, QUERY);
        assert.deepStrictEqual(QUERY, ORIGINAL_QUERY);
      };

      await backup.updateExpireTime(NEW_EXPIRE_TIME);
    });

    describe('error', () => {
      const ERROR = new Error('Error.');
      const API_RESPONSE = {};

      beforeEach(() => {
        backup.request = (config, callback: Function) => {
          callback(ERROR, null, API_RESPONSE);
        };
      });

      it('should execute callback with error & API response', done => {
        backup.updateExpireTime(NEW_EXPIRE_TIME, (err, resp) => {
          assert.strictEqual(err, ERROR);
          assert.strictEqual(resp, undefined);
          done();
        });
      });
    });

    describe('success', () => {
      const API_RESPONSE = {};

      beforeEach(() => {
        backup.request = (config, callback: Function) => {
          callback(null, null, API_RESPONSE);
        };
      });

      it('should return same backup object on successful update', done => {
        backup.updateExpireTime(NEW_EXPIRE_TIME, (...args) => {
          assert.ifError(args[0]);
          assert.strictEqual(args[1], backup);
          done();
        });
      });
    });
  });

  describe('delete', () => {
    it('should make the correct request', async () => {
      const QUERY = {};
      const ORIGINAL_QUERY = extend({}, QUERY);
      const expectedReqOpts = extend({}, QUERY, {
        name: BACKUP_FORMATTED_NAME,
      });

      backup.request = config => {
        assert.strictEqual(config.client, 'DatabaseAdminClient');
        assert.strictEqual(config.method, 'deleteBackup');
        assert.deepStrictEqual(config.reqOpts, expectedReqOpts);

        assert.notStrictEqual(config.reqOpts, QUERY);
        assert.deepStrictEqual(QUERY, ORIGINAL_QUERY);
      };

      await backup.deleteBackup();
    });

    describe('error', () => {
      const REQUEST_RESPONSE_ARGS = [new Error('Error.'), null];

      beforeEach(() => {
        backup.request = (config, callback: Function) => {
          callback.apply(null, REQUEST_RESPONSE_ARGS);
        };
      });

      it('should execute callback with original arguments', done => {
        backup.deleteBackup((...args) => {
          assert.deepStrictEqual(args, REQUEST_RESPONSE_ARGS);
          done();
        });
      });
    });
  });
});