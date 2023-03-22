/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { flags, SfdxCommand } from '@salesforce/command';
import { Org, Messages } from '@salesforce/core';
import chalk from 'chalk';
import { colorize, getStatusIcon, COLORS } from '../../../lib/analytics/utils';

import TemplateLint from '../../../lib/analytics/template/lint';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'lint');

export default class Lint extends SfdxCommand {
  public static description = messages.getMessage('lintCommandDescription');
  public static longDescription = messages.getMessage('lintCommandLongDescription');

  public static examples = [
    '$ sfdx analytics:template:lint -t templateId',
    'sfdx analytics:template:lint -n templateAiName'
  ];

  protected static flagsConfig = {
    templateid: flags.string({
      char: 't',
      description: messages.getMessage('templateidFlagDescription'),
      longDescription: messages.getMessage('templateidFlagLongDescription'),
      exclusive: ['templatename']
    }),
    templatename: flags.string({
      char: 'n',
      description: messages.getMessage('templatenameFlagDescription'),
      longDescription: messages.getMessage('templatenameFlagLongDescription'),
      exclusive: ['templateid']
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const templateName = this.flags.templatename as string;
    const templateId = this.flags.templateid as string;
    const lint = new TemplateLint(this.org as Org);
    if (!lint.appliesToThisServerVersion()) {
      const commandNotAvailable = 'Command only available in api version 58.0 or later';
      this.ux.log(commandNotAvailable);
      return commandNotAvailable;
    }
    const result = await lint.run(templateName ? templateName : templateId);

    const tasks = result.tasks || [];
    if (tasks.length > 0) {
      this.ux.styledHeader(
        colorize(messages.getMessage('tasksFound', [result.label, String(result.score)]), chalk.blue)
      );
    }

    this.ux.table(
      tasks.map(task => {
        return {
          label: task.label || '',
          readinessStatus: task.readinessStatus || '',
          message: task.message || ''
        };
      }),
      {
        columns: [
          { key: 'label', label: 'Task', format: v => v },
          {
            key: 'readinessStatus',
            label: 'Status',
            format: v => colorize(getStatusIcon(v) + ' ' + v, COLORS.readinessStatus(v))
          },
          { key: 'message', label: 'Message', format: v => v }
        ]
      }
    );

    // check if there is any readiness failure
    const didAnyReadinessTasksFail = tasks.some(task => task.readinessStatus === 'Failed');
    if (didAnyReadinessTasksFail) {
      process.exitCode = 1;
    }

    return result;
  }
}
