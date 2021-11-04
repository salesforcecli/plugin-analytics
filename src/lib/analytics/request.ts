/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as url from 'url';
import { Connection } from '@salesforce/core';
import { JsonCollection, JsonMap } from '@salesforce/ts-types';
import { RequestInfo } from 'jsforce';

/** Make a jsforce request to a connect-api resource, turning off entity encoding. */
export function connectRequest<T = JsonCollection>(
  connection: Connection,
  requestOrUrl: string | RequestInfo,
  options?: JsonMap
): Promise<T> {
  const request: RequestInfo = typeof requestOrUrl === 'string' ? { method: 'GET', url: requestOrUrl } : requestOrUrl;
  request.headers = Object.assign(request.headers || {}, {
    'X-Chatter-Entity-Encoding': 'false'
  });
  return connection.request(request, options);
}

/** The maximum number of pages to fetch via fetchAllPages. */
export const MAX_PAGES = 100;

/** Fetch all the pages of items at a specified url.
 *
 * @param connection the connection.
 * @param firstPageUrl the url to the first page of items
 * @param getItems either the name of the field in the json response which holds the items, or a function that will
 *                 return the items from the response
 * @param maxPages the maximum number of pages to fetch (defaults to MAX_PAGES)
 * @param getNextPagePath either name of the field in the json response which holds the next page path, or a function
 *                        that will return the next page path from the response; defaults to 'nextPageUrl'
 * @param fetchUrl a function to fetch the response, defaults to connectRequest()
 * @param options any options to pass to fetchUrl for the request(s)
 * @returns the items.
 */
export async function fetchAllPages<T>(
  connection: Connection,
  firstPageUrl: string,
  getItems: string | ((response: unknown) => T[] | undefined),
  {
    maxPages = MAX_PAGES,
    getNextPagePath = 'nextPageUrl',
    fetchUrl = connectRequest,
    options
  }: {
    maxPages?: number;
    getNextPagePath?: string | ((response: unknown) => string | undefined);
    fetchUrl?: (connection: Connection, request: RequestInfo, options?: JsonMap) => unknown;
    options?: JsonMap;
  } = {}
): Promise<T[]> {
  let pageNum = 0;
  const all = [] as T[];
  let nextUrl = firstPageUrl;
  while (++pageNum <= maxPages) {
    // eslint-disable-next-line no-console
    // console.debug(`#!#! Fetching page ${pageNum} from ${nextUrl}`);
    const response = await fetchUrl(connection, { method: 'GET', url: nextUrl }, options);
    // eslint-disable-next-line no-console
    // console.log(response);
    const items: unknown =
      typeof getItems === 'string' ? (response as Record<string, unknown>)[getItems] : getItems(response);
    if (!items || !Array.isArray(items)) {
      break;
    }
    // eslint-disable-next-line no-console
    // console.log(items);
    all.push(...items);
    const nextPagePath =
      typeof getNextPagePath === 'string'
        ? (response as Record<string, unknown>)[getNextPagePath]
        : getNextPagePath(response);
    if (!nextPagePath || !(typeof nextPagePath === 'string')) {
      break;
    }
    // nextPagePath is usually like '/services/data/v48.0/wave/...', but could, in theory, be relative to the request
    // url or server absolute
    nextUrl = url.resolve(nextUrl, nextPagePath);
  }
  return all;
}
