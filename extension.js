const vscode = require('vscode');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

function getKeywordsFromYaml() {
    const yamlFilePath = path.join(__dirname, 'options.yaml');

    try {
        const fileContents = fs.readFileSync(yamlFilePath, 'utf8');
        const parsedYaml = yaml.load(fileContents);

        // Convert the parsed YAML to keyword format
        const keywords = [];

        // Iterate over the top-level keys
        Object.keys(parsedYaml).forEach(topLevelKey => {
            const secondLevelEntries = parsedYaml[topLevelKey];

            // For each second-level key
            Object.keys(secondLevelEntries).forEach(secondLevelKey => {
                const entry = secondLevelEntries[secondLevelKey];
                // Push the second-level key and its properties into the keywords array
                keywords.push([
                    secondLevelKey.toLowerCase(),
                    `type: ${entry.type}`,
                    `default: ${entry.default}`,
                    `${entry.help}`,
                    `choices: ${entry.choices}`
                ]);
            });
        });

        return keywords;
    } catch (error) {
        console.error('Error reading or parsing the YAML file:', error);
        return [['error']];
    }
}

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

class DatHoverProvider {
    provideHover(document, position, token) {
        const keywords = getKeywordsFromYaml();
        const wordRange = document.getWordRangeAtPosition(position);
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

function formatTextInsideBraces(text) {
    // Match 'set { ... }' or 'set forte { ... }' blocks
    const braceContentPattern = /(set\s+forte\s*\{[^}]*\}|set\s*\{[^}]*\})/gmi;

    return text.replace(braceContentPattern, (match) => {
        // Extract the content inside the braces
        const braceContent = match.match(/\{([^}]*)\}/m)[1];
        const lines = braceContent.split('\n').map(line => line.trim());

        // Format [ [word1], [word2, word3, ...] ] pairs
        const formattedLines = lines.map(line => {
            if (line === '') { return '' }
            const [key, ...rest] = line.split(/\s+/);
            const value = rest.join(' ');

            // Format spacing
            return `  ${key}${' '.repeat(Math.max(1, 60 - key.length))}${value}`;
        });

        // Reconstruct the block with formatted lines
        return match.replace(braceContent, `${formattedLines.join('\n')}`);
    });
}

class DatDocumentFormatter {
    provideDocumentFormattingEdits(document) {
        const edits = [];
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );
        const text = document.getText();

        const formattedText = formatTextInsideBraces(text);

        edits.push(vscode.TextEdit.replace(fullRange, formattedText));

        return edits;
    }
}

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