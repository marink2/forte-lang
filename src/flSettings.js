const vscode = require('vscode');
const os = require('os');

async function flSettings() {
    // Options to configure
    const options = [
        'Autocomplete: change Forte options.yaml file path',
        'Formatting: change option-value spacing',
        'Formatting: change option indentation',
        'Productivity: change timer start time',
    ];

    const selection = await vscode.window.showQuickPick(options, {
        placeHolder: 'configure forte-lang settings',
    });

    // Configure new Forte options.yaml file path
    if (selection === options[0]) {
        const yamlPath = await vscode.window.showInputBox({
            prompt: 'Enter Forte options.yaml file path',
            placeHolder: `${os.homedir()} ... add/path/to/forte/options.yaml`,
            validateInput: (input) => (input.trim() === '' ? 'Path cannot be empty' : null),
        });

        if (yamlPath) {
            vscode.workspace.getConfiguration().update('extension.configYamlFilePath', yamlPath, true);
            vscode.window.showInformationMessage(`Forte options.yaml file path set to: ${os.homedir()}/${yamlPath}`);
        }
    }

    // Configure new formatter option-value spacing
    if (selection === options[1]) {
        const formatterSpacing = await vscode.window.showInputBox({
            prompt: 'Enter option-value spacing',
            placeHolder: 'Positive integer value (e.g., 40)',
            validateInput: (input) => {
                if (input.trim() === '') {
                    return 'Value cannot be empty';
                }
                const number = parseInt(input, 10);
                if (isNaN(number) || number <= 0) {
                    return 'Value must be a positive integer';
                }
                if (number >= 200) {
                    return 'Value is too large';
                }
                return null;
            },
        });

        if (formatterSpacing) {
            const spacingValue = parseInt(formatterSpacing, 10);
            vscode.workspace.getConfiguration().update('extension.configFormatterSpacing', spacingValue, true);
            vscode.window.showInformationMessage(`Formatter option-value spacing set to: ${spacingValue}`);
        }
    }

    // Configure new formatter option indentation
    if (selection === options[2]) {
        const formatterIndent = await vscode.window.showInputBox({
            prompt: 'Enter option indent spaces',
            placeHolder: 'Positive integer value (e.g., 2)',
            validateInput: (input) => {
                if (input.trim() === '') {
                    return 'Value cannot be empty';
                }
                const number = parseInt(input, 10);
                if (isNaN(number) || number < 0) {
                    return 'Value must be a positive integer or zero';
                }
                if (number >= 20) {
                    return 'Value is too large';
                }
                return null;
            },
        });

        if (formatterIndent) {
            const indentValue = parseInt(formatterIndent, 10);
            vscode.workspace.getConfiguration().update('extension.configFormatterIndent', indentValue, true);
            vscode.window.showInformationMessage(`Formatter option indentation set to: ${indentValue}`);
        }
    }

    // Configure productivity timer start time
    if (selection === options[3]) {
        const dropdown = [1, 5, 10, 15, 20, 25, 30];
        const currentVal = vscode.workspace.getConfiguration('extension').get('configProductivityTime');

        // Dropdown menu
        const productivityTime = await vscode.window.showQuickPick(
            dropdown.map(i => ({
                label: (i == currentVal) ? `${i} minute(s) $(check)` : `${i} minute(s)`,
                value: i,
            })),
            {
                title: 'Productivity timer start time',
            }
        );

        if (productivityTime) {
            const timeValue = productivityTime.value;
            vscode.workspace.getConfiguration().update('extension.configProductivityTime', timeValue, true);
            vscode.window.showInformationMessage(`Productivity timer start time set to: ${timeValue} minute(s)`);
        }
    }
}

module.exports = flSettings;
