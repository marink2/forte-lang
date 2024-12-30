const vscode = require('vscode');
const getKeywordsFromYaml = require('./getKeywordsFromYaml');

class DatHoverProvider {
    provideHover(document, position, token) {
        const keywords = getKeywordsFromYaml();
        const wordRange = document.getWordRangeAtPosition(position);

        // Don't trigger hover if outside set forte { ... } block
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

        const hoveredWord = document.getText(wordRange).toLowerCase();

        // Find if the hovered word matches a keyword
        const matchedKeyword = keywords.find(keyword => keyword[0] === hoveredWord);

        if (matchedKeyword) {
            // Create hover content using MarkdownString
            let hoverText = new vscode.MarkdownString();
            hoverText.appendMarkdown(`**Option**: ${matchedKeyword[0]}\n\n`);
            hoverText.appendMarkdown(`${matchedKeyword[1]}, ${matchedKeyword[2]}\n\n`);
            hoverText.appendMarkdown(`${matchedKeyword[3]}\n`);

            if (matchedKeyword[4] !== "choices: undefined") {
                hoverText.appendMarkdown(`\n${matchedKeyword[4]}\n`);
            }

            return new vscode.Hover(hoverText);
        }

        return null;
    }
}

module.exports = DatHoverProvider;