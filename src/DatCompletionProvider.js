const vscode = require('vscode');
const getKeywordsFromYaml = require('./getKeywordsFromYaml');

class DatCompletionProvider {
    provideCompletionItems(document, position, token, context) {
        // Don't trigger completions if outside `set forte { ... }` block
        const braceContentPattern = /(set\s+forte\s*\{[^}]*\})/gmi;
        const documentText = document.getText();

        let matchFound = false;
        let match;
        while ((match = braceContentPattern.exec(documentText)) !== null) {
            const start = document.positionAt(match.index);
            const end = document.positionAt(match.index + match[0].length);

            if (position.isAfterOrEqual(start) && position.isBeforeOrEqual(end)) {
                matchFound = true;
                break;
            }
        }

        if (!matchFound) {
            return undefined;
        }

        // Don't trigger completions if a complete word exists prior to the cursor
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        const numPrefixWords = linePrefix.trim().split(/\s+/).length;

        if (numPrefixWords > 1) {
            return undefined;
        }

        const keywords = getKeywordsFromYaml();

        if (keywords[0] === null) {
            vscode.window.showErrorMessage(`Invalid Forte options.yaml file path: ${keywords[1]}`, 'Add path to Forte options.yaml')
                .then(() => {
                    vscode.commands.executeCommand('extension.flSettings');
                });
        }

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