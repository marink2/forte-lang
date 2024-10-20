const vscode = require('vscode');

class DatCompletionProvider {
    provideCompletionItems(document, position, token, context) {
        const keywords = [
            ['avas', 'type: bool', 'default: false', 'help: "Form AVAS orbitals?"'],
            ['avg_state', 'type: list', 'default: []', 'help: "A list of integer triplets that specify the irrep, multiplicity, and the number of states requested. Uses the format [[irrep1, multi1, nstates1], [irrep2, multi2, nstates2], ...]."']
        ];

        // Convert keywords into completion items
        const completionItems = keywords.map(keyword => {
            const item = new vscode.CompletionItem(keyword[0], vscode.CompletionItemKind.Keyword);
            item.detail = keyword[3];
            item.documentation = keyword[1] + "\n" + keyword[2];

            return item;
        });

        return completionItems;
    }
}

function activate(context) {
    const provider = new DatCompletionProvider();
    const providerDisposable = vscode.languages.registerCompletionItemProvider({ language: 'dat' }, provider, '.');
    context.subscriptions.push(providerDisposable);
}

function deactivate() {
}

module.exports = {
    activate,
    deactivate
};
