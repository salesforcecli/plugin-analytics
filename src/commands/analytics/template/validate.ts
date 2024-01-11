/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Flags, SfCommand, requiredOrgFlagWithDeprecations } from '@salesforce/sf-plugins-core';
import { Messages, SfError } from '@salesforce/core';
import chalk from 'chalk';
import { colorize, getStatusIcon, COLORS, fs } from '../../../lib/analytics/utils.js';

import TemplateValidate, { ValidateType } from '../../../lib/analytics/template/validate.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('@salesforce/analytics', 'validate');

export default class Validate extends SfCommand<ValidateType | string> {
  public static readonly summary = messages.getMessage('validateCommandDescription');
  public static readonly description = messages.getMessage('validateCommandLongDescription');

  public static readonly examples = [
    '$ sfdx analytics:template:validate -t templateId',
    'sfdx analytics:template:validate -n templateApiName',
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
    valuesfile: Flags.file({
      char: 'f',
      summary: messages.getMessage('valuesfileFlagDescription'),
      description: messages.getMessage('valuesfileFlagLongDescription'),
    }),
  };

  public async run() {
    const { flags } = await this.parse(Validate);
    const templateName = flags.templatename as string;
    const templateId = flags.templateid as string;
    const validate = new TemplateValidate(flags.targetOrg);
    if (!validate.appliesToThisServerVersion()) {
      const commandNotAvailable = 'Command only available in api version 58.0 or later';
      this.log(commandNotAvailable);
      return commandNotAvailable;
    }
    let json: unknown;
    if (flags.valuesfile) {
      const path = String(flags.valuesfile);
      try {
        json = JSON.parse(await fs.readFile(path));
      } catch (e) {
        throw new SfError(
          `Error parsing ${path}`,
          undefined,
          undefined,
          undefined,
          e instanceof Error ? e : new Error(e ? String(e) : '<unknown>')
        );
      }
    }

    const result = await validate.run(templateName ? templateName : templateId, json);

    const tasks = result.tasks ?? [];
    if (tasks.length > 0) {
      this.styledHeader(colorize(messages.getMessage('tasksFound', [result.id]), chalk.blue));
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
      throw new SfError('Template validation failed', undefined, undefined, 1, undefined).setData(result);
    }

    return result;
  }
}
