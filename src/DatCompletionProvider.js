const vscode = require('vscode');
const getKeywordsFromYaml = require('./getKeywordsFromYaml');

class DatCompletionProvider {
    provideCompletionItems(document, position, token, context) {
        const keywords = getKeywordsFromYaml();

        // Convert keywords into completion items
        const completionItems = keywords.map(keyword => {
            const item = new vscode.CompletionItem(keyword[0], vscode.CompletionItemKind.Keyword);
            item.detail = keyword[3];

            if (keyword[4] === "choices: undefined") {
                item.documentation = keyword[1] + "\n" + keyword[2];
            } else {
                item.documentation = keyword[1] + "\n" + keyword[2] + "\n" + keyword[4];
            }

            return item;
        });

        return completionItems;
    }
}

module.exports = DatCompletionProvider;