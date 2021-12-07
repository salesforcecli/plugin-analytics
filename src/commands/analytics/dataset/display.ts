/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';
import chalk from 'chalk';
import moment = require('moment');

import DatasetSvc from '../../../lib/analytics/dataset/dataset';

Messages.importMessagesDirectory(__dirname);
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

function blue(s: string): string {
  return process.platform !== 'win32' ? chalk.blue(s) : s;
}

export default class Display extends SfdxCommand {
  public static description = messages.getMessage('displayCommandDescription');
  public static longDescription = messages.getMessage('displayCommandLongDescription');

  public static examples = [
    '$ sfdx analytics:dataset:display -i datasetId',
    '$ sfdx analytics:dataset:display -n datasetApiName'
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
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    if (!this.flags.datasetid && !this.flags.datasetname) {
      throw new SfdxError(messages.getMessage('missingRequiredField'));
    }
    const svc = new DatasetSvc((this.org as Org).getConnection());
    const dataset = await svc.fetch((this.flags.datasetid || this.flags.datasetname) as string);

    // force:org:display does a blue chalk on the headers, so do it here, too
    this.ux.styledHeader(blue(messages.getMessage('displayDetailHeader')));
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
      { key: 'Last Queried Date', value: formatDate(dataset.lastQueriedDate) }
    ];
    if (dataset.datasetType?.toLocaleLowerCase() === 'live') {
      values.push(
        { key: 'Live Connection Name', value: dataset.liveConnection?.connectionName },
        { key: 'Live Connection Label', value: dataset.liveConnection?.connectionLabel },
        { key: 'Live Connection Type', value: dataset.liveConnection?.connectionType },
        { key: 'Live Connection Source Object', value: dataset.liveConnection?.sourceObjectName }
      );
    }
    this.ux.table(values, {
      columns: [
        { key: 'key', label: 'Key' },
        { key: 'value', label: 'Value' }
      ]
    });
    return dataset;
  }
}
