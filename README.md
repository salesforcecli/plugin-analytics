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

<!-- commandsstop -->
