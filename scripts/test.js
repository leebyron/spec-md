const assert = require('assert');
const fs = require('fs');

const specMarkdown = require('../');

const shouldRecord = Boolean(process.env.RECORD);

runTests([
  ['README.md', 'test/readme/ast.json', 'test/readme/output.html'],
  ['test/graphql-spec/GraphQL.md', 'test/graphql-spec/ast.json', 'test/graphql-spec/output.html'],
  ['test/simple-header/input.md', 'test/simple-header/ast.json', 'test/simple-header/output.html'],
  ['test/sections/input.md', 'test/sections/ast.json', 'test/sections/output.html'],
  ['test/tables/input.md', 'test/tables/ast.json', 'test/tables/output.html'],
  ['test/task-lists/input.md', 'test/task-lists/ast.json', 'test/task-lists/output.html'],
  ['test/escape-sequence/input.md', 'test/escape-sequence/ast.json', 'test/escape-sequence/output.html'],
  ['test/duplicated-notes/input.md', 'test/duplicated-notes/ast.json', 'test/duplicated-notes/output.html'],
  ['test/productions/input.md', 'test/productions/ast.json', 'test/productions/output.html'],
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
            jestDiff(error.expected, error.actual, { expand: false }) + '\n\n'
          );
        }
      } else {
        process.stderr.write(
          '\n\n' +
          String(error.location ? error.message : (error.stack || error)) +
          '\n\n'
        );
      }
    }
  }
}

async function runTest(input, ast, html) {
  const start = Date.now();
  process.stdout.write(`testing: ${input} ... `);
  const actualAST = await specMarkdown.parse(input)

  try {
    const expectedAST = JSON.parse(fs.readFileSync(ast, 'utf8'));
    assert.deepEqual(
      actualAST,
      expectedAST,
      'Did not parse expected AST.\n\n' +
        'If confident the changes are correct, rerun with RECORD set:\n' +
        '  $ RECORD=1 yarn test'
    );
  } catch (error) {
    if (error.code === 'ERR_ASSERTION' && shouldRecord) {
      fs.writeFileSync(ast, JSON.stringify(actualAST, null, 2));
    } else {
      throw error;
    }
  }

  // Print HTML after testing AST since it memoizes values in the AST.
  const actualHTML = await specMarkdown.print(actualAST);

  try {
    // Normalize line endings
    const expectedHTML = fs.readFileSync(html, 'utf8').replace(/\r\n|\n|\r/g, '\n');
    assert.strictEqual(
      actualHTML,
      expectedHTML,
      'Did not print expected HTML.\n\n' +
        'If confident the changes are correct, rerun with RECORD set:\n' +
        '  $ RECORD=1 npm test'
    );
  } catch (error) {
    if (error.code === 'ERR_ASSERTION' && shouldRecord) {
      fs.writeFileSync(html, actualHTML);
    } else {
      throw error;
    }
  }

  process.stdout.write(`DONE (${Date.now() - start}ms) \n`);
}
