const vscode = require('vscode');

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
            // Do not reformat commented lines
            if (line[0] === '#') { return `  ${line}` }
            const [key, ...rest] = line.split(/\s+/);
            const value = rest.join(' ');

            // Format spacing
            return `  ${key}${' '.repeat(Math.max(1, 40 - key.length))}${value}`;
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

module.exports = DatDocumentFormatter;