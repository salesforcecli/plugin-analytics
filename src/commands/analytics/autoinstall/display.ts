/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {
  Flags,
  SfCommand,
  loglevel,
  orgApiVersionFlagWithDeprecations,
  requiredOrgFlagWithDeprecations,
} from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import chalk from 'chalk';
import moment from 'moment';

import AutoInstall, {
  AutoInstallRequestType,
  AutoInstallStatus,
  logAppLog,
} from '../../../lib/analytics/autoinstall/autoinstall.js';
import { commandUx, generateTableColumns, headerColor } from '../../../lib/analytics/utils.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'autoinstall');

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
    loglevel,
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
    this.styledHeader(headerColor(messages.getMessage('displayDetailHeader')));
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
      logAppLog(autoinstallRep, commandUx(this));
    }

    return autoinstallRep;
  }
}
