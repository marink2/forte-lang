const vscode = require('vscode');
const fs = require('fs');

function plotOrbitals(cubeFiles, extensionUri, folderName, iconPath) {
    const panel = vscode.window.createWebviewPanel(
        'OrbPlotter',
        folderName,
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    panel.iconPath = iconPath;

    // Show a progress notification while loading the data
    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Orbital Plotter",
            cancellable: false
        },
        async (progress) => {
            try {
                // Update progress message (optional, useful for long tasks)
                progress.report({ message: "Reading .cube files..." });

                // Read all .cube files and parse them
                const allCubeData = await Promise.all(
                    cubeFiles.map((cubeFile) =>
                        fs.promises.readFile(cubeFile, 'utf8').then(parseCubeFile)
                    )
                );

                progress.report({ message: "Rendering orbitals..." });

                // Prepare the webview content
                const scriptUri = panel.webview.asWebviewUri(
                    vscode.Uri.joinPath(extensionUri, 'src', 'scriptOrbitals.js')
                );
                panel.webview.html = getWebviewContent(allCubeData, scriptUri);

                // Finish progress
                progress.report({ message: "Done!" });
            } catch (err) {
                vscode.window.showErrorMessage(`Failed to read .cube files: ${err.message}`);
            }
        }
    );
}



function parseCubeFile(cFileData) {
    const lines = cFileData.split("\n");
    const numAtoms = parseInt(lines[2].trim().split(/\s+/)[0], 10);
    const atomLines = [];

    const startLine = 6;
    for (let i = startLine; i < startLine + numAtoms; i++) {
        const words = lines[i].trim().split(/\s+/);
        words.splice(1, 1);

        const temp = words.map(word => parseFloat(word));
        atomLines.push(temp);
    }

    const origin = lines[2].trim().split(/\s+/).map(parseFloat);

    const numVoxelX = parseInt(lines[3].trim().split(/\s+/)[0], 10);
    const numVoxelY = parseInt(lines[4].trim().split(/\s+/)[0], 10);
    const numVoxelZ = parseInt(lines[5].trim().split(/\s+/)[0], 10);

    const sizeVoxelX = parseFloat(lines[3].trim().split(/\s+/)[1]);
    const sizeVoxelY = parseFloat(lines[4].trim().split(/\s+/)[2]);
    const sizeVoxelZ = parseFloat(lines[5].trim().split(/\s+/)[3]);

    const density = [];
    let totAbsDensity = 0;
    for (let i = 6 + numAtoms; i < lines.length; i++) {
        const values = lines[i].trim().split(/\s+/); // Split the trimmed line into an array of strings
        values.forEach(j => {
            const d = parseFloat(j); // Parse each string as a floating-point number
            density.push(d); // Add to the density array
            totAbsDensity += Math.abs(d); // Accumulate the absolute value
        });
    }

    const voxelVectors = [];
    for (let i = 0; i < numVoxelX; i++) {
        for (let j = 0; j < numVoxelY; j++) {
            for (let k = 0; k < numVoxelZ; k++) {
                const voxelX = (i * sizeVoxelX + 0.5 * sizeVoxelX) + origin[1];
                const voxelY = (j * sizeVoxelY + 0.5 * sizeVoxelY) + origin[2];
                const voxelZ = (k * sizeVoxelZ + 0.5 * sizeVoxelZ) + origin[3];

                const p = k + numVoxelZ * j + numVoxelZ * numVoxelY * i; // position of density corresponding to this voxel

                voxelVectors.push([voxelX, voxelY, voxelZ, density[p]]);
            }
        }
    }

    // Sort the voxel vectors by the absolute value each voxel vector fourth index (density)
    // voxelVectors = [voxelVector1, voxelVector2, ...] where voxelVectorN = [voxel_x, voxel_y, voxel_z, density]
    voxelVectors.sort((a, b) => Math.abs(b[3]) - Math.abs(a[3]));

    const orbVoxels = [];
    let orbDensity = 0;

    for (let v = 0; v < voxelVectors.length; v++) {
        orbDensity += Math.abs(voxelVectors[v][3]);

        // Break when the condition is met
        if (orbDensity > 0.6 * totAbsDensity) {
            break;
        }

        // Skip if below the threshold
        if (orbDensity < 0.0 * totAbsDensity) {
            continue;
        }

        // Add voxel to orbVoxels if within the range
        orbVoxels.push(voxelVectors[v]);
    }

    const label = lines[1].trim().split(/\s+/)[1].split("_").slice(-1)[0].slice(0, -1);

    const cubeFileData = [atomLines, orbVoxels, label];
    return cubeFileData;
}


function getWebviewContent(allCubeData, scriptUri) {
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
        window.allCubeData = ${JSON.stringify(allCubeData)};
    </script>
    <script type="module" src="${scriptUri}"></script>
    </html>`;
}

module.exports = plotOrbitals;