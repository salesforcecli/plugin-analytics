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

import AutoInstall, { AutoInstallRequestType, AutoInstallStatus } from '../../../lib/analytics/autoinstall/autoinstall';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'autoinstall');

function blue(s: string): string {
  return process.platform !== 'win32' ? chalk.blue(s) : s;
}

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

function colorStatus(s: AutoInstallStatus | undefined): string | undefined {
  if (s && process.platform !== 'win32') {
    if (s === 'Failed' || s === 'Cancelled' || s === 'Skipped') {
      return chalk.red(s);
    } else if (s === 'Success' || s === 'New') {
      return chalk.green(s);
    }
  }
  return s;
}

export default class Display extends SfdxCommand {
  public static description = messages.getMessage('displayCommandDescription');
  public static longDescription = messages.getMessage('displayCommandLongDescription');

  public static examples = ['$ sfdx analytics:autoinstall:display -i id'];

  protected static flagsConfig = {
    autoinstallid: flags.id({
      char: 'i',
      required: true,
      description: messages.getMessage('autoinstallidFlagDescription'),
      longDescription: messages.getMessage('autoinstallidFlagLongDescription')
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

  public async run(): Promise<AutoInstallRequestType> {
    const autoinstall = new AutoInstall(this.org as Org);
    const autoinstallRep = await autoinstall.fetch(this.flags.autoinstallid as string);

    // force:org:display does a blue chalk on the headers, so do it here, too
    this.ux.styledHeader(blue(messages.getMessage('displayDetailHeader')));
    this.ux.table(
      [
        { key: 'Id', value: autoinstallRep.id },
        { key: 'Request Type', value: autoinstallRep.requestType },
        { key: 'Request Name', value: autoinstallRep.requestName },
        { key: 'Request Status', value: colorStatus(autoinstallRep.requestStatus) },
        { key: 'Template API Name', value: autoinstallRep.templateApiName },
        { key: 'Folder ID', value: autoinstallRep.folderId },
        { key: 'Folder Label', value: autoinstallRep.folderLabel },
        { key: 'Template Version', value: autoinstallRep.templateVersion },
        { key: 'Template Description', value: autoinstallRep.requestTemplate?.description },
        { key: 'Template Label', value: autoinstallRep.requestTemplate?.label },
        { key: 'Template Namespace', value: autoinstallRep.requestTemplate?.namespace },
        { key: 'Template Asset Version', value: autoinstallRep.requestTemplate?.assetVersion },
        { key: 'Template Type', value: autoinstallRep.requestTemplate?.templateType },
        { key: 'Request Log', value: autoinstallRep.requestLog },
        { key: 'Created By', value: autoinstallRep.createdBy?.name },
        { key: 'Created Date', value: formatDate(autoinstallRep.createdDate) },
        { key: 'Last Modified By', value: autoinstallRep.lastModifiedBy?.name },
        { key: 'Last Modified Date', value: formatDate(autoinstallRep.lastModifiedDate) }
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
      if (
        !autoinstallRep.appFromRequest?.appLog ||
        !Array.isArray(autoinstallRep.appFromRequest?.appLog) ||
        autoinstallRep.appFromRequest.appLog.length <= 0
      ) {
        this.ux.log(messages.getMessage('displayNoLogAvailable'));
      } else {
        const data = autoinstallRep.appFromRequest.appLog?.map(line => {
          return { message: (typeof line === 'string' ? line : line.message) || '' };
        });
        this.ux.table(data, {
          columns: [{ key: 'message', label: 'Message' }]
        });
      }
    }

    return autoinstallRep;
  }
}
