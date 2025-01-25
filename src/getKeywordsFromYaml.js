const vscode = require('vscode');
const yaml = require('js-yaml');
const fs = require('fs');
const os = require('os');
const path = require('path');

function getKeywordsFromYaml() {
    const config = vscode.workspace.getConfiguration('extension');
    const yamlFilePath = path.join(os.homedir(), config.get('configYamlFilePath'));

    // Check if Forte options.yaml file path is valid
    if (!fs.existsSync(yamlFilePath)) {
        return [null, yamlFilePath];
    }

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
        return [['error', '', '', `${error}`]];
    }
}

module.exports = getKeywordsFromYaml;