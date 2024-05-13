/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  Flags,
  SfCommand,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
} from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import moment from 'moment';

import DatasetSvc, { type DatasetType } from '../../../lib/analytics/dataset/dataset.js';
import { generateTableColumns, headerColor } from '../../../lib/analytics/utils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataset');

function formatDate(s: string | undefined): string | undefined {
  try {
    if (s) {
      return moment(s).format(messages.getMessage('displayDateFormat'));
    }
  } catch (e) {
    // ignore invalid date
  }
  return undefined;
}

export default class Display extends SfCommand<DatasetType> {
  public static readonly summary = messages.getMessage('displayCommandDescription');
  public static readonly description = messages.getMessage('displayCommandLongDescription');

  public static readonly examples = [
    '$ sfdx analytics:dataset:display -i datasetId',
    '$ sfdx analytics:dataset:display -n datasetApiName',
  ];

  public static readonly flags = {
    loglevel,
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
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
  };

  public async run() {
    const { flags } = await this.parse(Display);
    if (!flags.datasetid && !flags.datasetname) {
      throw new SfError(messages.getMessage('missingRequiredField'));
    }
    const svc = new DatasetSvc(flags['target-org'].getConnection(flags['api-version']));
    const dataset = await svc.fetch((flags.datasetid ?? flags.datasetname) as string);

    // force:org:display does a blue chalk on the headers, so do it here, too
    this.styledHeader(headerColor(messages.getMessage('displayDetailHeader')));
    const values = [
      { key: 'Id', value: dataset.id },
      { key: 'Namespace', value: dataset.namespace },
      { key: 'Name', value: dataset.name },
      { key: 'Label', value: dataset.label },
      { key: 'Type', value: dataset.datasetType },
      { key: 'Current Version Id', value: dataset.currentVersionId },
      { key: 'Folder Id', value: dataset.folder?.id },
      { key: 'Folder Label', value: dataset.folder?.label },
      { key: 'Created By', value: dataset.createdBy?.name },
      { key: 'Created Date', value: formatDate(dataset.createdDate) },
      { key: 'Last Modified By', value: dataset.lastModifiedBy?.name },
      { key: 'Last Modified Date', value: formatDate(dataset.lastModifiedDate) },
      { key: 'Data Refresh Date', value: formatDate(dataset.dataRefreshDate) },
      { key: 'Last Accessed Date', value: formatDate(dataset.lastAccessedDate) },
      { key: 'Last Queried Date', value: formatDate(dataset.lastQueriedDate) },
    ];
    if (dataset.datasetType?.toLocaleLowerCase() === 'live') {
      values.push(
        { key: 'Live Connection Name', value: dataset.liveConnection?.connectionName },
        { key: 'Live Connection Label', value: dataset.liveConnection?.connectionLabel },
        { key: 'Live Connection Type', value: dataset.liveConnection?.connectionType },
        { key: 'Live Connection Source Object', value: dataset.liveConnection?.sourceObjectName }
      );
    }
    this.table(values, generateTableColumns(['key', 'value']));
    return dataset;
  }
}
