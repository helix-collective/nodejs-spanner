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
//  title: Execute partition
//  description: Executes a partition.
//  usage: node executePartition <instanceName> <databaseName> <identifier> <partition> <projectId>

'use strict';

async function main(instanceId, databaseId, identifier, partition) {
  // [START spanner_batch_execute_partitions]
  // Imports the Google Cloud client library
  const {Spanner} = require('@google-cloud/spanner');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const instanceId = 'my-instance';
  // const databaseId = 'my-database';
  // const identifier = {};
  // const partition = {};

  // Creates a client
  const spanner = new Spanner();

  async function executePartition() {
    // Gets a reference to a Cloud Spanner instance and database
    const instance = spanner.instance(instanceId);
    const database = instance.database(databaseId);
    const transaction = database.batchTransaction(identifier);

    const [rows] = await transaction.execute(partition);
    console.log(
      `Successfully received ${rows.length} from executed partition.`
    );
  }
  executePartition();
  // [END spanner_batch_execute_partitions]
}

main(...process.argv.slice(2));
