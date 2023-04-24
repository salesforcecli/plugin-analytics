/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { promises as fs } from 'fs';
import { flags, SfdxCommand } from '@salesforce/command';
import { Org, Messages, SfdxError } from '@salesforce/core';
import chalk from 'chalk';
import { colorize, getStatusIcon, COLORS } from '../../../lib/analytics/utils';

import TemplateValidate from '../../../lib/analytics/template/validate';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'validate');

export default class Validate extends SfdxCommand {
  public static description = messages.getMessage('validateCommandDescription');
  public static longDescription = messages.getMessage('validateCommandLongDescription');

  public static examples = [
    '$ sfdx analytics:template:validate -t templateId',
    'sfdx analytics:template:validate -n templateApiName'
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
    }),
    valuesfile: flags.filepath({
      char: 'f',
      description: messages.getMessage('valuesfileFlagDescription'),
      longDescription: messages.getMessage('valuesfileFlagLongDescription')
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run() {
    const templateName = this.flags.templatename as string;
    const templateId = this.flags.templateid as string;
    const validate = new TemplateValidate(this.org as Org);
    if (!validate.appliesToThisServerVersion()) {
      const commandNotAvailable = 'Command only available in api version 58.0 or later';
      this.ux.log(commandNotAvailable);
      return commandNotAvailable;
    }
    let json: unknown;
    if (this.flags.valuesfile) {
      const path = String(this.flags.valuesfile);
      try {
        json = JSON.parse(await fs.readFile(path, 'utf8'));
      } catch (e) {
        throw new SfdxError(
          `Error parsing ${path}`,
          undefined,
          undefined,
          undefined,
          e instanceof Error ? e : new Error(e ? String(e) : '<unknown>')
        );
      }
    }

    const result = await validate.run(templateName ? templateName : templateId, json);

    const tasks = result.tasks || [];
    if (tasks.length > 0) {
      this.ux.styledHeader(colorize(messages.getMessage('tasksFound', [result.id]), chalk.blue));
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
      throw new SfdxError('Template validation failed', undefined, undefined, 1, undefined).setData(result);
    }

    return result;
  }
}
