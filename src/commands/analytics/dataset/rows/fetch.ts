/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import DatasetSvc from '../../../../lib/analytics/dataset/dataset.js';
import QuerySvc, {
  DRYRUN_FLAG,
  LIMIT_FLAG,
  type QueryResponse,
  RESULT_FORMAT_FLAG,
} from '../../../../lib/analytics/query/query.js';
import { CommandUx, commandUx } from '../../../../lib/analytics/utils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataset');

export default class Fetch extends SfCommand<QueryResponse | undefined> {
  public static readonly summary = messages.getMessage('rowsfetchCommandDescription');
  public static readonly description = messages.getMessage('rowsfetchCommandLongDescription');

  public static readonly examples = [
    '$ sfdx analytics:dataset:rows:fetch -i datasetId',
    '$ sfdx analytics:dataset:rows:fetch -n datasetApiName -r csv',
  ];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
    datasetid: Flags.salesforceId({
      char: 'i',
      summary: messages.getMessage('datasetidFlagDescription'),
      description: messages.getMessage('datasetidFlagLongDescription'),
      exclusive: ['datasetname'],
    }),
    datasetname: Flags.string({
      char: 'n',
      summary: messages.getMessage('datasetnameFlagDescription'),
      description: messages.getMessage('datasetnameFlagLongDescription'),
      exclusive: ['datasetid'],
    }),
    limit: LIMIT_FLAG,
    resultformat: RESULT_FORMAT_FLAG,
    dryrun: DRYRUN_FLAG,
  };

  public async run() {
    const { flags } = await this.parse(Fetch);
    if (!flags.datasetid && !flags.datasetname) {
      throw new SfError(messages.getMessage('missingRequiredField'));
    }
    const connection = flags.targetOrg.getConnection();
    const svc = new DatasetSvc(connection);
    const dataset = await svc.fetch((flags.datasetid ?? flags.datasetname) as string);

    const ux: CommandUx = commandUx(this);
    const options = {
      ux,
      limit: flags.limit,
      resultformat: flags.resultformat,
      dryrun: flags.dryrun,
    };

    // Live datasets
    if (dataset.datasetType?.toLocaleLowerCase() === 'live') {
      if (!(typeof flags.limit === 'number') || flags.limit < 0) {
        throw new SfError('--limit is required for fetching Live dataset rows');
      }
      // the current max limit is 5000, but let the server report if the user goes over that (in case it changes in
      // a future version)

      if (!dataset.liveConnection?.connectionName || !dataset.liveConnection.sourceObjectName) {
        throw new SfError(`Dataset ${dataset.name} (${dataset.id}) does not have liveConnection information`);
      }
      const fieldNames = await svc.fetchLiveDatasetFieldNames(
        dataset.liveConnection.connectionName,
        dataset.liveConnection.sourceObjectName
      );
      if (fieldNames.length <= 0) {
        throw new SfError(
          `Source object ${dataset.liveConnection.sourceObjectName} in ${dataset.liveConnection.connectionName} does not exist or user is not authorized`
        );
      }
      const query =
        'SELECT ' +
        fieldNames.map((n) => `"${n}" AS "${n}"`).join(',') +
        ` FROM "${dataset.name}" LIMIT ${flags.limit}`;
      this.debug('POSTing query: ' + query);
      return new QuerySvc(connection).runExternalQueryCommand(
        { query, connectorIdOrApiName: dataset.liveConnection.connectionName },
        options
      );
    } else {
      // regular datasets
      if (!dataset.id || !dataset.currentVersionId) {
        throw new SfError(`Dataset ${dataset.name} (${dataset.id}) does not have a current version`);
      }
      const fieldNames = (await svc.fetchFieldNames(dataset.id, dataset.currentVersionId)).sort();
      const query =
        `q = load "${dataset.id}/${dataset.currentVersionId}";` +
        ' q = foreach q generate ' +
        fieldNames.map((n) => `'${n}' as '${n}'`).join(',') +
        ';' +
        // add a server-side limit if they specified one (note: 'q = limit q 0' is a no-op in saql where it returns all
        // rows, so use 1 if they specify 0, then rely on runQueryCommand() to trim that 1 row out)
        (typeof flags.limit === 'number' && flags.limit >= 0 ? ` q = limit q ${Math.max(1, flags.limit)};` : '');
      // TODO: do batch fetching with 'q = offset q <num>; q = limit q <batchsize>'

      this.debug('POSTing query: ' + query);
      return new QuerySvc(connection).runQueryCommand({ query }, options);
    }
  }
}
