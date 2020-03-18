/**
 * Copyright 2020 Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

async function updateBackupExpireTime(
  instanceId,
  databaseId,
  backupId,
  projectId
) {
  // [START spanner_update_backup]
  // Imports the Google Cloud client library and precise date library
  const {Spanner} = require('@google-cloud/spanner');
  const {PreciseDate} = require('@google-cloud/precise-date');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'my-project-id';
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';
  // const backupId = 'my-backup';

  // Creates a client
  const spanner = new Spanner({
    projectId: projectId,
  });

  // Gets a reference to a Cloud Spanner instance and database
  const instance = spanner.instance(instanceId);
  const database = instance.database(databaseId);
  const databasePath = database.formattedName_;
  const backup = instance.backup(backupId, databasePath);

  // Read backup metadata and update expiry time
  try {
    const currentExpireTime = await backup.getExpireTime();
    const newExpireTime = new PreciseDate(currentExpireTime);
    newExpireTime.setDate(newExpireTime.getDate() + 30);
    console.log(
      `Backup ${backupId} current expire time: ${currentExpireTime.toISOString()}`
    );
    console.log(`Updating expire time to ${newExpireTime.toISOString()}`);
    await backup.updateExpireTime(newExpireTime);
    console.log('Expire time updated.');
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    // Close the database when finished.
    await database.close();
  }
  // [END spanner_update_backup]
}

module.exports.updateBackupExpireTime = updateBackupExpireTime;
