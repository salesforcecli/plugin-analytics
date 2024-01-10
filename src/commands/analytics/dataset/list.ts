/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import DatasetSvc from '../../../lib/analytics/dataset/dataset.js';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'dataset');

export default class List extends SfCommand<
  Array<{
    id?: string;
    name?: string;
    namespace?: string;
    label?: string;
    currentversionid?: string;
    folderid?: string;
  }>
> {
  public static readonly summary = messages.getMessage('listCommandDescription');
  public static readonly description = messages.getMessage('listCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:dataset:list'];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
  };

  protected static tableColumnData = ['id', 'namespace', 'name', 'label', 'currentversionid', 'folderid'];

  public async run() {
    const { flags } = await this.parse(List);
    const svc = new DatasetSvc(flags.targetOrg.getConnection());
    const datasets = ((await svc.list()) || []).map((dataset) => ({
      id: dataset.id,
      name: dataset.name,
      namespace: dataset.namespace,
      label: dataset.label,
      currentversionid: dataset.currentVersionId,
      folderid: dataset.folder?.id,
    }));
    this.styledHeader(messages.getMessage('datasetsFound', [datasets.length]));
    this.table(datasets, {
      id: { header: 'id' },
      name: { header: 'name' },
      namespace: { header: 'namespace' },
      label: { header: 'label' },
      currentversionid: { header: 'currentversionid' },
      folderid: { header: 'folderid' },
    });
    return datasets;
  }
}
