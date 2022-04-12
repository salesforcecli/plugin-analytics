/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, Org, SfdxError } from '@salesforce/core';
import QuerySvc, {
  DRYRUN_FLAG,
  LIMIT_FLAG,
  QueryLanguage,
  QueryRequest,
  RESULT_FORMAT_FLAG
} from '../../lib/analytics/query/query';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'query');

export default class Query extends SfdxCommand {
  public static description = messages.getMessage('queryCommandDescription');
  public static longDescription = messages.getMessage('queryCommandLongDescription');

  public static examples = [
    'sfdx analytics:query -f query.saql',
    'sfdx analytics:query -f query.sql -t America/Denver',
    'sfdx analytics:query -q "..." --sql --limit 10 -r csv'
  ];

  protected static requiresUsername = true;
  protected static requiresProject = false;

  protected static flagsConfig = {
    queryfile: flags.filepath({
      char: 'f',
      description: messages.getMessage('queryfileDescription'),
      longDescription: messages.getMessage('queryfileLongDescription'),
      exclusive: ['query']
    }),
    query: flags.string({
      char: 'q',
      description: messages.getMessage('queryDescription'),
      longDescription: messages.getMessage('queryLongDescription'),
      exclusive: ['queryfile']
    }),
    nomapnames: flags.boolean({
      description: messages.getMessage('nomapnamesDescription'),
      longDescription: messages.getMessage('nomapnamesLongDescription'),
      default: false
    }),
    sql: flags.boolean({
      description: messages.getMessage('sqlDescription'),
      longDescription: messages.getMessage('sqlLongDescription'),
      default: false
    }),
    timezone: flags.string({
      char: 't',
      description: messages.getMessage('timezoneDescription'),
      longDescription: messages.getMessage('timezoneLongDescription')
    }),
    connector: flags.string({
      description: messages.getMessage('connectorDescription'),
      longDescription: messages.getMessage('connectorLongDescription')
    }),
    dryrun: DRYRUN_FLAG,
    limit: LIMIT_FLAG,
    resultformat: RESULT_FORMAT_FLAG
  };

  public async run() {
    if (!this.flags.queryfile && !this.flags.query) {
      throw new SfdxError(messages.getMessage('missingRequiredField'));
    }
    let queryStr = this.flags.queryfile
      ? await fs.readFile(this.flags.queryfile as string, 'utf8')
      : (this.flags.query as string);

    const querySvc = new QuerySvc((this.org as Org).getConnection());
    const options = {
      ux: !this.flags.json ? this.ux : undefined,
      limit: this.flags.limit as number | undefined,
      resultformat: this.flags.resultformat as string | undefined,
      dryrun: !!this.flags.dryrun
    };

    if (this.flags.connector) {
      // Live Dataset query
      this.debug(`POSTING query to connector ${this.flags.connector}: ${queryStr}`);
      return querySvc.runExternalQueryCommand(
        { query: queryStr, connectorIdOrApiName: this.flags.connector as string },
        options
      );
    } else {
      // guess queryLanguage from file extension (assume saql) if --sql not specified
      let queryLanguage: QueryLanguage = 'Saql';
      if (this.flags.sql) {
        queryLanguage = 'Sql';
      } else if (this.flags.queryfile) {
        const ext = path.extname(this.flags.queryfile as string);
        if (ext.toLocaleLowerCase() === '.sql') {
          queryLanguage = 'Sql';
        }
      }

      if (queryLanguage === 'Saql' && !this.flags.nomapnames) {
        queryStr = await querySvc.mapDatasetNames(queryStr);
      }

      const query: QueryRequest = {
        query: queryStr,
        queryLanguage,
        timezone: this.flags.timezone as string
      };

      this.debug('POSTing query: ' + JSON.stringify(query, undefined, 2));
      return querySvc.runQueryCommand(query, options);
    }
  }
}
