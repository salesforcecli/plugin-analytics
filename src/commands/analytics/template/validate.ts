/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { EOL } from 'os';
import { codeFrameColumns, SourceLocation as CodeFrameLocation } from '@babel/code-frame';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { FileTemplateValidator } from '@salesforce/analyticsdx-template-lint/out/src/validator';
import chalk, { Chalk } from 'chalk';
import { Diagnostic as SrcDiagnostic, DiagnosticSeverity as SrcDiagnosticSeverity } from 'vscode-languageserver-types';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/analytics', 'template');

async function pathstat(pathStr: string) {
  try {
    return await fs.stat(pathStr);
  } catch (error) {
    if ((error as { code?: string })?.code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

type Severity = 'error' | 'warning' | 'info' | 'hint';
type Diagnostic = {
  path: string;
  line: number;
  column: number;
  severity: Severity;
  code?: string;
  message: string;
  codeFrame?: string;
};

function processDiagnostics(
  validator: FileTemplateValidator,
  {
    includeCodeFrames,
    includeInfos,
    includeHints,
    fullpaths
  }: { includeCodeFrames: boolean; includeHints: boolean; includeInfos: boolean; fullpaths: boolean }
): { numErrors: number; numWarnings: number; diagnostics: Diagnostic[] } {
  let numErrors = 0;
  let numWarnings = 0;
  const diagnostics = [] as Diagnostic[];

  // convert the map of file->issues into a flat list is diagnostics, filter things out, and count errors/warnings
  validator.diagnostics.forEach((srcDiagnostics, doc) => {
    const filepath = fullpaths ? doc.uri : path.relative(validator.dir, doc.uri);
    srcDiagnostics.forEach(srcDiagnostic => {
      const d = mapSrcDiagnostic(srcDiagnostic, filepath);
      if (includeDiagnostic(d, includeInfos, includeHints)) {
        diagnostics.push(d);
        if (d.severity === 'error') {
          numErrors++;
        } else if (d.severity === 'warning') {
          numWarnings++;
        }
        if (includeCodeFrames) {
          let loc: CodeFrameLocation;
          // if the diagnostic range is spread over multiple lines, just highlight the start so we
          // don't blow up the output with lots of json output
          if (srcDiagnostic.range.end.line !== srcDiagnostic.range.start.line) {
            loc = {
              start: { line: srcDiagnostic.range.start.line + 1, column: srcDiagnostic.range.start.character + 1 }
            };
          } else {
            loc = {
              start: { line: srcDiagnostic.range.start.line + 1, column: srcDiagnostic.range.start.character + 1 },
              end: { line: srcDiagnostic.range.end.line + 1, column: srcDiagnostic.range.end.character + 1 }
            };
          }
          d.codeFrame = codeFrameColumns(doc.getText(), loc, {
            highlightCode: true,
            linesAbove: 1,
            linesBelow: 1
          });
        }
      }
    });
  });
  // sort those diagnostics by file, line, column
  diagnostics.sort((d1, d2) => {
    let i = d1.path.localeCompare(d2.path);
    if (i !== 0) {
      return i;
    }
    i = d1.line - d2.line;
    if (i !== 0) {
      return i;
    }
    return d1.column - d2.column;
  });

  return { numErrors, numWarnings, diagnostics };
}

function mapSrcDiagnostic(d: SrcDiagnostic, filepath: string): Diagnostic {
  // if the source is 'json', show that for the code (since code will often just be a single numbeer, which isn't very
  // useful); otherwise, unwrap it
  const code = d.source === 'json' ? d.source : d.code;
  return {
    path: filepath,
    // return 1-based line/column for human readability
    line: d.range.start.line + 1,
    column: d.range.start.character + 1,
    // severity is technically optional, although FileTemplateValidator will always set it currently
    severity: d.severity ? mapSeverity(d.severity) : 'info',
    code: typeof code === 'string' || typeof code === 'number' ? `${code}` : d.source,
    message: d.message
  };
}

function mapSeverity(s: SrcDiagnosticSeverity): Severity {
  switch (s) {
    case SrcDiagnosticSeverity.Error:
      return 'error';
    case SrcDiagnosticSeverity.Warning:
      return 'warning';
    case SrcDiagnosticSeverity.Hint:
      return 'hint';
    case SrcDiagnosticSeverity.Information:
    default:
      return 'info';
  }
}

function includeDiagnostic(d: Diagnostic, includeInfos: boolean, includeHints: boolean): boolean {
  if (!includeInfos && d.severity === 'info') {
    return false;
  } else if (!includeHints && d.severity === 'hint') {
    return false;
  }
  return true;
}

// the colors for the column values
const COLORS = {
  // these seem to line up with what tsc (typescript compiler) does
  path: chalk.cyanBright,
  line: chalk.yellow,
  column: chalk.yellow,
  code: chalk.grey,
  severity: (s: Severity | string): Chalk | undefined => {
    switch (s) {
      case 'error':
        return chalk.redBright;
      case 'warning':
        return chalk.yellowBright;
      case 'info':
        return chalk.blue;
      default:
        return undefined;
    }
  }
};

export default class Validate extends SfdxCommand {
  public static description = messages.getMessage('validateCommandDescription');
  public static longDescription = messages.getMessage('validateCommandLongDescription');

  public static examples = [
    '$ sfdx analytics:template:validate -p waveTemplates/mytemplate',
    '$ sfdx analytics:template:validate -p waveTemplates/mytemplate --strict --includeinfos --flatoutput'
  ];

  protected static flagsConfig = {
    sourcepath: flags.filepath({
      char: 'p',
      description: messages.getMessage('sourcepathFlagDescription'),
      longDescription: messages.getMessage('sourcepathFlagLongDescription'),
      required: true
    }),
    strict: flags.boolean({
      description: messages.getMessage('strictFlagDescription'),
      longDescription: messages.getMessage('strictFlagLongDescription'),
      default: false
    }),
    includeinfos: flags.boolean({
      description: messages.getMessage('includeinfosDescription'),
      longDescription: messages.getMessage('includeinfosLongDescription'),
      default: false
    }),
    includehints: flags.boolean({
      description: messages.getMessage('includehintsDescription'),
      longDescription: messages.getMessage('includehintsLongDescription'),
      default: false
    }),
    fullpaths: flags.boolean({
      description: messages.getMessage('fullpathsDescription'),
      longDescription: messages.getMessage('fullpathsLongDescription'),
      default: false
    }),
    flatoutput: flags.boolean({
      description: messages.getMessage('flatoutputDescription'),
      longDescription: messages.getMessage('flatoutputLongDescription'),
      default: false
    }),
    nocolors: flags.boolean({
      description: messages.getMessage('nocolorsDescription'),
      longDescription: messages.getMessage('nocolorsLongDescription'),
      default: false
    }),
    nojsonschema: flags.boolean({
      description: messages.getMessage('nojsonschemaDescription'),
      longDescription: messages.getMessage('nojsonschemaLongDescription'),
      default: false
    }),
    nocodeframes: flags.boolean({
      description: messages.getMessage('nocodeframesDescription'),
      longDescription: messages.getMessage('nocodeframesLongDescription'),
      default: false
    })
  };

  protected static requiresUsername = false;
  protected static requiresProject = false;

  public async run() {
    // figure out the path to the template-info.json
    let templateInfoPath = this.flags.sourcepath as string;
    let stat = await pathstat(templateInfoPath);
    if (stat) {
      if (stat.isDirectory()) {
        // if they sent in a directory that exists, point to the template-info.json
        templateInfoPath = path.join(templateInfoPath, 'template-info.json');
        stat = await pathstat(templateInfoPath);
      } else {
        throw new SfdxError(messages.getMessage('sourcepathNotDirectory', [templateInfoPath]));
      }
    }
    // TODO: if they send in a path to a template-info.json file, use that.
    // To do this and correctly deal w/ filesystem case-(in)sensitivity, we need to able to check if 2 paths point to
    // the same file; to do that, we need the bigint version of fs.stat().ino from node 10+, which we're not certain to
    // be running on yet in sfdx

    if (!stat) {
      throw new SfdxError(messages.getMessage('sourcepathNotExists', [templateInfoPath]));
    } else if (!stat.isFile()) {
      throw new SfdxError(messages.getMessage('sourcepathNotFile', [templateInfoPath]));
    }

    const validator = new FileTemplateValidator(await FileTemplateValidator.createTextDocument(templateInfoPath), {
      validateSchemas: !this.flags.nojsonschema
    });
    await validator.lint();
    const results = processDiagnostics(validator, {
      includeCodeFrames: !this.flags.json && !!this.flags.flatoutput && !this.flags.nocodeframes,
      includeHints: !!this.flags.includehints,
      includeInfos: !!this.flags.includeinfos,
      fullpaths: !!this.flags.fullpaths
    });

    if (this.flags.flatoutput) {
      results.diagnostics.forEach(d => this.logDiagnostic(d));
    } else {
      this.ux.table(
        results.diagnostics.map(d => {
          // values need to be strings for ux.table
          return {
            ...d,
            line: `${d.line}`,
            column: `${d.column}`
          };
        }),
        {
          columns: [
            { key: 'path', label: messages.getMessage('pathColumnLabel'), format: v => this.colorize(v, COLORS.path) },
            { key: 'line', label: messages.getMessage('lineColumnLabel'), format: v => this.colorize(v, COLORS.line) },
            {
              key: 'column',
              label: messages.getMessage('columnColumnLabel'),
              format: v => this.colorize(v, COLORS.column)
            },
            {
              key: 'severity',
              label: messages.getMessage('severityColumnLabel'),
              format: v => this.colorize(v, COLORS.severity(v))
            },
            { key: 'code', label: messages.getMessage('codeColumnLabel'), format: v => this.colorize(v, COLORS.code) },
            { key: 'message', label: messages.getMessage('messageColumnLabel') }
          ]
        }
      );
    }

    this.ux.log(
      `Found ${results.numErrors} error${results.numErrors !== 1 ? 's' : ''}, ${results.numWarnings} warning${
        results.numWarnings !== 1 ? 's' : ''
      }.`
    );

    let exitCode = results.numErrors;
    if (this.flags.strict) {
      exitCode += results.numWarnings;
    }

    if (exitCode > 0) {
      const error = new SfdxError(messages.getMessage('validationFailed'));
      error.exitCode = exitCode;
      error.setData(results);
      throw error;
    }
    return results;
  }

  private colorize(s: string, color: Chalk | undefined): string {
    return !this.flags.nocolors && color && process.platform !== 'win32' ? color(s) : s;
  }

  private logDiagnostic(d: Diagnostic) {
    // This is a similar format to what tsc writes out.
    this.ux.log(
      `${this.colorize(d.path, COLORS.path)}:${this.colorize(`${d.line}`, COLORS.line)}:${this.colorize(
        `${d.column}`,
        COLORS.column
      )} - ${this.colorize(d.severity, COLORS.severity(d.severity))} (${this.colorize(d.code || '', COLORS.code)}): ${
        d.message
      }`
    );
    if (d.codeFrame) {
      this.ux.log(d.codeFrame + EOL);
    }
  }
}
