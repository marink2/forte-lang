const vscode = require('vscode');
const DatCompletionProvider = require('./DatCompletionProvider');
const DatHoverProvider = require('./DatHoverProvider');
const DatDocumentFormatter = require('./DatDocumentFormatter');
const plotOrbitals = require('./plotOrbitals');
const fs = require('fs');
const path = require('path');

function activate(context) {

    const autoCompletion = new DatCompletionProvider();
    const autoCompletionDisposable = vscode.languages.registerCompletionItemProvider({ language: 'dat' }, autoCompletion, '.');
    context.subscriptions.push(autoCompletionDisposable);

    const hover = new DatHoverProvider();
    const hoverDisposable = vscode.languages.registerHoverProvider({ language: 'dat' }, hover);
    context.subscriptions.push(hoverDisposable);

    const formatter = new DatDocumentFormatter();
    const formatterDisposable = vscode.languages.registerDocumentFormattingEditProvider({ language: 'dat' }, formatter);
    context.subscriptions.push(formatterDisposable);




    const extensionUri = context.extensionUri;
    const iconPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'OrbPlotterIcon.svg'));

    let orbitalPlotDisposable = vscode.commands.registerCommand('extension.plotOrbitals', async () => {
        try {
            // Open a directory selection dialog
            const selectedFolder = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: 'Open Cube Folder',
            });

            if (!selectedFolder || selectedFolder.length === 0) {
                vscode.window.showErrorMessage("No folder selected. Please select a directory containing .cube files.");
                return;
            }

            // Get the selected folder path
            const folderPath = selectedFolder[0].fsPath;
            const folderName = folderPath.split('/').pop();

            // Read all files in the directory
            const files = fs.readdirSync(folderPath);

            // Filter .cube files
            const cubeFiles = files
                .filter(file => file.endsWith('.cube'))
                .map(file => path.join(folderPath, file));

            if (cubeFiles.length === 0) {
                vscode.window.showErrorMessage("No .cube files found in the selected directory.");
                return;
            }

            plotOrbitals(cubeFiles, extensionUri, folderName, iconPath);

        } catch (err) {
            vscode.window.showErrorMessage(`Error selecting directory: ${err.message}`);
        }
    });

    context.subscriptions.push(orbitalPlotDisposable);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};
