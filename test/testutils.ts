/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { OrgConfigProperties } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup.js';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import { AnyJson, JsonPrimitive, ensureAnyJson } from '@salesforce/ts-types';
import { assert, expect } from 'chai';

/** Stub the specified org and set it as the default org for a test. */
export async function stubDefaultOrg($$: TestContext, testOrg: MockTestOrgData) {
  await $$.stubAuths(testOrg);
  await $$.stubConfig({ [OrgConfigProperties.TARGET_ORG]: testOrg.username });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAllLogs(logMethod: sinon.SinonStub<[message?: string | undefined, ...args: any[]], void>): string {
  return logMethod
    .getCalls()
    .flatMap((c) => c.args)
    .join('\n');
}

/** Get the results of all the calls to Command.log(). */
export function getStdout(stubs: ReturnType<typeof stubSfCommandUx>): string {
  return getAllLogs(stubs.log);
}

/** Get the results of all the calls to Command.logToStderr(). */
export function getStderr(stubs: ReturnType<typeof stubSfCommandUx>): string {
  return getAllLogs(stubs.logToStderr);
}

/** Get the json object of a call to Command.logJson().  */
export function getJsonOutput(stubs: ReturnType<typeof stubSfCommandUx>, callNum = 0): AnyJson | undefined {
  const calls = stubs.logJson.getCalls();
  return calls.length > callNum && typeof calls[callNum]?.args[0] !== 'undefined'
    ? ensureAnyJson(calls[callNum].args[0])
    : undefined;
}

/** Get the json object of a call to Command.styledJSON().  */
export function getStyledJSON(stubs: ReturnType<typeof stubSfCommandUx>, callNum = 0): AnyJson | undefined {
  const calls = stubs.styledJSON.getCalls();
  return calls.length > callNum && typeof calls[callNum]?.args[0] !== 'undefined'
    ? ensureAnyJson(calls[callNum].args[0])
    : undefined;
}

/** Get the results of all the calls to Command.styledHeader(). */
export function getStyledHeaders(stubs: ReturnType<typeof stubSfCommandUx>): string {
  return stubs.styledHeader
    .getCalls()
    .flatMap((c) => c.args)
    .join('\n');
}

/** Get the table data & headers of a call to Command.table(). */
export function getTableData(stubs: ReturnType<typeof stubSfCommandUx>, callNum = 0) {
  const calls = stubs.table.getCalls();
  return {
    data: calls.length > callNum ? calls[callNum]?.args[0] : undefined,
    headers: calls.length > callNum && calls[callNum]?.args[1] ? Object.keys(calls[callNum].args[1]) : undefined,
  };
}

/** Expect an rray to contain at least one object that matches the specified assertion.
 *
 * @param a the array.
 * @param assertion function that should either throw an error for not matching or return for matching.
 * @param prefix the prefix message for any assertions.
 * @param message the message on failure to match.
 */
export function expectToHaveElementMatching<T extends Record<string, unknown>>(
  a: readonly T[] | undefined,
  assertion: (e: T) => unknown,
  { prefix, message }: { prefix?: string; message?: string | (() => string) } = {}
) {
  assert.isDefined(a, prefix);
  assert.isArray(a, prefix);
  for (const e of a!) {
    try {
      assertion(e);
      return true;
    } catch (ignore) {
      /* keep looping over the array */
    }
  }
  // no match so fail
  const failMessage =
    (typeof message === 'function' ? message() : message) ??
    'Failed to find exepected element in array ' + JSON.stringify(a);
  assert.fail(`${prefix ? prefix + ': ' : ''}${failMessage}`);
}

/** Expect an array to contain an object that has at least the specified fields. */
export function expectToHaveElementInclude<T extends Record<string, unknown>>(
  a: readonly T[] | undefined,
  expected: unknown,
  prefix?: string
) {
  expectToHaveElementMatching(a, (e) => expect(e).to.include(expected), {
    prefix,
    message: () => 'Expected element matching ' + JSON.stringify(expected) + ' in array ' + JSON.stringify(a),
  });
}

/** Expect an array to contain an object that at least one value matching the specified value. */
export function expectToHaveElementValue<T extends Record<string, unknown>>(
  a: readonly T[] | undefined,
  expected: RegExp | JsonPrimitive,
  prefix?: string
) {
  expectToHaveElementMatching(
    a,
    (e) => {
      // iterate over the values of the array element
      const values = Object.values(e);
      if (typeof expected === 'object') {
        // expected should be a regex
        if (!values.find((value) => String(value).match(expected as RegExp))) {
          throw new Error('no match');
        }
      } else {
        // expected should be a simple string
        expect(values, prefix).contains(expected);
      }
    },
    {
      prefix,
      message: () =>
        'Expected element value matching ' +
        (typeof expected === 'string' ? `"${expected}"` : expected) +
        ' in array ' +
        JSON.stringify(a),
    }
  );
}
