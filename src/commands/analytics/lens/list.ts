/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';

import Lens from '../../../lib/analytics/lens/lens.js';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'lens');

export default class List extends SfCommand<
  Array<{ lensid?: string; name?: string; namespace?: string; label?: string }>
> {
  public static readonly summary = messages.getMessage('listCommandDescription');
  public static readonly description = messages.getMessage('listCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:lens:list'];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
  };

  public async run() {
    const { flags } = await this.parse(List);
    const lensSvc = new Lens(flags.targetOrg);
    const lenses = ((await lensSvc.list()) || []).map((lens) => ({
      lensid: lens.id,
      name: lens.name,
      namespace: lens.namespace,
      label: lens.label,
    }));
    this.styledHeader(messages.getMessage('lensesFound', [lenses.length]));
    this.table(lenses, {
      lensid: { header: 'lensid' },
      name: { header: 'name' },
      namespace: { header: 'namespace' },
      label: { header: 'label' },
    });
    return lenses;
  }
}
