/**
 * Copyright 2017, Google, Inc.
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

// sample-metadata:
//  title: Delete data
//  description: Deletes rows from an example Cloud Spanner table.
//  usage: deleteData <instanceName> <databaseName>

'use strict';

async function main(instanceId, databaseId) {
  // [START spanner_delete_data]
  // Imports the Google Cloud client library
  const {Spanner} = require('@google-cloud/spanner');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';

  // Creates a client
  const spanner = new Spanner();

  async function deleteData() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    // Instantiate Spanner table object
    const singersTable = database.table('Singers');

    // Deletes rows from the Singers table and the Albums table,
    // because Albums table is defined with ON DELETE CASCADE.
    try {
      const keys = [1, 2, 3, 4, 5];
      await singersTable.deleteRows(keys);
      console.log('Deleted data.');
    } finally {
      await database.close();
    }
  }
  deleteData();
  // [END spanner_delete_data]
}
main(...process.argv.slice(2));
