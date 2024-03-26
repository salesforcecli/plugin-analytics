/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { promises as _fs } from 'node:fs';
import { Errors, Flags, ux } from '@oclif/core';
import { SfError } from '@salesforce/core';
import { camelCaseToTitleCase } from '@salesforce/kit';
import { SfCommand, Ux } from '@salesforce/sf-plugins-core';
import _get from 'lodash.get';
import chalk, { ChalkInstance } from 'chalk';

/** A flag that support a floating point number. */
export const numberFlag = Flags.custom<number, { max?: number; min?: number }>({
  // eslint-disable-next-line @typescript-eslint/require-await
  async parse(input, _, opts) {
    let num: number;
    try {
      num = Number.parseFloat(input);
    } catch (error) {
      throw new Errors.CLIError(`Expected an number but received: ${input}`);
    }
    if (opts.min !== undefined && num < opts.min)
      throw new Errors.CLIError(`Expected an integer greater than or equal to ${opts.min} but received: ${input}`);
    if (opts.max !== undefined && num > opts.max)
      throw new Errors.CLIError(`Expected an integer less than or equal to ${opts.max} but received: ${input}`);
    return num;
  },
});

export type CommandUx = Pick<
  SfCommand<unknown>,
  'log' | 'logJson' | 'styledJSON' | 'styledHeader' | 'table' | 'spinner'
> & {
  jsonEnabled: boolean;
};
/** Return an obejct that proxies to the ux methods on the command.
 * This avoids making a new Ux and seems to work nicer with the test code.
 */
export function commandUx<T>(command: SfCommand<T>): CommandUx {
  return {
    jsonEnabled: command.jsonEnabled(),
    log: command.log.bind(command),
    logJson: command.logJson.bind(command),
    styledJSON: command.styledJSON.bind(command),
    styledHeader: command.styledHeader.bind(command),
    table: command.table.bind(command),
    spinner: command.spinner,
  };
}

/** Generate default table columns for specified table data keys. */
export function generateTableColumns<R extends Ux.Table.Data>(
  keys: string[],
  mutute?: (key: string, column: Partial<ux.Table.table.Column<R>>) => Partial<ux.Table.table.Column<R>>
): Ux.Table.Columns<R> {
  return keys.reduce<Ux.Table.Columns<R>>((columns, key) => {
    // This is what the old `tableColumnData` used to do for table column header labels
    let column: Partial<ux.Table.table.Column<R>> = { header: camelCaseToTitleCase(key).toUpperCase() };
    if (mutute) {
      column = mutute(key, column);
    }
    columns[key] = column;
    return columns;
  }, {});
}

/** Export file system utility methods.
 * We need mostly for testing, since we can't stub the real node:fs since oclif uses that during testing.
 * Also we need to export as an object since this is an ES module and you can't stub top-level functions from those.
 */
export const fs = {
  readFile: (path: string, charset: BufferEncoding = 'utf8') => _fs.readFile(path, charset),
};

export function throwWithData(mesg: string, data: unknown): never {
  const e = new SfError(mesg);
  e.setData(data);
  throw e;
}

export function throwError(response: unknown): never {
  // For Gacks, the error message is on response.body[0].message but for handled errors
  // the error message is on response.body.Errors[0].description.
  const errMessage =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    (_get(response, 'Errors[0].description') as unknown as string) ||
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    (_get(response, '[0].message') as unknown as string) ||
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    (_get(response, 'message') as unknown as string) ||
    'Unknown Error';
  throw new SfError(errMessage);
}

export function colorize(s: string, color: ChalkInstance | undefined): string {
  return color && process.platform !== 'win32' ? color(s) : s;
}

// we use blue in many of the styled headers
export function headerColor(s: string) {
  return colorize(s, chalk.blue);
}

const warning = chalk.hex('#ff5f00');

export function getStatusIcon(s: string): string {
  switch (s) {
    case 'Complete':
      return chalk.green('✔');
    case 'Warning':
      return warning('△');
    case 'Failed':
      return chalk.red('✖');
    default:
      return '';
  }
}

export const COLORS = {
  // these seem to line up with what tsc (typescript compiler) does
  readinessStatus: (s: string): ChalkInstance | undefined => {
    switch (s) {
      case 'Complete':
        return chalk.green;
      case 'Warning':
        return warning;
      case 'Failed':
        return chalk.red;
      default:
        return undefined;
    }
  },
};

/**
 * Wait for the specified function to match against the predicate
 *
 * @param func the fuction to call
 * @param predicate the predicate to match
 * @param pauseMs the pause between checks in ms.
 * @param timeoutMs the timeout, the returned promise will be rejected after this amount of time, as per timeoutMessage
 * @param rejectOnError true to reject the promise on any thrown error, false to continue.
 * @param timeoutMessage used if a timeout occurs to create the reject error, can return either a string (which will be
 *        the resulting Error message) or a Error or can throw an error
 * @returns the return value from the matched call to the function.
 */
export function waitFor<T>(
  func: () => T | Promise<T>,
  predicate: (val: T) => boolean | undefined,
  {
    pauseMs,
    timeoutMs,
    rejectOnError = true,
    timeoutMessage = 'timeout',
  }: {
    pauseMs: number;
    timeoutMs: number;
    rejectOnError?: boolean;
    timeoutMessage?: string | ((lastval: T | undefined) => string | Error | never);
  }
): Promise<T> {
  return new Promise((resolve, reject) => {
    const start = new Date().getTime();
    // call the func and check against predicate, will schedule itself if it doesn't resolve/reject
    async function check(): Promise<void> {
      let val: T | undefined;
      try {
        val = await func();
        if (predicate(val)) {
          resolve(val);
          return;
        }
      } catch (e) {
        if (rejectOnError) {
          reject(e);
          return;
        }
      }
      // check for timeout
      if (new Date().getTime() - start >= timeoutMs) {
        try {
          const msg = typeof timeoutMessage === 'string' ? timeoutMessage : timeoutMessage(val);
          if (msg instanceof Error) {
            reject(msg);
          } else {
            const error = new Error(msg || 'timeout');
            error.name = 'timeout';
            reject(error);
          }
        } catch (e) {
          reject(e);
        }
        return;
      }
      // schedule this to run again
      setTimeout(() => {
        check().catch(reject);
      }, pauseMs);
    }
    check().catch(reject);
  });
}
