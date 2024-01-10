/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// these are hacks for the _help() method, which is needed
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { SfCommand } from '@salesforce/sf-plugins-core';

const asciiSignature = (version: string) => `
                 DX DX DX
             DX DX DX DX DX DX          DX DX DX
          DX DX DX      DX DX DX    DX DX DX DX DX DX
        DX DX              DX DX DX DX DX     DX DX DX
       DX DX                 DX DX DX             DX DX    DX DX DX
      DX DX                    DX DX                DX DX DX DX DX DX DX
     DX DX                                          DX DX DX       DX DX DX
     DX DX                                            DX             DX DX DX
      DX DX                                                              DX DX
      DX DX                                                               DX DX
       DX DX                                                              DX DX
     DX DX                                                                 DX DX
   DX DX                                                                   DX DX
 DX DX                                                                     DX DX
DX DX                                                                     DX DX
DX DX                                                                    DX DX
DX DX                                                                   DX DX
 DX DX                                                    DX         ,&&&&&&&,
 DX DX                                                  DX DX DX DX D,&(((((#,
  DX DX                                                 DX DX DX DX D,&(((((#,
    DX DX DX   DX DX                     DX           DX DX   .%&&&&&&&(((((#,
       DX DX DX DX DX                   DX DX DX DX DX DX     ,&&,   ,&(((((#,
          DX DX  DX DX                  DX DX DX DX DX   ,,,,,*&&,   ,&(((((#,
                  DX DX              DX DX             ,#&%%%%%&&,   ,&(((((#,
                    DX DX DX     DX DX DX              ,#(((((#&&,   ,&(((((#,
                      DX DX DX DX DX DX                ,#(((((#&&,   ,&(((((#,
                          DX DX DX                   %&&&&&&&&&&&&&&&&&&&&&&&&&%

Salesforce Analytics CLI Plugin v${version}
* Analytics Templates Developer Guide: https://sfdc.co/adx_templates_cli
* Analytics CLI Command Reference: https://sfdc.co/adx_cli_reference
* Analytics Sample Templates: https://github.com/forcedotcom/sfdx-analytics
* Analytics Extensions for VS Code: https://marketplace.visualstudio.com/items?itemName=salesforce.analyticsdx-vscode
`;

// This command is a little funky in that it's really masking the default operation for hitting an oclif topic, so
// we don't really want a summary nor examples.
// eslint-disable-next-line sf-plugin/command-example, sf-plugin/command-summary
export default class Analytics extends SfCommand<{ adxVersion: string }> {
  public static readonly hidden = true;

  private static cachedVersion: string;
  public static get version(): string {
    if (!this.cachedVersion) {
      try {
        const pkg = require('../../package.json') as Record<string, unknown>;
        Analytics.cachedVersion = (pkg && typeof pkg.version === 'string' && pkg.version.trim()) || '<unknown>';
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Unable to determine analytics sfdx plugin version', e);
      }
      if (!this.cachedVersion) {
        this.cachedVersion = '<unknown>';
      }
    }
    return this.cachedVersion;
  }

  public run() {
    this.log(asciiSignature(Analytics.version));
    return Promise.resolve({ adxVersion: Analytics.version });
  }
}
