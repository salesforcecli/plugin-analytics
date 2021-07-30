/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';
import DatasetSvc from '../../../../lib/analytics/dataset/dataset';
import QuerySvc, { DRYRUN_FLAG, LIMIT_FLAG, RESULT_FORMAT_FLAG } from '../../../../lib/analytics/query/query';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataset');

export default class Fetch extends SfdxCommand {
  public static description = messages.getMessage('rowsfetchCommandDescription');
  public static longDescription = messages.getMessage('rowsfetchCommandLongDescription');

  public static examples = [
    '$ sfdx analytics:dataset:rows:fetch -i datasetId',
    '$ sfdx analytics:dataset:rows:fetch -n datasetApiName -r csv'
  ];

  protected static flagsConfig = {
    datasetid: flags.id({
      char: 'i',
      description: messages.getMessage('datasetidFlagDescription'),
      longDescription: messages.getMessage('datasetidFlagLongDescription'),
      exclusive: ['datasetname']
    }),
    datasetname: flags.string({
      char: 'n',
      description: messages.getMessage('datasetnameFlagDescription'),
      longDescription: messages.getMessage('datasetnameFlagLongDescription'),
      exclusive: ['datasetid']
    }),
    limit: LIMIT_FLAG,
    resultformat: RESULT_FORMAT_FLAG,
    dryrun: DRYRUN_FLAG
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    if (!this.flags.datasetid && !this.flags.datasetname) {
      throw new SfdxError(messages.getMessage('missingRequiredField'));
    }
    const connection = (this.org as Org).getConnection();
    const svc = new DatasetSvc(connection);
    const dataset = await svc.fetch(this.flags.datasetid || this.flags.datasetname);

    const options = {
      ux: !this.flags.json ? this.ux : undefined,
      limit: this.flags.limit as number | undefined,
      resultformat: this.flags.resultformat as string | undefined,
      dryrun: !!this.flags.dryrun
    };

    // Live datasets
    if (dataset.datasetType?.toLocaleLowerCase() === 'live') {
      if (!(typeof this.flags.limit === 'number') || this.flags.limit < 0) {
        throw new SfdxError('--limit is required for fetching Live dataset rows');
      }
      // the current max limit is 5000, but let the server report if the user goes over that (in case it changes in
      // a future version)

      if (!dataset.liveConnection?.connectionName || !dataset.liveConnection.sourceObjectName) {
        throw new SfdxError(`Dataset ${dataset.name} (${dataset.id}) does not have liveConnection information`);
      }
      const fieldNames = await svc.fetchLiveDatasetFieldNames(
        dataset.liveConnection.connectionName,
        dataset.liveConnection.sourceObjectName
      );
      if (fieldNames.length <= 0) {
        throw new SfdxError(
          `Source object ${dataset.liveConnection.sourceObjectName} in ${dataset.liveConnection.connectionName} does not exist or user is not authorized`
        );
      }
      const query =
        'SELECT ' +
        fieldNames.map(n => `"${n}" AS "${n}"`).join(',') +
        ` FROM "${dataset.name}" LIMIT ${this.flags.limit}`;
      this.debug('POSTing query: ' + query);
      return new QuerySvc(connection).runExternalQueryCommand(
        { query, connectorIdOrApiName: dataset.liveConnection.connectionName },
        options
      );
    } else {
      // regular datasets
      if (!dataset.id || !dataset.currentVersionId) {
        throw new SfdxError(`Dataset ${dataset.name} (${dataset.id}) does not have a current version`);
      }
      const fieldNames = (await svc.fetchFieldNames(dataset.id, dataset.currentVersionId)).sort();
      const query =
        `q = load "${dataset.id}/${dataset.currentVersionId}";` +
        ' q = foreach q generate ' +
        fieldNames.map(n => `'${n}' as '${n}'`).join(',') +
        ';' +
        // add a server-side limit if they specified one (note: 'q = limit q 0' is a no-op in saql where it returns all
        // rows, so use 1 if they specify 0, then rely on runQueryCommand() to trim that 1 row out)
        (typeof this.flags.limit === 'number' && this.flags.limit >= 0
          ? ` q = limit q ${Math.max(1, this.flags.limit)};`
          : '');
      // TODO: do batch fetching with 'q = offset q <num>; q = limit q <batchsize>'

      this.debug('POSTing query: ' + query);
      return new QuerySvc(connection).runQueryCommand({ query }, options);
    }
  }
}
