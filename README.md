# plugin-analytics

[![NPM](https://img.shields.io/npm/v/@salesforce/analytics.svg?label=@salesforce/analytics)](https://www.npmjs.com/package/@salesforce/analytics) [![CircleCI](https://circleci.com/gh/salesforcecli/plugin-analytics/tree/main.svg?style=shield)](https://circleci.com/gh/salesforcecli/plugin-analytics/tree/main) [![Downloads/week](https://img.shields.io/npm/dw/@salesforce/analytics.svg)](https://npmjs.org/package/@salesforce/analytics) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/plugin-analytics/main/LICENSE.txt)

A plugin for working with Tableau CRM analytics applications, assets, and services.

This plugin is used with the [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli). For more information on the CLI, read the [getting started guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm).

See the [Salesforce Analytics CLI Plugin Command Reference](https://developer.salesforce.com/docs/atlas.en-us.bi_dev_guide_cli_reference.meta/bi_dev_guide_cli_reference/bi_cli_reference.htm)
for more information about this plugin.

## Install

We always recommend using the latest version of these commands bundled with the CLI, however, you can install a specific version or tag if needed.

Install the latest version:

```bash
sfdx plugins:install @salesforce/analytics
```

Install a specific version:

```bash
sfdx plugins:install @salesforce/analytics@x.y.z
```

## Issues

Please report any issues at https://github.com/forcedotcom/analyticsdx-vscode/issues

## Contributing

1. Please read our [Code of Conduct](CODE_OF_CONDUCT.md)
2. Create a new issue before starting your project so that we can keep track of
   what you are trying to add/fix. That way, we can also offer suggestions or
   let you know if there is already an effort in progress.
3. Fork this repository.
4. [Build the plugin locally](#build)
5. Create a _topic_ branch in your fork. Note, this step is recommended but technically not required if contributing using a fork.
6. Edit the code in your fork. It is recommended to use [Visual Studio Code](https://code.visualstudio.com/), which will be automatically configured for building, linting, and formatting.
7. Write appropriate tests for your changes. Try to achieve at least 95% code coverage on any new code. No pull request will be accepted without unit tests.
8. Sign CLA (see [CLA](#cla) below).
9. Send us a pull request when you are done. We'll review your code, suggest any needed changes, and merge it in.

### CLA

External contributors will be required to sign a Contributor's License
Agreement. You can do so by going to https://cla.salesforce.com/sign-cla.

### Build

To build the plugin locally, make sure to have yarn installed and run the following commands:

```bash
# Clone the repository
git clone git@github.com:salesforcecli/plugin-analytics

# Install the dependencies and compile
yarn install
yarn build
```

To use your plugin, run using the local `./bin/run` or `./bin/run.cmd` file.

```bash
# Run using local run file.
./bin/run analytics
```

There should be no differences when running via the Salesforce CLI or using the local run file. However, it can be
useful to link the plugin to do some additional testing or run your commands from anywhere on your machine.

```bash
# Link your plugin to the sfdx cli
sfdx plugins:link .
# To verify
sfdx plugins
```

## Commands

<!-- commands -->

- [`sfdx analytics:app:create [-f <filepath> | -m <string> | -t <string>] [-n <string>] [-a] [-v] [-w <number>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsappcreate--f-filepath---m-string---t-string--n-string--a--v--w-number--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:app:decouple -f <id> -t <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsappdecouple--f-id--t-id--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:app:delete -f <id> [-p] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsappdelete--f-id--p--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:app:display -f <id> [-a] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsappdisplay--f-id--a--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:app:list [-f <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsapplist--f-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:app:update -t <id> -f <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsappupdate--t-id--f-id--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:asset:publisher:create -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsassetpublishercreate--i-id--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:asset:publisher:delete -i <id> -a <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsassetpublisherdelete--i-id--a-id--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:asset:publisher:deleteall -i <id> [-p] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsassetpublisherdeleteall--i-id--p--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:asset:publisher:list -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsassetpublisherlist--i-id--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:autoinstall:app:create [-t <id> | -n <string>] [-a] [-w <number>] [-p <number>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsautoinstallappcreate--t-id---n-string--a--w-number--p-number--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:autoinstall:app:delete -f <id> [-a] [-w <number>] [-p <number>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsautoinstallappdelete--f-id--a--w-number--p-number--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:autoinstall:app:update -f <id> [-t <id> | -n <string>] [-a] [-w <number>] [-p <number>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsautoinstallappupdate--f-id--t-id---n-string--a--w-number--p-number--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:autoinstall:display -i <id> [-a] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsautoinstalldisplay--i-id--a--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:autoinstall:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsautoinstalllist--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:dashboard:history:list -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsdashboardhistorylist--i-id--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:dashboard:history:revert -i <id> -y <id> [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsdashboardhistoryrevert--i-id--y-id--l-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:dashboard:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsdashboardlist--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:dashboard:update -i <id> [-y <id>] [-r] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsdashboardupdate--i-id--y-id--r--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:dataflow:history:list -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsdataflowhistorylist--i-id--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:dataflow:history:revert -i <id> -y <id> [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsdataflowhistoryrevert--i-id--y-id--l-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:dataflow:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsdataflowlist--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:dataset:display [-i <id> | -n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsdatasetdisplay--i-id---n-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:dataset:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsdatasetlist--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:dataset:rows:fetch [-i <id> | -n <string>] [--limit <number>] [-r human|csv|json] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsdatasetrowsfetch--i-id---n-string---limit-number--r-humancsvjson--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:enable [-a] [-w <number>] [-p <number>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsenable--a--w-number--p-number--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:lens:history:list -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticslenshistorylist--i-id--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:lens:history:revert -i <id> -y <id> [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticslenshistoryrevert--i-id--y-id--l-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:lens:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticslenslist--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:query [-f <filepath> | -q <string>] [--nomapnames] [--sql] [-t <string>] [--connector <string>] [--limit <number>] [-r human|csv|json] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticsquery--f-filepath---q-string---nomapnames---sql--t-string---connector-string---limit-number--r-humancsvjson--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:template:create -f <id> [-l <string>] [--description <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticstemplatecreate--f-id--l-string---description-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:template:delete -t <id> [--forcedelete] [--decouple] [-p] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticstemplatedelete--t-id---forcedelete---decouple--p--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:template:display [-t <id> | -n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticstemplatedisplay--t-id---n-string--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:template:list [-a] [-e] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticstemplatelist--a--e--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)
- [`sfdx analytics:template:update [-t <id> | -n <string>] [-f <id>] [-v <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`](#sfdx-analyticstemplateupdate--t-id---n-string--f-id--v-integer--u-string---apiversion-string---json---loglevel-tracedebuginfowarnerrorfataltracedebuginfowarnerrorfatal)

## `sfdx analytics:app:create [-f <filepath> | -m <string> | -t <string>] [-n <string>] [-a] [-v] [-w <number>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

create a Tableau CRM app

```
USAGE
  $ sfdx analytics:app:create [-f <filepath> | -m <string> | -t <string>] [-n <string>] [-a] [-v] [-w <number>] [-u
  <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --async                                                                       create app asynchronously

  -f, --definitionfile=definitionfile                                               Tableau CRM template definition
                                                                                    file; required unless --templateid
                                                                                    is specified

  -m, --templatename=templatename                                                   template name

  -n, --appname=appname                                                             app name

  -t, --templateid=templateid                                                       template ID; required unless
                                                                                    --definitionfile is specified

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -v, --allevents                                                                   verbose display of all app create
                                                                                    events

  -w, --wait=wait                                                                   [default: 10] wait time in minutes
                                                                                    for streaming app creation events

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx analytics:app:create -t templateid -n appname
  $ sfdx analytics:app:create -m templatename
  $ sfdx analytics:app:create -f path_to_json_file
```

_See code: [src/commands/analytics/app/create.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/app/create.ts)_

## `sfdx analytics:app:decouple -f <id> -t <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

decouples a Tableau CRM app from a Tableau CRM template

```
USAGE
  $ sfdx analytics:app:decouple -f <id> -t <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --folderid=folderid                                                           (required) folder ID
  -t, --templateid=templateid                                                       (required) template ID

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:app:decouple -f folderId -t templateId
```

_See code: [src/commands/analytics/app/decouple.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/app/decouple.ts)_

## `sfdx analytics:app:delete -f <id> [-p] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

delete Tableau CRM apps

```
USAGE
  $ sfdx analytics:app:delete -f <id> [-p] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --folderid=folderid                                                           (required) folder ID

  -p, --noprompt                                                                    do not prompt to confirm force
                                                                                    delete

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:app:delete -f folderid
```

_See code: [src/commands/analytics/app/delete.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/app/delete.ts)_

## `sfdx analytics:app:display -f <id> [-a] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

displays a Tableau CRM app's details

```
USAGE
  $ sfdx analytics:app:display -f <id> [-a] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --applog                                                                      specify to include app creation log
                                                                                    details

  -f, --folderid=folderid                                                           (required) folder ID

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:app:display -f folderId -a
```

_See code: [src/commands/analytics/app/display.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/app/display.ts)_

## `sfdx analytics:app:list [-f <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

list Tableau CRM apps

```
USAGE
  $ sfdx analytics:app:list [-f <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --folderid=folderid                                                           folder ID

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:app:list
```

_See code: [src/commands/analytics/app/list.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/app/list.ts)_

## `sfdx analytics:app:update -t <id> -f <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

updates a Tableau CRM app from a template

```
USAGE
  $ sfdx analytics:app:update -t <id> -f <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --folderid=folderid                                                           (required) folder ID
  -t, --templateid=templateid                                                       (required) template ID

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:app:update -f folderId -t templateId
```

_See code: [src/commands/analytics/app/update.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/app/update.ts)_

## `sfdx analytics:asset:publisher:create -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

create a publisher record for the Tableau CRM asset

```
USAGE
  $ sfdx analytics:asset:publisher:create -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --assetid=assetid                                                             (required) Asset ID under
                                                                                    development

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:asset:publisher:create -i assetId
```

_See code: [src/commands/analytics/asset/publisher/create.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/asset/publisher/create.ts)_

## `sfdx analytics:asset:publisher:delete -i <id> -a <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

delete a Tableau CRM asset publisher

```
USAGE
  $ sfdx analytics:asset:publisher:delete -i <id> -a <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --assetid=assetid                                                             (required) Asset ID under
                                                                                    development

  -i, --id=id                                                                       (required) Asset Publisher ID under
                                                                                    development

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:asset:publisher:delete -a assetId -i assetPublisherId
```

_See code: [src/commands/analytics/asset/publisher/delete.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/asset/publisher/delete.ts)_

## `sfdx analytics:asset:publisher:deleteall -i <id> [-p] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

delete Tableau CRM asset publishers

```
USAGE
  $ sfdx analytics:asset:publisher:deleteall -i <id> [-p] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --assetid=assetid                                                             (required) Asset ID under
                                                                                    development

  -p, --noprompt                                                                    do not prompt to confirm force
                                                                                    delete

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:asset:publisher:deleteall -i assetId
```

_See code: [src/commands/analytics/asset/publisher/deleteall.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/asset/publisher/deleteall.ts)_

## `sfdx analytics:asset:publisher:list -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

list Tableau CRM asset publishers

```
USAGE
  $ sfdx analytics:asset:publisher:list -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --assetid=assetid                                                             (required) Asset ID under
                                                                                    development

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:asset:publisher:list -i assetId
```

_See code: [src/commands/analytics/asset/publisher/list.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/asset/publisher/list.ts)_

## `sfdx analytics:autoinstall:app:create [-t <id> | -n <string>] [-a] [-w <number>] [-p <number>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

creates auto-install request to create Tableau CRM app

```
USAGE
  $ sfdx analytics:autoinstall:app:create [-t <id> | -n <string>] [-a] [-w <number>] [-p <number>] [-u <string>]
  [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --async                                                                       create app asynchronously
  -n, --templatename=templatename                                                   template api name

  -p, --pollinterval=pollinterval                                                   [default: 5000] polling interval in
                                                                                    milliseconds for checking
                                                                                    auto-install request status

  -t, --templateid=templateid                                                       template ID

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -w, --wait=wait                                                                   [default: 10] wait time in minutes
                                                                                    for auto-install request to finish

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx analytics:autoinstall:app:create -t templateid
  $ sfdx analytics:autoinstall:app:create -n templatename
```

_See code: [src/commands/analytics/autoinstall/app/create.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/autoinstall/app/create.ts)_

## `sfdx analytics:autoinstall:app:delete -f <id> [-a] [-w <number>] [-p <number>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

creates auto-install request to delete Tableau CRM app

```
USAGE
  $ sfdx analytics:autoinstall:app:delete -f <id> [-a] [-w <number>] [-p <number>] [-u <string>] [--apiversion <string>]
   [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --async                                                                       delete app asynchronously
  -f, --folderid=folderid                                                           (required) folder ID

  -p, --pollinterval=pollinterval                                                   [default: 5000] polling interval in
                                                                                    milliseconds for checking
                                                                                    auto-install request status

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -w, --wait=wait                                                                   [default: 10] wait time in minutes
                                                                                    for auto-install request to finish

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:autoinstall:app:delete -f folderid
```

_See code: [src/commands/analytics/autoinstall/app/delete.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/autoinstall/app/delete.ts)_

## `sfdx analytics:autoinstall:app:update -f <id> [-t <id> | -n <string>] [-a] [-w <number>] [-p <number>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

creates auto-install request to update Tableau CRM app

```
USAGE
  $ sfdx analytics:autoinstall:app:update -f <id> [-t <id> | -n <string>] [-a] [-w <number>] [-p <number>] [-u <string>]
   [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --async                                                                       update app asynchronously
  -f, --folderid=folderid                                                           (required) folder ID
  -n, --templatename=templatename                                                   template api name

  -p, --pollinterval=pollinterval                                                   [default: 5000] polling interval in
                                                                                    milliseconds for checking
                                                                                    auto-install request status

  -t, --templateid=templateid                                                       template ID

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -w, --wait=wait                                                                   [default: 10] wait time in minutes
                                                                                    for auto-install request to finish

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx analytics:autoinstall:app:update -t templateid -f folderid
  $ sfdx analytics:autoinstall:app:update -n templatename -f folderid
```

_See code: [src/commands/analytics/autoinstall/app/update.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/autoinstall/app/update.ts)_

## `sfdx analytics:autoinstall:display -i <id> [-a] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

displays a Tableau CRM auto-install request details

```
USAGE
  $ sfdx analytics:autoinstall:display -i <id> [-a] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --applog                                                                      specify to include app creation log
                                                                                    details

  -i, --autoinstallid=autoinstallid                                                 (required) auto-install request ID

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:autoinstall:display -i id
```

_See code: [src/commands/analytics/autoinstall/display.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/autoinstall/display.ts)_

## `sfdx analytics:autoinstall:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

list Tableau CRM auto-install requests

```
USAGE
  $ sfdx analytics:autoinstall:list [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:autoinstall:list
```

_See code: [src/commands/analytics/autoinstall/list.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/autoinstall/list.ts)_

## `sfdx analytics:dashboard:history:list -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

list history records for Tableau CRM dashboards

```
USAGE
  $ sfdx analytics:dashboard:history:list -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --dashboardid=dashboardid                                                     (required) dashboard ID

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:dashboard:history:list --dashboardid <dashboardid>
```

_See code: [src/commands/analytics/dashboard/history/list.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/dashboard/history/list.ts)_

## `sfdx analytics:dashboard:history:revert -i <id> -y <id> [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

revert to specified history record

```
USAGE
  $ sfdx analytics:dashboard:history:revert -i <id> -y <id> [-l <string>] [-u <string>] [--apiversion <string>] [--json]
   [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --dashboardid=dashboardid                                                     (required) dashboard ID

  -l, --label=label                                                                 label for new reverted history
                                                                                    record

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -y, --historyid=historyid                                                         (required) dashboard history ID

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:dashboard:history:revert -i <dashboardid> -y <historyid> -l <historyLabel>
```

_See code: [src/commands/analytics/dashboard/history/revert.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/dashboard/history/revert.ts)_

## `sfdx analytics:dashboard:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

list Tableau CRM dashboards

```
USAGE
  $ sfdx analytics:dashboard:list [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:dashboard:list
```

_See code: [src/commands/analytics/dashboard/list.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/dashboard/list.ts)_

## `sfdx analytics:dashboard:update -i <id> [-y <id>] [-r] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

updates a Tableau CRM dashboard

```
USAGE
  $ sfdx analytics:dashboard:update -i <id> [-y <id>] [-r] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --dashboardid=dashboardid                                                     (required) Dashboard ID

  -r, --removecurrenthistory                                                        Remove Current History ID from
                                                                                    dashboard

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -y, --currenthistoryid=currenthistoryid                                           Current History ID to display

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx analytics:dashboard:update -i dashboardId -y currentHistoryId
  $ sfdx analytics:dashboard:update -i dashboardId -r
```

_See code: [src/commands/analytics/dashboard/update.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/dashboard/update.ts)_

## `sfdx analytics:dataflow:history:list -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

list history records for Tableau CRM dataflows

```
USAGE
  $ sfdx analytics:dataflow:history:list -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --dataflowid=dataflowid                                                       (required) dataflow ID

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:dataflow:history:list --dataflowid <dataflowid>
```

_See code: [src/commands/analytics/dataflow/history/list.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/dataflow/history/list.ts)_

## `sfdx analytics:dataflow:history:revert -i <id> -y <id> [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

revert to specified history record

```
USAGE
  $ sfdx analytics:dataflow:history:revert -i <id> -y <id> [-l <string>] [-u <string>] [--apiversion <string>] [--json]
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --dataflowid=dataflowid                                                       (required) dataflow ID

  -l, --label=label                                                                 label for new reverted history
                                                                                    record

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -y, --historyid=historyid                                                         (required) dataflow history ID

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:dataflow:history:revert -i <dataflowid> -y <historyid> -l <historyLabel>
```

_See code: [src/commands/analytics/dataflow/history/revert.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/dataflow/history/revert.ts)_

## `sfdx analytics:dataflow:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

list Tableau CRM dataflows

```
USAGE
  $ sfdx analytics:dataflow:list [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:dataflow:list
```

_See code: [src/commands/analytics/dataflow/list.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/dataflow/list.ts)_

## `sfdx analytics:dataset:display [-i <id> | -n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

displays a Tableau CRM dataset's details

```
USAGE
  $ sfdx analytics:dataset:display [-i <id> | -n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --datasetid=datasetid                                                         dataset ID
  -n, --datasetname=datasetname                                                     dataset api name

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx analytics:dataset:display -i datasetId
  $ sfdx analytics:dataset:display -n datasetApiName
```

_See code: [src/commands/analytics/dataset/display.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/dataset/display.ts)_

## `sfdx analytics:dataset:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

list Tableau CRM datasets

```
USAGE
  $ sfdx analytics:dataset:list [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:dataset:list
```

_See code: [src/commands/analytics/dataset/list.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/dataset/list.ts)_

## `sfdx analytics:dataset:rows:fetch [-i <id> | -n <string>] [--limit <number>] [-r human|csv|json] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

fetch the rows of a Tableau CRM dataset

```
USAGE
  $ sfdx analytics:dataset:rows:fetch [-i <id> | -n <string>] [--limit <number>] [-r human|csv|json] [-u <string>]
  [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --datasetid=datasetid                                                         dataset ID
  -n, --datasetname=datasetname                                                     dataset api name

  -r, --resultformat=(human|csv|json)                                               [default: human] result format
                                                                                    emitted to stdout

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --limit=limit                                                                     maximum number of rows to include

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx analytics:dataset:rows:fetch -i datasetId
  $ sfdx analytics:dataset:rows:fetch -n datasetApiName -r csv
```

_See code: [src/commands/analytics/dataset/rows/fetch.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/dataset/rows/fetch.ts)_

## `sfdx analytics:enable [-a] [-w <number>] [-p <number>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

enable Tableau CRM

```
USAGE
  $ sfdx analytics:enable [-a] [-w <number>] [-p <number>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --async                                                                       enable asynchronously

  -p, --pollinterval=pollinterval                                                   [default: 5000] polling interval in
                                                                                    milliseconds for checking
                                                                                    auto-install request status

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -w, --wait=wait                                                                   [default: 10] wait time in minutes
                                                                                    for auto-install request to finish

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:enable
```

_See code: [src/commands/analytics/enable.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/enable.ts)_

## `sfdx analytics:lens:history:list -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

list history records for Tableau CRM lenses

```
USAGE
  $ sfdx analytics:lens:history:list -i <id> [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --lensid=lensid                                                               (required) lens ID

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:lens:history:list --lensid <lensid>
```

_See code: [src/commands/analytics/lens/history/list.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/lens/history/list.ts)_

## `sfdx analytics:lens:history:revert -i <id> -y <id> [-l <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

revert to specified history record

```
USAGE
  $ sfdx analytics:lens:history:revert -i <id> -y <id> [-l <string>] [-u <string>] [--apiversion <string>] [--json]
  [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -i, --lensid=lensid                                                               (required) dashboard ID

  -l, --label=label                                                                 label for new reverted history
                                                                                    record

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -y, --historyid=historyid                                                         (required) dashboard history ID

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:dashboard:history:revert -i <dashboardid> -y <historyid> -l <historyLabel>
```

_See code: [src/commands/analytics/lens/history/revert.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/lens/history/revert.ts)_

## `sfdx analytics:lens:list [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

list Tableau CRM lenses

```
USAGE
  $ sfdx analytics:lens:list [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:lens:list
```

_See code: [src/commands/analytics/lens/list.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/lens/list.ts)_

## `sfdx analytics:query [-f <filepath> | -q <string>] [--nomapnames] [--sql] [-t <string>] [--connector <string>] [--limit <number>] [-r human|csv|json] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

execute a Tableau CRM query

```
USAGE
  $ sfdx analytics:query [-f <filepath> | -q <string>] [--nomapnames] [--sql] [-t <string>] [--connector <string>]
  [--limit <number>] [-r human|csv|json] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --queryfile=queryfile                                                         path to the file containing the
                                                                                    query to execute

  -q, --query=query                                                                 query to execute

  -r, --resultformat=(human|csv|json)                                               [default: human] result format
                                                                                    emitted to stdout

  -t, --timezone=timezone                                                           timezone for the query

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --connector=connector                                                             execute the SQL query against this
                                                                                    external data connector id or name

  --json                                                                            format output as json

  --limit=limit                                                                     maximum number of rows to include

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

  --nomapnames                                                                      skip mapping dataset names in the
                                                                                    SAQL query to ids

  --sql                                                                             execute the query as SQL

EXAMPLES
  sfdx analytics:query -f query.saql
  sfdx analytics:query -f query.sql -t America/Denver
  sfdx analytics:query -q "..." --sql --limit 10 -r csv
```

_See code: [src/commands/analytics/query.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/query.ts)_

## `sfdx analytics:template:create -f <id> [-l <string>] [--description <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

create Tableau CRM templates

```
USAGE
  $ sfdx analytics:template:create -f <id> [-l <string>] [--description <string>] [-u <string>] [--apiversion <string>]
  [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --folderid=folderid                                                           (required) folder ID
  -l, --label=label                                                                 template label

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --description=description                                                         template description

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:template:create -f folderid
```

_See code: [src/commands/analytics/template/create.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/template/create.ts)_

## `sfdx analytics:template:delete -t <id> [--forcedelete] [--decouple] [-p] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

delete Tableau CRM templates

```
USAGE
  $ sfdx analytics:template:delete -t <id> [--forcedelete] [--decouple] [-p] [-u <string>] [--apiversion <string>]
  [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -p, --noprompt                                                                    do not prompt to confirm force
                                                                                    delete

  -t, --templateid=templateid                                                       (required) template ID

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --decouple                                                                        decouple all linked Tableau CRM apps

  --forcedelete                                                                     force delete the Tableau CRM
                                                                                    template and all linked Tableau CRM
                                                                                    apps

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:template:delete -t templateid
```

_See code: [src/commands/analytics/template/delete.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/template/delete.ts)_

## `sfdx analytics:template:display [-t <id> | -n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

displays a Tableau CRM template's details

```
USAGE
  $ sfdx analytics:template:display [-t <id> | -n <string>] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -n, --templatename=templatename                                                   template name
  -t, --templateid=templateid                                                       template ID

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx analytics:template:display -t templateid
  $ sfdx analytics:template:display -n templatename
```

_See code: [src/commands/analytics/template/display.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/template/display.ts)_

## `sfdx analytics:template:list [-a] [-e] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

list Tableau CRM templates

```
USAGE
  $ sfdx analytics:template:list [-a] [-e] [-u <string>] [--apiversion <string>] [--json] [--loglevel
  trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -a, --includesalesforcetemplates                                                  include salesforce templates
  -e, --includembeddedtemplates                                                     include EmbeddedApp templates

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLES
  $ sfdx analytics:template:list
  $ sfdx analytics:template:list --includembeddedtemplates
  $ sfdx analytics:template:list --includesalesforcetemplates
```

_See code: [src/commands/analytics/template/list.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/template/list.ts)_

## `sfdx analytics:template:update [-t <id> | -n <string>] [-f <id>] [-v <integer>] [-u <string>] [--apiversion <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]`

update Tableau CRM templates

```
USAGE
  $ sfdx analytics:template:update [-t <id> | -n <string>] [-f <id>] [-v <integer>] [-u <string>] [--apiversion
  <string>] [--json] [--loglevel trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL]

OPTIONS
  -f, --folderid=folderid                                                           folder ID
  -n, --templatename=templatename                                                   template name
  -t, --templateid=templateid                                                       template ID

  -u, --targetusername=targetusername                                               username or alias for the target
                                                                                    org; overrides default target org

  -v, --assetversion=assetversion                                                   version number for upgrading the
                                                                                    template (available in api version
                                                                                    54.0)

  --apiversion=apiversion                                                           override the api version used for
                                                                                    api requests made by this command

  --json                                                                            format output as json

  --loglevel=(trace|debug|info|warn|error|fatal|TRACE|DEBUG|INFO|WARN|ERROR|FATAL)  [default: warn] logging level for
                                                                                    this command invocation

EXAMPLE
  $ sfdx analytics:template:update -t templateid -f folderid
```

_See code: [src/commands/analytics/template/update.ts](https://github.com/salesforcecli/plugin-analytics/blob/v1.0.4/src/commands/analytics/template/update.ts)_

<!-- commandsstop -->
