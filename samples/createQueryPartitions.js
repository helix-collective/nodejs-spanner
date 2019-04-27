/**
 * Copyright 2018, Google, Inc.
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
//  title: Create query partitions
//  usage: node createQueryPartitions <instanceName> <databaseName> <identifier> <projectId>

'use strict';

async function main(instanceId, databaseId, identifier) {
  // [START spanner_batch_client]
  // Imports the Google Cloud client library
  const {Spanner} = require('@google-cloud/spanner');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';
  // const identifier = {};

  // Creates a client
  const spanner = new Spanner();

  async function createQueryPartitions() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);
    const transaction = database.batchTransaction(identifier);

    const query = 'SELECT * FROM Singers';

    const [partitions] = await transaction.createQueryPartitions(query);
    console.log(`Successfully created ${partitions.length} query partitions.`);
  }
  createQueryPartitions();
  // [END spanner_batch_client]
}

main(...process.argv.slice(2));
