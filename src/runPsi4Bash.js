const vscode = require('vscode');
const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

function runPsi4Bash() {
    const homeDir = os.homedir();
    const scriptPath = path.join(homeDir, 'Bin', 'fl_psi4_run_bash.sh');

    // Check if bash script exists
    if (!fs.existsSync(scriptPath)) {
        vscode.window.showErrorMessage('Please add fl_psi4_run_bash.sh file to $HOME/Bin/');
        return;
    }

    console.log(`Script Path: ${scriptPath}`);

    // Check if active editor is open
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
        vscode.window.showErrorMessage('No active editor found. Please open a file to run this command.');
        return;
    }

    // Check if active editor language is dat
    if (activeEditor.document.languageId !== 'dat') {
        vscode.window.showErrorMessage('The active editor is not a .dat file. Please open a .dat file to run this command.');
        return;
    }

    const workingDir = path.dirname(activeEditor.document.uri.fsPath);

    console.log(`Working Directory: ${workingDir}`);

    // Display execution comfirmation message on status bar
    showStatusBarMessage("Psi4 Executed");

    // Execute the bash script in the user's working directory
    exec(`bash "${scriptPath}"`, { cwd: workingDir }, (error, stdout, stderr) => {
        if (error) {
            let msg = '';
            const match = stdout.match(/![-]+!\n![\s]+!\n([\s\S]*?)\n![\s]+!\n![-]+!/);
            if (match) {
                const extractedLines = match[1].replace(/^!+\s*/, '').replace(/\s*!+$/, '').split("\n");
                msg = (extractedLines.length == 1) ? extractedLines[0] : 'Psi4 encountered an error. Buy a developer more coffee!';
            } else {
                console.log("No output error msg match found");
                msg = 'Psi4 encountered an error. Buy a developer more coffee!';
            }
            vscode.window.showErrorMessage(msg, 'Open Output File', 'Open Log File').then((selection) => {
                if (selection === 'Open Output File') {
                    const outputFilePath = path.join(workingDir, 'output.dat');
                    vscode.workspace.openTextDocument(outputFilePath)
                        .then((doc) => {
                            vscode.window.showTextDocument(doc);
                        })
                        .catch((err) => {
                            vscode.window.showErrorMessage(`Failed to open file: ${err.message} `);
                        });
                }
                if (selection === 'Open Log File') {
                    const outputFilePath = path.join(workingDir, 'output.log');
                    vscode.workspace.openTextDocument(outputFilePath)
                        .then((doc) => {
                            vscode.window.showTextDocument(doc);
                        })
                        .catch((err) => {
                            vscode.window.showErrorMessage(`Failed to open file: ${err.message} `);
                        });
                }
            });
            return;
        }
        if (stderr) {
            vscode.window.showWarningMessage(`Stderr: ${stderr} `);
            return;
        }
        const outMsg = 'Psi4 exiting successfully. Buy a developer a beer!';
        vscode.window.showInformationMessage(outMsg, 'Open Output File', 'Open Log File').then((selection) => {
            if (selection === 'Open Output File') {
                const outputFilePath = path.join(workingDir, 'output.dat');
                vscode.workspace.openTextDocument(outputFilePath)
                    .then((doc) => {
                        vscode.window.showTextDocument(doc);
                    })
                    .catch((err) => {
                        vscode.window.showErrorMessage(`Failed to open file: ${err.message} `);
                    });
            }
            if (selection === 'Open Log File') {
                const outputFilePath = path.join(workingDir, 'output.log');
                vscode.workspace.openTextDocument(outputFilePath)
                    .then((doc) => {
                        vscode.window.showTextDocument(doc);
                    })
                    .catch((err) => {
                        vscode.window.showErrorMessage(`Failed to open file: ${err.message} `);
                    });
            }
        });
    });
}

function timerProductivity(cup) {
    const config = vscode.workspace.getConfiguration('extension');
    const startTime = config.get('configProductivityTime');

    // Clear any existing timer
    if (cup.val) {
        clearInterval(cup.val);
        cup.val = null;
        showStatusBarMessage(`$(loading~spin) Resetting Timer! ${startTime} min`);
    } else {
        showStatusBarMessage(`Timer Set! ${startTime} min`);
    }

    // Set time countdown for coffee
    let time = startTime * 60;
    cup.val = setInterval(() => {
        time--;
        if (time === 0) {
            clearInterval(cup.val);
            cup.val = null;
            vscode.window.showInformationMessage('Time for coffee! ☕');
        }
    }, 1000);
}

function showStatusBarMessage(msg) {
    // Create a status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

    // Text for status bar item
    statusBarItem.text = msg;

    // Set background color for status bar item
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');

    // Set text color of status bar item
    statusBarItem.color = new vscode.ThemeColor('statusBar.foreground');

    // Show status bar item
    statusBarItem.show();

    // Hide status bar item after 2 seconds
    setTimeout(() => {
        statusBarItem.hide();
    }, 2000);
}

module.exports = { runPsi4Bash, timerProductivity };