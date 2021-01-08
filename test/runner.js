const assert = require('assert');
const fs = require('fs');
const path = require('path');
const specMarkdown = require('../');

const shouldRecord = Boolean(process.env.RECORD);

runTests([
  ['../README.md', 'readme/ast.json', 'readme/output.html'],
  ['graphql-spec/GraphQL.md', 'graphql-spec/ast.json', 'graphql-spec/output.html'],
  ['simple-header/input.md', 'simple-header/ast.json', 'simple-header/output.html'],
  ['sections/input.md', 'sections/ast.json', 'sections/output.html'],
  ['tables/input.md', 'tables/ast.json', 'tables/output.html'],
  ['task-lists/input.md', 'task-lists/ast.json', 'task-lists/output.html'],
  ['escape-sequence/input.md', 'escape-sequence/ast.json', 'escape-sequence/output.html'],
  ['duplicated-notes/input.md', 'duplicated-notes/ast.json', 'duplicated-notes/output.html'],
  ['productions/input.md', 'productions/ast.json', 'productions/output.html'],
]);

async function runTests(tests) {
  for (const [input, ast, html] of tests) {
    try {
      await runTest(input, ast, html);
    } catch (error) {
      process.exitCode = 1
      if (error.code === 'ERR_ASSERTION') {
        process.stderr.write('\n' + error.message + '\n\n');
        if (!error.expected) {
          process.stderr.write('\nNo recorded output found to compare to.\n\n');
        } else {
          const jestDiff = require('jest-diff').default;
          process.stderr.write(
            jestDiff(error.actual, error.expected, { expand: false }) + '\n\n'
          );
        }
      } else {
        process.stderr.write('\n\n' + String(error && error.stack || error) + '\n\n');
      }
    }
  }
}

async function runTest(input, ast, html) {
  const start = Date.now();
  process.stdout.write(`testing: ${input} ... `);
  const actualAST = await specMarkdown.parse(path.resolve(__dirname, input))

  try {
    const expectedAST = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, ast), 'utf8')
    );
    assert.deepEqual(
      actualAST,
      expectedAST,
      'Did not parse expected AST.\n\n' +
        'If confident the changes are correct, rerun with RECORD set:\n' +
        '  $ RECORD=1 yarn test'
    );
  } catch (error) {
    if (error.code === 'ERR_ASSERTION' && shouldRecord) {
      fs.writeFileSync(
        path.resolve(__dirname, ast),
        JSON.stringify(actualAST, null, 2)
      );
    } else {
      throw error;
    }
  }

  // Print HTML after testing AST since it memoizes values in the AST.
  const actualHTML = await specMarkdown.print(actualAST);
  try {
    const expectedHTML = fs.readFileSync(path.resolve(__dirname, html), 'utf8');
    assert.equal(
      actualHTML,
      expectedHTML,
      'Did not print expected HTML.\n\n' +
        'If confident the changes are correct, rerun with RECORD set:\n' +
        '  $ RECORD=1 yarn test'
    );
  } catch (error) {
    if (error.code === 'ERR_ASSERTION' && shouldRecord) {
      fs.writeFileSync(path.resolve(__dirname, html), actualHTML);
    } else {
      throw error;
    }
  }

  process.stdout.write(`DONE (${Date.now() - start}ms) \n`);
}
