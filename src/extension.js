const vscode = require('vscode');
const DatCompletionProvider = require('./DatCompletionProvider');
const DatHoverProvider = require('./DatHoverProvider');
const DatDocumentFormatter = require('./DatDocumentFormatter');

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
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};