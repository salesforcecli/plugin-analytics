/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';
import DatasetSvc from '../../../lib/analytics/dataset/dataset';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataset');

export default class List extends SfdxCommand {
  public static description = messages.getMessage('listCommandDescription');
  public static longDescription = messages.getMessage('listCommandLongDescription');

  public static examples = ['$ sfdx analytics:dataset:list'];

  protected static flagsConfig = {};

  protected static requiresUsername = true;
  protected static requiresProject = false;

  protected static tableColumnData = ['id', 'namespace', 'name', 'label', 'currentversionid', 'folderid'];

  public async run() {
    const svc = new DatasetSvc((this.org as Org).getConnection());
    const datasets = ((await svc.list()) || []).map(dataset => ({
      id: dataset.id,
      name: dataset.name,
      namespace: dataset.namespace,
      label: dataset.label,
      currentversionid: dataset.currentVersionId,
      folderid: dataset.folder?.id
    }));
    if (datasets.length) {
      this.ux.styledHeader(messages.getMessage('datasetsFound', [datasets.length]));
    }
    return datasets;
  }
}
