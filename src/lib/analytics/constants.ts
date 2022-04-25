/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/** Default timeout to wait for app creation/update commands, in minutes. */
export const DEF_APP_CREATE_UPDATE_TIMEOUT = 10;

/** Default server polling interval, in milliseconds. */
// the md commands in force: default to 5000ms. polling interval so use the same here
export const DEF_POLLING_INTERVAL = 5000;

/** The shortest polling interval we'll let people specify, in milliseconds */
export const MIN_POLLING_INTERVAL = 1000;
