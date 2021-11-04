/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { join } from 'path';
import { SfdxCommand, flags } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';

import Domino from '../../../../lib/analytics/domino/domino';

Messages.importMessagesDirectory(join(__dirname, '..', '..', '..', '..'));

export default class List extends SfdxCommand {
  public static description = 'Domino Runtimes';
  public static longDescription = 'Chain runtimes';

  public static examples = ['$ sfdx analytics:domino:attachment:list -i <attachmentid>'];

  protected static flagsConfig = {
    attachmentid: flags.id({
      char: 'i',
      required: true,
      description: 'attachment id',
      longDescription: 'attachment id'
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  protected static tableColumnData = ['message', 'timestamp'];

  public async run() {
    const dominoSvc = new Domino(this.org as Org);

    const items = (await dominoSvc.attachmentsList(this.flags.attachmentid)) || [];
    return items;
  }
}
