/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Connection, Org } from '@salesforce/core';
import { connectRequest, fetchAllPages } from '../request.js';
import { throwError } from '../utils.js';

export type TemplateType = Record<string, unknown> & {
  id?: string;
  name?: string;
  label?: string;
  namespace?: string;
  description?: string;
  folderSource?: Record<string, unknown> & {
    id?: string;
  };
  releaseInfo?: Record<string, unknown> & {
    templateVersion?: string;
  };
  templateType?: string;
  assetVersion?: string;
  recipeIds?: string[];
  datatransformIds?: string[];
};

export default class WaveTemplate {
  public readonly serverVersion: number;
  private readonly connection: Connection;
  private readonly templatesUrl: string;

  public constructor(organization: Org) {
    this.connection = organization.getConnection();
    this.templatesUrl = `${this.connection.baseUrl()}/wave/templates/`;
    this.serverVersion = +this.connection.getApiVersion();
  }

  public async fetch(templateNameOrId: string, viewOnly = true): Promise<TemplateType> {
    const response = await connectRequest<TemplateType>(this.connection, {
      method: 'GET',
      url: this.templatesUrl + encodeURIComponent(templateNameOrId) + (viewOnly ? '?options=ViewOnly' : ''),
    });
    if (response) {
      return response;
    } else {
      throwError(response);
    }
  }

  public async create(
    folderid: string,
    {
      label,
      description,
      recipeIds,
      datatransformIds,
    }: { label?: string; description?: string; recipeIds?: string[]; datatransformIds?: string[] } = {}
  ): Promise<string | undefined> {
    const opts: Record<string, unknown> = { folderSource: { id: folderid }, label, description, recipeIds };
    if (datatransformIds && this.serverVersion >= 59.0) {
      opts.dataTransformIds = datatransformIds;
    }

    const body = JSON.stringify(opts);
    const response = await connectRequest<TemplateType>(this.connection, {
      method: 'POST',
      url: this.templatesUrl,
      body,
    });
    if (response) {
      return response.id;
    } else {
      throwError(response);
    }
  }

  public async update(
    folderid: string,
    templateIdOrName: string,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    templateAssetVersion: number | unknown,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    recipeIds: string[] | unknown,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    datatransformIds: string[] | unknown
  ): Promise<{ id: string | undefined; name: string | undefined } | undefined> {
    const opts: Record<string, unknown> = { folderSource: { id: folderid } };
    if (templateAssetVersion && this.serverVersion >= 54.0) {
      opts.assetVersion = templateAssetVersion;
    }
    if (recipeIds && this.serverVersion >= 55.0) {
      opts.recipeIds = recipeIds;
    }
    if (datatransformIds && this.serverVersion >= 59.0) {
      opts.dataTransformIds = datatransformIds;
    }

    const body = JSON.stringify(opts);
    const wtUrl = this.templatesUrl + encodeURIComponent(templateIdOrName);
    const response = await connectRequest<TemplateType>(this.connection, {
      method: 'PUT',
      url: wtUrl,
      body,
    });

    if (response) {
      return { id: response.id, name: response.name };
    } else {
      throwError(response);
    }
  }

  public list(viewonly?: boolean): Promise<TemplateType[]> {
    let wtUrl = this.templatesUrl;
    if (viewonly) {
      wtUrl += '?options=ViewOnly';
    }

    // /wave/templates doesn't do pagination, but this collects items in a nice, one-line strongly-typed way that works
    // with single page results just fine
    return fetchAllPages<TemplateType>(this.connection, wtUrl, 'templates');
  }

  public deleteTemplate(templateid: string): Promise<void> {
    return connectRequest(this.connection, {
      method: 'DELETE',
      url: this.templatesUrl + encodeURIComponent(templateid),
    });
  }
}
