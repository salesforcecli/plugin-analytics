/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { SfdxError } from '@salesforce/core';
import _ = require('lodash');

export function throwWithData(mesg: string, data: unknown): never {
  const e = new SfdxError(mesg);
  e.setData(data);
  throw e;
}

export function throwError(response: unknown): never {
  // For Gacks, the error message is on response.body[0].message but for handled errors
  // the error message is on response.body.Errors[0].description.
  const errMessage =
    (_.get(response, 'Errors[0].description') as string) ||
    (_.get(response, '[0].message') as string) ||
    (_.get(response, 'message') as string) ||
    'Unknown Error';
  throw new SfdxError(errMessage);
}

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
    timeoutMessage = 'timeout'
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
