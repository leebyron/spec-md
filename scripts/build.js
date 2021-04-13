const { execSync } = require('child_process');
const fs = require('fs');

function exec(cmd) {
  console.log('> ' + cmd)
  execSync(cmd)
}

const clientPaths = fs.readdirSync('src/client').map(path => 'src/client/' + path);
exec(`esbuild ${clientPaths.join(' ')} --minify --format=iife --target=es5 --outdir=src/generated`);
exec(`pegjs --allowed-start-rules initialDocument,importedDocument --output src/generated/grammar.js src/grammar.pegjs`);
