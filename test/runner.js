const assert = require('assert');
const fs = require('fs');
const path = require('path');
const specMarkdown = require('../');

const shouldRecord = Boolean(process.env.RECORD);

runTests([['../README.md', 'readme/ast.json', 'readme/output.html']]);

async function runTests(tests) {
  try {
    for (let [input, ast, html] of tests) {
      await runTest(input, ast, html);
    }
  } catch (error) {
    if (error.code === 'ERR_ASSERTION') {
      process.stderr.write('\n' + error.message + '\n');
      if (!error.expected) {
        process.stderr.write('\nNo recorded output found to compare to.\n\n');
      } else {
        const jestDiff = require('jest-diff');
        process.stderr.write(
          jestDiff(error.actual, error.expected, { expand: false })
        );
      }
    } else {
      process.stderr.write(error);
    }
  }
}

function runTest(input, ast, html) {
  const start = Date.now();
  process.stdout.write(`testing: ${input} ... `);
  return specMarkdown.parse(path.resolve(__dirname, input)).then(actualAST => {
    // Read expected snapshot files.
    let expectedAST;
    let expectedHTML;
    try {
      expectedAST = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, ast), 'utf8')
      );
      expectedHTML = fs.readFileSync(path.resolve(__dirname, html), 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
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
      if (shouldRecord) {
        fs.writeFileSync(
          path.resolve(__dirname, ast),
          JSON.stringify(actualAST, null, 2)
        );
      } else {
        throw error;
      }
    }

    // Print HTML after testing AST since it memoizes values in the AST.
    const actualHTML = specMarkdown.print(actualAST);
    try {
      assert.equal(
        actualHTML,
        expectedHTML,
        'Did not print expected HTML.\n\n' +
          'If confident the changes are correct, rerun with RECORD set:\n' +
          '  $ RECORD=1 yarn test'
      );
    } catch (error) {
      if (shouldRecord) {
        fs.writeFileSync(
          path.resolve(__dirname, ast),
          JSON.stringify(actualAST, null, 2)
        );
        if (actualHTML) {
          fs.writeFileSync(path.resolve(__dirname, html), actualHTML);
        }
      } else {
        throw error;
      }
    }

    process.stdout.write(`DONE (${Date.now() - start}ms) \n`);
  });
}
