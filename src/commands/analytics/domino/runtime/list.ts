/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { join } from 'path';
import { SfdxCommand, flags } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';
import chalk from 'chalk';

import Domino from '../../../../lib/analytics/domino/domino';

Messages.importMessagesDirectory(join(__dirname, '..', '..', '..', '..'));
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

function colorStatus(status: string) {
  if (status && process.platform !== 'win32') {
    if (status === 'FailedStatus' || status === 'cancelledstatus') {
      return chalk.red(status);
    } else if (status === 'SuccessStatus' || status === 'NewStatus') {
      return chalk.green(status);
    }
  }
  return status;
}

export default class List extends SfdxCommand {
  public static description = 'Domino Runtimes';
  public static longDescription = 'Chain runtimes';

  public static examples = ['$ sfdx analytics:domino:runtime:list -n <chainid>'];

  protected static flagsConfig = {
    chainid: flags.id({
      char: 'i',
      required: true,
      description: 'chain id',
      longDescription: 'chain id'
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  protected static tableColumnData = ['runtimeid', 'status', 'logid', 'stateid'];

  public async run() {
    const dominoSvc = new Domino(this.org as Org);
    const items = ((await dominoSvc.runtimeList(this.flags.chainid)) || [])
      .filter(() => true)
      .map(item => ({
        runtimeid: item.id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        status: colorStatus(item.requestStatus),
        logid: item.logId,
        stateid: item.stateId
      }));
    if (items.length > 0) {
      this.ux.styledHeader(messages.getMessage('appsFound', [items.length]));
    }
    return items;
  }
}
