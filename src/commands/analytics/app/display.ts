/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org } from '@salesforce/core';
import chalk from 'chalk';
import moment = require('moment');

import Folder, { AppStatus } from '../../../lib/analytics/app/folder';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'app');

function formatDate(s: string | undefined): string | undefined {
  try {
    if (s) {
      return moment(s).format(messages.getMessage('displayDateFormat'));
    }
  } catch (e) {
    // ignore invalid date from server
  }
  return undefined;
}

function blue(s: string): string {
  return process.platform !== 'win32' ? chalk.blue(s) : s;
}

function colorStatus(s: AppStatus | undefined): string | undefined {
  if (s && process.platform !== 'win32') {
    if (s === 'failedstatus' || s === 'cancelledstatus') {
      return chalk.red(s);
    } else if (s === 'completedstatus' || s === 'newstatus') {
      return chalk.green(s);
    }
  }
  return s;
}

export default class Display extends SfdxCommand {
  public static description = messages.getMessage('displayCommandDescription');
  public static longDescription = messages.getMessage('displayCommandLongDescription');

  public static examples = ['$ sfdx analytics:app:display -f folderId -a'];

  protected static flagsConfig = {
    folderid: flags.id({
      char: 'f',
      required: true,
      description: messages.getMessage('folderidFlagDescription'),
      longDescription: messages.getMessage('folderidFlagLongDescription')
    }),
    applog: flags.boolean({
      char: 'a',
      required: false,
      default: false,
      description: messages.getMessage('applogFlagDescription'),
      longDescription: messages.getMessage('applogFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const folder = new Folder(this.org as Org);
    const app = await folder.fetch(this.flags.folderid as string, !!this.flags.applog);

    // force:org:display does a blue chalk on the headers, so do it here, too
    this.ux.styledHeader(blue(messages.getMessage('displayDetailHeader')));
    this.ux.table(
      [
        { key: 'Name', value: app.name },
        { key: 'Label', value: app.label },
        { key: 'Status', value: colorStatus(app.applicationStatus) },
        { key: 'Id', value: app.id },
        { key: 'Created By', value: app.createdBy?.name },
        { key: 'Created Date', value: formatDate(app.createdDate) },
        { key: 'Last Modified By', value: app.lastModifiedBy?.name },
        { key: 'Last Modified Date', value: formatDate(app.lastModifiedDate) },
        { key: 'Template Source Id', value: app.templateSourceId },
        { key: 'Template Version', value: app.templateVersion },
        { key: 'Namespace', value: app.namespace }
      ],
      {
        columns: [
          { key: 'key', label: 'Key' },
          { key: 'value', label: 'Value' }
        ]
      }
    );

    if (this.flags.applog) {
      this.ux.styledHeader(blue(messages.getMessage('displayLogHeader')));
      if (!app.appLog || !Array.isArray(app.appLog) || app.appLog.length <= 0) {
        this.ux.log(messages.getMessage('displayNoLogAvailable'));
      } else {
        const data = app.appLog?.map(line => {
          return { message: line?.message || line || '' };
        });
        this.ux.table(data, {
          columns: [{ key: 'message', label: 'Message' }]
        });
      }
    }
    return app;
  }
}
