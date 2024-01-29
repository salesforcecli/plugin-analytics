/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  SfCommand,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import DatasetSvc from '../../../lib/analytics/dataset/dataset.js';
import { generateTableColumns } from '../../../lib/analytics/utils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
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
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
  };

  public async run() {
    const { flags } = await this.parse(List);
    const svc = new DatasetSvc(flags['target-org'].getConnection(flags['api-version']));
    const datasets = ((await svc.list()) || []).map((dataset) => ({
      id: dataset.id,
      name: dataset.name,
      namespace: dataset.namespace,
      label: dataset.label,
      currentversionid: dataset.currentVersionId,
      folderid: dataset.folder?.id,
    }));
    if (datasets.length > 0) {
      this.styledHeader(messages.getMessage('datasetsFound', [datasets.length]));
      this.table(datasets, generateTableColumns(['id', 'name', 'namespace', 'label', 'currentversionid', 'folderid']));
    } else {
      this.log(messages.getMessage('noResultsFound'));
    }
    return datasets;
  }
}
