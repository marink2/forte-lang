const vscode = require('vscode');
const DatCompletionProvider = require('./DatCompletionProvider');
const DatHoverProvider = require('./DatHoverProvider');
const DatDocumentFormatter = require('./DatDocumentFormatter');

function activate(context) {
    const provider = new DatCompletionProvider();
    const providerDisposable = vscode.languages.registerCompletionItemProvider({ language: 'dat' }, provider, '.');
    context.subscriptions.push(providerDisposable);

    const hoverProvider = new DatHoverProvider();
    const hoverProviderDisposable = vscode.languages.registerHoverProvider({ language: 'dat' }, hoverProvider);
    context.subscriptions.push(hoverProviderDisposable);

    const formatter = new DatDocumentFormatter();
    const disposable = vscode.languages.registerDocumentFormattingEditProvider({ language: 'dat' }, formatter);
    context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};