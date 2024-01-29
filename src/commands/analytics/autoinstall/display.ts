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

import AutoInstall, {
  AutoInstallRequestType,
  AutoInstallStatus,
} from '../../../lib/analytics/autoinstall/autoinstall.js';
import { generateTableColumns } from '../../../lib/analytics/utils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
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

export default class Display extends SfCommand<AutoInstallRequestType> {
  public static readonly summary = messages.getMessage('displayCommandDescription');
  public static readonly description = messages.getMessage('displayCommandLongDescription');

  public static readonly examples = ['$ sfdx analytics:autoinstall:display -i id'];

  public static readonly flags = {
    'target-org': requiredOrgFlagWithDeprecations,
    'api-version': orgApiVersionFlagWithDeprecations,
    autoinstallid: Flags.salesforceId({
      char: 'i',
      required: true,
      summary: messages.getMessage('autoinstallidFlagDescription'),
      description: messages.getMessage('autoinstallidFlagLongDescription'),
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
    const autoinstall = new AutoInstall(flags['target-org'].getConnection(flags['api-version']));
    const autoinstallRep = await autoinstall.fetch(flags.autoinstallid);

    // force:org:display does a blue chalk on the headers, so do it here, too
    this.styledHeader(blue(messages.getMessage('displayDetailHeader')));
    this.table(
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
        { key: 'Last Modified Date', value: formatDate(autoinstallRep.lastModifiedDate) },
      ],
      generateTableColumns(['key', 'value'])
    );

    if (flags.applog) {
      this.styledHeader(blue(messages.getMessage('displayLogHeader')));
      if (
        !autoinstallRep.appFromRequest?.appLog ||
        !Array.isArray(autoinstallRep.appFromRequest?.appLog) ||
        autoinstallRep.appFromRequest.appLog.length <= 0
      ) {
        this.log(messages.getMessage('displayNoLogAvailable'));
      } else {
        const data = autoinstallRep.appFromRequest.appLog?.map((line) => ({
          message: (typeof line === 'string' ? line : line.message) || '',
        }));
        this.table(data, generateTableColumns(['message']));
      }
    }

    return autoinstallRep;
  }
}
