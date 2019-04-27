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
//  title: Insert data
//  description: Inserts new rows of data into an example Cloud Spanner table.
//  usage: insertData <instanceName> <databaseName>

'use strict';

async function main(instanceId, databaseId) {
  // [START spanner_insert_data]
  // Imports the Google Cloud client library
  const {Spanner} = require('@google-cloud/spanner');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'my-project-id';
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';

  // Creates a client
  const spanner = new Spanner();

  async function insertData() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);

    // Instantiate Spanner table objects
    const singersTable = database.table('Singers');
    const albumsTable = database.table('Albums');

    // Inserts rows into the Singers table
    // Note: Cloud Spanner interprets Node.js numbers as FLOAT64s, so
    // they must be converted to strings before being inserted as INT64s
    try {
      await singersTable.insert([
        {SingerId: '1', FirstName: 'Marc', LastName: 'Richards'},
        {SingerId: '2', FirstName: 'Catalina', LastName: 'Smith'},
        {SingerId: '3', FirstName: 'Alice', LastName: 'Trentor'},
        {SingerId: '4', FirstName: 'Lea', LastName: 'Martin'},
        {SingerId: '5', FirstName: 'David', LastName: 'Lomond'},
      ]);

      await albumsTable.insert([
        {SingerId: '1', AlbumId: '1', AlbumTitle: 'Total Junk'},
        {SingerId: '1', AlbumId: '2', AlbumTitle: 'Go, Go, Go'},
        {SingerId: '2', AlbumId: '1', AlbumTitle: 'Green'},
        {SingerId: '2', AlbumId: '2', AlbumTitle: 'Forever Hold your Peace'},
        {SingerId: '2', AlbumId: '3', AlbumTitle: 'Terrified'},
      ]);

      console.log('Inserted data.');
    } finally {
      await database.close();
    }
  }
  insertData();
  // [END spanner_insert_data]
}
main(...process.argv.slice(2));
