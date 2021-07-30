/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { get, getNumber, JsonMap } from '@salesforce/ts-types';

export default class WaveAssetEvent {
  public readonly status: string;
  public readonly message: string;
  public readonly eventType: string;
  public readonly index: number;
  public readonly folderId: string;
  public readonly itemId: string;
  public readonly namespace: string;
  public readonly total: number;
  public readonly name: string;
  public readonly label: string;

  public constructor(event: JsonMap) {
    this.message = String(get(event, 'payload.Message'));
    this.status = String(get(event, 'payload.Status'));
    this.eventType = String(get(event, 'payload.EventType'));
    this.index = getNumber(event, 'payload.Index') || 0;
    this.folderId = String(get(event, 'payload.FolderId'));
    this.itemId = String(get(event, 'payload.ItemId'));
    this.namespace = String(get(event, 'payload.WaveNamespace'));
    this.total = getNumber(event, 'payload.Total') || 0;
    this.name = String(get(event, 'payload.ItemName'));
    this.label = String(get(event, 'payload.ItemLabel'));
  }
}
