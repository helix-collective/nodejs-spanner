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
//  title: Query data
//  description: Executes a read-only SQL query against an example Cloud Spanner table.
//  usage: queryData <instanceName> <databaseName>

'use strict';

async function main(instanceId, databaseId) {
  // [START spanner_query_data]
  // Imports the Google Cloud client library
  const {Spanner} = require('@google-cloud/spanner');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';

  // Creates a client
  const spanner = new Spanner();

  async function queryData() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    const query = {
      sql: 'SELECT SingerId, AlbumId, AlbumTitle FROM Albums',
    };

    // Queries rows from the Albums table
    try {
      const [rows] = await database.run(query);
      rows.forEach(row => {
        const json = row.toJSON();
        console.log(
          `SingerId: ${json.SingerId}, AlbumId: ${json.AlbumId}, AlbumTitle: ${
            json.AlbumTitle
          }`
        );
      });
    } finally {
      // Close the database when finished.
      await database.close();
    }
  }
  queryData();
  // [END spanner_query_data]
}
main(...process.argv.slice(2));
