const { execSync } = require('child_process');
const fs = require('fs');
const { join, extname } = require('path');

const clientPath = join('src','client')
const generatedPath = join('src', 'generated');

function exec(cmd) {
  console.log('> ' + cmd)
  execSync(cmd)
}

if (!fs.existsSync(generatedPath)) {
  fs.mkdirSync(generatedPath);
}

exec(`pegjs --allowed-start-rules initialDocument,importedDocument --output ${join(generatedPath, 'grammar.js')} ${join('src','grammar.pegjs')}`)

for (const file of fs.readdirSync(clientPath)) {
  if (extname(file) === '.js') {
    exec(`terser -cm --toplevel ${join(clientPath, file)} > ${join(generatedPath, file)}`)
  }
}
