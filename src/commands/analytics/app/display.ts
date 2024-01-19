/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  Flags,
  SfCommand,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import chalk from 'chalk';
import moment from 'moment';

import Folder, { type AppFolder, AppStatus } from '../../../lib/analytics/app/folder.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
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

export default class Display extends SfCommand<AppFolder> {
  public static readonly summary = messages.getMessage('displayCommandDescription');
  public static readonly description = messages.getMessage('displayCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:app:display -f folderId -a'];

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    folderid: Flags.salesforceId({
      char: 'f',
      required: true,
      summary: messages.getMessage('folderidFlagDescription'),
      description: messages.getMessage('folderidFlagLongDescription'),
    }),
    applog: Flags.boolean({
      char: 'a',
      required: false,
      default: false,
      summary: messages.getMessage('applogFlagDescription'),
      description: messages.getMessage('applogFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Display);
    const folder = new Folder(flags['target-org'].getConnection(flags['api-version']));
    const app = await folder.fetch(flags.folderid, flags.applog);

    // force:org:display does a blue chalk on the headers, so do it here, too
    this.styledHeader(blue(messages.getMessage('displayDetailHeader')));
    this.table(
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
        { key: 'Namespace', value: app.namespace },
      ],
      {
        key: { header: 'Key' },
        value: { header: 'Value' },
      }
    );

    if (flags.applog) {
      this.styledHeader(blue(messages.getMessage('displayLogHeader')));
      if (!app.appLog || !Array.isArray(app.appLog) || app.appLog.length <= 0) {
        this.log(messages.getMessage('displayNoLogAvailable'));
      } else {
        const data = app.appLog?.map((line) => ({ message: (line?.message ?? line) || '' }));
        this.table(data, {
          message: { header: 'Message' },
        });
      }
    }
    return app;
  }
}
