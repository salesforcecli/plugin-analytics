/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Connection, Org } from '@salesforce/core';
import { connectRequest, fetchAllPages } from '../request';
import { throwError } from '../utils';

export type VariantRep = Record<string, unknown> & {
  fullyQualifiedApiName: string;
  description?: string;
  label?: string;
};

export type ChainRep = Record<string, unknown> & {
  dominoVariant: string;
  id?: string;
  name?: string;
  label?: string;
};

export type RuntimeRep = Record<string, unknown> & {
  chainId: string;
  id?: string;
  chainName?: string;
  requestStatus: string;
  logId?: string;
  stateId?: string;
};

export type AttachmentRep = Record<string, unknown> & {
  attachment: { entries: EntryRep[] };
};

export type EntryRep = Record<string, unknown> & { message: string; timestamp: string };

export default class Domino {
  private readonly connection: Connection;
  private readonly variantUrl: string;
  private readonly chainsUrl: string;
  private readonly runtimesUrl: string;
  private readonly attachmentsUrl: string;

  public constructor(organization: Org) {
    this.connection = organization.getConnection();
    this.variantUrl = `${this.connection.baseUrl()}/domino/variants`;
    this.chainsUrl = `${this.connection.baseUrl()}/domino/chains?variant=`;
    this.runtimesUrl = `${this.connection.baseUrl()}/domino/runtimes?chain=`;
    this.attachmentsUrl = `${this.connection.baseUrl()}/domino/attachments/`;
  }

  public async fetchAttachment(attachmentid: string): Promise<AttachmentRep> {
    const response = await connectRequest<AttachmentRep>(this.connection, {
      method: 'GET',
      url: this.attachmentsUrl + attachmentid
    });
    if (response) {
      // eslint-disable-next-line no-console
      // console.log(this.getEntryRep(response));
      return response;
    } else {
      throwError(response);
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public getEntryRep(a: AttachmentRep) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return a.attachment.entries;
  }

  public variantList(): Promise<VariantRep[]> {
    return fetchAllPages<VariantRep>(this.connection, this.variantUrl, 'items');
  }

  public chainList(variantName: string): Promise<ChainRep[]> {
    return fetchAllPages<ChainRep>(this.connection, this.chainsUrl + variantName, 'items');
  }

  public runtimeList(chainName: string): Promise<RuntimeRep[]> {
    return fetchAllPages<RuntimeRep>(this.connection, this.runtimesUrl + chainName, 'items');
  }

  public attachmentsList(attachmentId: string): Promise<EntryRep[]> {
    return fetchAllPages<EntryRep>(
      this.connection,
      this.attachmentsUrl + attachmentId,
      res => (res as AttachmentRep).attachment.entries
    );
  }
}
