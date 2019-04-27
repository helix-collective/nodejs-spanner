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
//  title: Udpate data
//  description: Modifies existing rows of data in an example Cloud Spanner table.
//  usage: updateData <instanceName> <databaseName>

'use strict';

async function main(instanceId, databaseId) {
  // [START spanner_update_data]
  // Imports the Google Cloud client library
  const {Spanner} = require('@google-cloud/spanner');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';

  // Creates a client
  const spanner = new Spanner();

  async function updateData() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    // Update a row in the Albums table
    // Note: Cloud Spanner interprets Node.js numbers as FLOAT64s, so they
    // must be converted to strings before being inserted as INT64s
    const albumsTable = database.table('Albums');

    try {
      await albumsTable.update([
        {SingerId: '1', AlbumId: '1', MarketingBudget: '100000'},
        {SingerId: '2', AlbumId: '2', MarketingBudget: '500000'},
      ]);
      console.log('Updated data.');
    } finally {
      // Close the database when finished.
      database.close();
    }
  }
  updateData();
  // [END spanner_update_data]
}
main(...process.argv.slice(2));
