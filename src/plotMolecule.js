const vscode = require('vscode');
const fs = require('fs');

function plotMolecule(text, extensionUri) {
    // Parse molecule data
    const molecule = parseMolecule(text);

    // Show the Three.js visualization in a webview
    const panel = vscode.window.createWebviewPanel(
        'moleculeViewer',
        'Molecule Viewer',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );
    // Prepare the webview content
    const scriptUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'src', 'scriptMolecule.js')
    );
    panel.webview.html = getWebviewContent(molecule, scriptUri);
}

const atom = {
    'H': 1,
    'h': 1,
    '1': 1,

    'C': 6,
    'c': 6,
    '6': 6,

    'N': 7,
    'n': 7,
    '7': 7,

    'O': 8,
    'o': 8,
    '8': 8,

    'F': 9,
    'f': 9
};

function parseMolecule(data) {
    const lines = data.trim().split('\n');
    return lines.map(line => {
        const [Z, x, y, z] = line.split(/\s+/);
        return [atom[Z], parseFloat(x), parseFloat(y), parseFloat(z)];
    });
}

function getWebviewContent(molecule, scriptUri) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                margin: 0;
            }
        </style>
        <title>Orbital Plots</title>
    </head>

    <body></body>

    <canvas id="c"></canvas>
    <script type="importmap" >{
        "imports": {
            "three": "https://threejs.org/build/three.module.js",
            "three/addons/": "https://threejs.org/examples/jsm/"
        }
    }</script>
    <script>
        window.molecule = ${JSON.stringify(molecule)};
    </script>
    <script type="module" src="${scriptUri}"></script>
    </html>`;
}

module.exports = plotMolecule;