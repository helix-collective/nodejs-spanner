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

// [START spanner_list_backups]
async function listBackups(instanceId, projectId) {
  // Imports the Google Cloud client library
  const {Spanner} = require('@google-cloud/spanner');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'my-project-id';
  // const instanceId = 'my-instance';

  // Creates a client
  const spanner = new Spanner({
    projectId: projectId,
    // Optional - allow Spanner API endpoint to be configured with environment variable
    apiEndpoint: process.env.API_ENDPOINT,
  });

  // Gets a reference to a Cloud Spanner instance
  const instance = spanner.instance(instanceId);

  // List backups and print their names
  try {
    const [backups] = await instance.listBackups();
    console.log('Backups:');
    backups.forEach(backup => {
      console.log(backup.backupId);
    });
  } catch (err) {
    console.error('ERROR:', err);
  }
}

async function listBackupsByDatabase(instanceId, databaseId, projectId) {
  // Imports the Google Cloud client library
  const {Spanner} = require('@google-cloud/spanner');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
      // const projectId = 'my-project-id';
      // const databaseId = 'my-database';
      // const instanceId = 'my-instance';

      // Creates a client
  const spanner = new Spanner({
        projectId: projectId,
        // Optional - allow Spanner API endpoint to be configured with environment variable
        apiEndpoint: process.env.API_ENDPOINT,
      });

  // Gets a reference to a Cloud Spanner instance
  const instance = spanner.instance(instanceId);

  // List backups and print their names
  try {
    const [backups] = await instance.listBackups({filter: `Database:${databaseId}`});
    console.log('Backups:');
    backups.forEach(backup => {
      console.log(backup.backupId);
    });
  } catch (err) {
    console.error('ERROR:', err);
  }
}

async function listBackupsByName(instanceId, backupId, projectId) {
  // Imports the Google Cloud client library
  const {Spanner} = require('@google-cloud/spanner');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
      // const projectId = 'my-project-id';
      // const databaseId = 'my-database';
      // const instanceId = 'my-instance';

      // Creates a client
  const spanner = new Spanner({
        projectId: projectId,
        // Optional - allow Spanner API endpoint to be configured with environment variable
        apiEndpoint: process.env.API_ENDPOINT,
      });

  // Gets a reference to a Cloud Spanner instance
  const instance = spanner.instance(instanceId);

  // List backups and print their names
  try {
    const [backups] = await instance.listBackups({filter: `Name:${backupId}`});
    console.log('Backups:');
    backups.forEach(backup => {
      console.log(backup.backupId);
    });
  } catch (err) {
    console.error('ERROR:', err);
  }
}

async function listNewBackups(instanceId, projectId) {
  // Imports the Google Cloud client library
  const {Spanner} = require('@google-cloud/spanner');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
      // const projectId = 'my-project-id';
      // const instanceId = 'my-instance';

      // Creates a client
  const spanner = new Spanner({
        projectId: projectId,
        // Optional - allow Spanner API endpoint to be configured with environment variable
        apiEndpoint: process.env.API_ENDPOINT,
      });

  // Gets a reference to a Cloud Spanner instance
  const instance = spanner.instance(instanceId);

  // List backups and print their names
  try {
    const minCreateTime = new Date();
    const maxExpireTime = new Date(minCreateTime.getTime());
    minCreateTime.setDate(minCreateTime.getDate() - 1);
    maxExpireTime.setDate(maxExpireTime.getDate() + 3);

    const [backups] = await instance.listBackups({filter: `(state:READY) AND (create_time > "${minCreateTime.toISOString()}") AND (expire_time < "${maxExpireTime.toISOString()}")`});
    console.log('Backups:');
    backups.forEach(backup => {
      console.log(backup.backupId);
    });
  } catch (err) {
    console.error('ERROR:', err);
  }
}

async function listSmallBackups(instanceId, projectId) {
  // Imports the Google Cloud client library
  const {Spanner} = require('@google-cloud/spanner');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
      // const projectId = 'my-project-id';
      // const instanceId = 'my-instance';

      // Creates a client
  const spanner = new Spanner({
        projectId: projectId,
        // Optional - allow Spanner API endpoint to be configured with environment variable
        apiEndpoint: process.env.API_ENDPOINT,
      });

  // Gets a reference to a Cloud Spanner instance
  const instance = spanner.instance(instanceId);

  // List backups and print their names
  try {
    const [backups] = await instance.listBackups({filter: '(state:READY) AND (size_bytes < 65536)'});
    console.log('Backups:');
    backups.forEach(backup => {
      console.log(backup.backupId);
    });
  } catch (err) {
    console.error('ERROR:', err);
  }
}
// [END spanner_list_backups]

module.exports.listBackups = listBackups;
module.exports.listBackupsByDatabase = listBackupsByDatabase;
module.exports.listBackupsByName = listBackupsByName;
module.exports.listNewBackups = listNewBackups;
module.exports.listSmallBackups = listSmallBackups;
