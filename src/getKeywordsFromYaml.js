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

module.exports = getKeywordsFromYaml;