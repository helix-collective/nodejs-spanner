/**
 * Copyright 2019 Google LLC
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

async function deleteBackup(instanceId, databaseId, backupId, projectId) {
    // [START spanner_delete_backup]
    // Imports the Google Cloud client library
    const {Spanner} = require('@google-cloud/spanner');

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
      // Optional - allow Spanner API endpoint to be configured with environment variable
      apiEndpoint: process.env.API_ENDPOINT,
    });

    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);

    // Find backup to delete
    const [backups] = await instance.listBackups({filter:`name:${backupId}`});
    if (backups.length < 1) {
        console.error(`Backup ${backupId} not found.`);
        return;
    }
    const backup = backups[0];

    // Delete the backup
    console.log(`Deleting backup ${backupId}.`);
    await backup.deleteBackup();

    // Verify backup no longer exists
    const exists = await backup.exists();
    if (exists) {
        console.error('Error: backup still exists.');
    } else {
        console.log(`Backup deleted.`);
    }
    // [END spanner_delete_backup]
}

module.exports.deleteBackup = deleteBackup;
