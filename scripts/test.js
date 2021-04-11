const assert = require('assert');
const fs = require('fs');

const specMarkdown = require('../');

const shouldRecord = Boolean(process.env.RECORD);

function testSource(dir, input, options) {
  return [input || `test/${dir}/input.md`, `test/${dir}/ast.json`, `test/${dir}/output.html`, options];
}

runTests([
  testSource('duplicated-notes'),
  testSource('escape-sequence'),
  testSource('graphql-spec', 'test/graphql-spec/GraphQL.md'),
  testSource('productions'),
  testSource('readme', 'README.md'),
  testSource('sections'),
  testSource('simple-header'),
  testSource('smart-quotes'),
  testSource('tables'),
  testSource('task-lists'),
]);

function runTests(tests) {
  for (const [input, ast, html, options] of tests) {
    try {
      runTest(input, ast, html, options);
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

function runTest(input, ast, html, options) {
  const start = Date.now();
  process.stdout.write(`testing: ${input} ... `);

  const actualAST = specMarkdown.parse(input)
  let expectedAST
  try {
    expectedAST = JSON.parse(fs.readFileSync(ast, 'utf8'));
  } catch (_) {
    // Ignore FS or parse error
  }

  try {
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
  const actualHTML = specMarkdown.print(actualAST, options);
  let expectedHTML
  try {
    // Normalize line endings
    expectedHTML = fs.readFileSync(html, 'utf8').replace(/\r\n|\n|\r/g, '\n');
  } catch (_) {
    // Ignore FS error
  }

  try {
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
