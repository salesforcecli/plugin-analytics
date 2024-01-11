/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import chalk from 'chalk';
import { colorize, getStatusIcon, COLORS } from '../../../lib/analytics/utils.js';

import TemplateLint, { type LintType } from '../../../lib/analytics/template/lint.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'lint');

export default class Lint extends SfCommand<LintType | string> {
  public static readonly summary = messages.getMessage('lintCommandDescription');
  public static readonly description = messages.getMessage('lintCommandLongDescription');

  public static readonly examples = [
    '$ sfdx analytics:template:lint -t templateId',
    'sfdx analytics:template:lint -n templateApiName',
  ];

  public static readonly flags = {
    targetOrg: requiredOrgFlagWithDeprecations,
    templateid: Flags.string({
      char: 't',
      summary: messages.getMessage('templateidFlagDescription'),
      description: messages.getMessage('templateidFlagLongDescription'),
      exclusive: ['templatename'],
    }),
    templatename: Flags.string({
      char: 'n',
      summary: messages.getMessage('templatenameFlagDescription'),
      description: messages.getMessage('templatenameFlagLongDescription'),
      exclusive: ['templateid'],
    }),
  };

  public async run() {
    const { flags } = await this.parse(Lint);
    const templateName = flags.templatename as string;
    const templateId = flags.templateid as string;
    const lint = new TemplateLint(flags.targetOrg);
    if (!lint.appliesToThisServerVersion()) {
      const commandNotAvailable = 'Command only available in api version 58.0 or later';
      this.log(commandNotAvailable);
      return commandNotAvailable;
    }
    const result = await lint.run(templateName ? templateName : templateId);

    const tasks = result.tasks ?? [];
    if (tasks.length > 0) {
      this.styledHeader(colorize(messages.getMessage('tasksFound', [result.label, String(result.score)]), chalk.blue));
    }

    this.table(
      tasks.map((task) => ({
        label: task.label ?? '',
        readinessStatus: task.readinessStatus ?? '',
        message: task.message ?? '',
      })),
      {
        label: { header: 'Task' },
        readinessStatus: {
          header: 'Status',
          get: (row) =>
            colorize(
              getStatusIcon(row.readinessStatus) + ' ' + row.readinessStatus,
              COLORS.readinessStatus(row.readinessStatus)
            ),
        },
        message: { header: 'Message' },
      }
    );

    // check if there is any readiness failure
    const didAnyReadinessTasksFail = tasks.some((task) => task.readinessStatus === 'Failed');
    if (didAnyReadinessTasksFail) {
      throw new SfError('Template linting failed', undefined, undefined, 1, undefined).setData(result);
    }

    return result;
  }
}
