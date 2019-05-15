const { readFileSync, writeFileSync } = require('fs');
const distPath = './dist';
const srcPath = './src';

const webpack_output = readFileSync(distPath + '/index.html', { encoding: 'utf-8' });

const scripts = webpack_output.split('src=').slice(1).map(scriptChunk => {
  const jsPath = scriptChunk.split('></script>')[0];
  console.log(`Loading scripts from: ${jsPath}\n\n`);
  return readFileSync(distPath + jsPath, { encoding: 'utf-8' });
}).join('\n\t');

const css = webpack_output.split('<link href=').slice(1).map(linkChunk => {
  const cssPath = linkChunk.split(' rel=stylesheet>')[0];
  console.log(`loading styles from: ${cssPath}\n\n`);
  return readFileSync(distPath + cssPath, { encoding: 'utf-8' });
}).join('\n\n');

const baseHtml =
`<!DOCTYPE html>
<html>
    <head>
        <meta charset=utf-8>
        <title>Floorspace JS</title>
        <style>
            ${css}
        </style>
    </head>

    <body>
        <div id=app></div>
`;
const standaloneHtml = baseHtml + `
    <script>${scripts}</script>
    </body>
</html>`

writeFileSync(distPath + '/standalone_geometry_editor.html', standaloneHtml);
console.log(`Loading floorspace.js API script from: ${srcPath + '/api.js'}\n\n`);
const apiScripts = readFileSync(srcPath + '/api.js', { encoding: 'utf-8' });
const lodash = readFileSync('./node_modules/lodash/lodash.min.js', { encoding: 'utf-8' });

const embeddableHtml = baseHtml + `
    <script>
        ${lodash}
    </script>
    <script>
      window.startApp = function() {
        ${scripts}
      }
    </script>
    <script> ${apiScripts} </script>
    </body>
</html>`;

writeFileSync(distPath + '/embeddable_geometry_editor.html', embeddableHtml);
