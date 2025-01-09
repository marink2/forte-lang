const vscode = require('vscode');
const fs = require('fs');

const atom = {
    'H': 1, 'h': 1, '1': 1,
    'He': 2, 'HE': 2, 'he': 2, '2': 2,

    'Li': 3, 'LI': 3, 'li': 3, '3': 3,
    'Be': 4, 'BE': 4, 'be': 4, '4': 4,
    'B': 5, 'b': 5, '5': 5,
    'C': 6, 'c': 6, '6': 6,
    'N': 7, 'n': 7, '7': 7,
    'O': 8, 'o': 8, '8': 8,
    'F': 9, 'f': 9, '9': 9,
    'Ne': 10, 'NE': 10, 'ne': 10, '10': 10,

    'Na': 11, 'NA': 11, 'na': 11, '11': 11,
    'Mg': 12, 'MG': 12, 'mg': 12, '12': 12,
    'Al': 13, 'AL': 13, 'al': 13, '13': 13,
    'Si': 14, 'SI': 14, 'si': 14, '14': 14,
    'P': 15, 'p': 15, '15': 15,
    'S': 16, 's': 16, '16': 16,
    'Cl': 17, 'CL': 17, 'cl': 17, '17': 17,
    'Ar': 18, 'AR': 18, 'ar': 18, '18': 18,

    'K': 19, 'k': 19, '19': 19,
    'Ca': 20, 'CA': 20, 'ca': 20, '20': 20,
    'Sc': 21, 'SC': 21, 'sc': 21, '21': 21,
    'Ti': 22, 'TI': 22, 'ti': 22, '22': 22,
    'V': 23, 'v': 23, '23': 23,
    'Cr': 24, 'CR': 24, 'cr': 24, '24': 24,
    'Mn': 25, 'MN': 25, 'mn': 25, '25': 25,
    'Fe': 26, 'FE': 26, 'fe': 26, '26': 26,
    'Co': 27, 'CO': 27, 'co': 27, '27': 27,
    'Ni': 28, 'NI': 28, 'ni': 28, '28': 28,
    'Cu': 29, 'CU': 29, 'cu': 29, '29': 29,
    'Zn': 30, 'ZN': 30, 'zn': 30, '30': 30,
    'Ga': 31, 'GA': 31, 'ga': 31, '31': 31,
    'Ge': 32, 'GE': 32, 'ge': 32, '32': 32,
    'As': 33, 'AS': 33, 'as': 33, '33': 33,
    'Se': 34, 'SE': 34, 'se': 34, '34': 34,
    'Br': 35, 'BR': 35, 'br': 35, '35': 35,
    'Kr': 36, 'KR': 36, 'kr': 36, '36': 36,

    'Rb': 37, 'RB': 37, 'rb': 37, '37': 37,
    'Sr': 38, 'SR': 38, 'sr': 38, '38': 38,
    'Y': 39, 'y': 39, '39': 39,
    'Zr': 40, 'ZR': 40, 'zr': 40, '40': 40,
    'Nb': 41, 'NB': 41, 'nb': 41, '41': 41,
    'Mo': 42, 'MO': 42, 'mo': 42, '42': 42,
    'Tc': 43, 'TC': 43, 'tc': 43, '43': 43,
    'Ru': 44, 'RU': 44, 'ru': 44, '44': 44,
    'Rh': 45, 'RH': 45, 'rh': 45, '45': 45,
    'Pd': 46, 'PD': 46, 'pd': 46, '46': 46,
    'Ag': 47, 'AG': 47, 'ag': 47, '47': 47,
    'Cd': 48, 'CD': 48, 'cd': 48, '48': 48,
    'In': 49, 'IN': 49, 'in': 49, '49': 49,
    'Sn': 50, 'SN': 50, 'sn': 50, '50': 50,
    'Sb': 51, 'SB': 51, 'sb': 51, '51': 51,
    'Te': 52, 'TE': 52, 'te': 52, '52': 52,
    'I': 53, 'i': 53, '53': 53,
    'Xe': 54, 'XE': 54, 'xe': 54, '54': 54,

    'Cs': 55, 'CS': 55, 'cs': 55, '55': 55,
    'Ba': 56, 'BA': 56, 'ba': 56, '56': 56,
    'La': 57, 'LA': 57, 'la': 57, '57': 57,
    'Ce': 58, 'CE': 58, 'ce': 58, '58': 58,
    'Pr': 59, 'PR': 59, 'pr': 59, '59': 59,
    'Nd': 60, 'ND': 60, 'nd': 60, '60': 60,
    'Pm': 61, 'PM': 61, 'pm': 61, '61': 61,
    'Sm': 62, 'SM': 62, 'sm': 62, '62': 62,
    'Eu': 63, 'EU': 63, 'eu': 63, '63': 63,
    'Gd': 64, 'GD': 64, 'gd': 64, '64': 64,
    'Tb': 65, 'TB': 65, 'tb': 65, '65': 65,
    'Dy': 66, 'DY': 66, 'dy': 66, '66': 66,
    'Ho': 67, 'HO': 67, 'ho': 67, '67': 67,
    'Er': 68, 'ER': 68, 'er': 68, '68': 68,
    'Tm': 69, 'TM': 69, 'tm': 69, '69': 69,
    'Yb': 70, 'YB': 70, 'yb': 70, '70': 70,
    'Lu': 71, 'LU': 71, 'lu': 71, '71': 71,
    'Hf': 72, 'HF': 72, 'hf': 72, '72': 72,
    'Ta': 73, 'TA': 73, 'ta': 73, '73': 73,
    'W': 74, 'w': 74, '74': 74,
    'Re': 75, 'RE': 75, 're': 75, '75': 75,
    'Os': 76, 'OS': 76, 'os': 76, '76': 76,
    'Ir': 77, 'IR': 77, 'ir': 77, '77': 77,
    'Pt': 78, 'PT': 78, 'pt': 78, '78': 78,
    'Au': 79, 'AU': 79, 'au': 79, '79': 79,
    'Hg': 80, 'HG': 80, 'hg': 80, '80': 80,
    'Tl': 81, 'TL': 81, 'tl': 81, '81': 81,
    'Pb': 82, 'PB': 82, 'pb': 82, '82': 82,
    'Bi': 83, 'BI': 83, 'bi': 83, '83': 83,
    'Po': 84, 'PO': 84, 'po': 84, '84': 84,
    'At': 85, 'AT': 85, 'at': 85, '85': 85,
    'Rn': 86, 'RN': 86, 'rn': 86, '86': 86,

    'Fr': 87, 'FR': 87, 'fr': 87, '87': 87,
    'Ra': 88, 'RA': 88, 'ra': 88, '88': 88,
    'Ac': 89, 'AC': 89, 'ac': 89, '89': 89,
    'Th': 90, 'TH': 90, 'th': 90, '90': 90,
    'Pa': 91, 'PA': 91, 'pa': 91, '91': 91,
    'U': 92, 'u': 92, '92': 92,
    'Np': 93, 'NP': 93, 'np': 93, '93': 93,
    'Pu': 94, 'PU': 94, 'pu': 94, '94': 94,
    'Am': 95, 'AM': 95, 'am': 95, '95': 95,
    'Cm': 96, 'CM': 96, 'cm': 96, '96': 96,
    'Bk': 97, 'BK': 97, 'bk': 97, '97': 97,
    'Cf': 98, 'CF': 98, 'cf': 98, '98': 98,
    'Es': 99, 'ES': 99, 'es': 99, '99': 99,
    'Fm': 100, 'FM': 100, 'fm': 100, '100': 100,
    'Md': 101, 'MD': 101, 'md': 101, '101': 101,
    'No': 102, 'NO': 102, 'no': 102, '102': 102,
    'Lr': 103, 'LR': 103, 'lr': 103, '103': 103,
    'Rf': 104, 'RF': 104, 'rf': 104, '104': 104,
    'Db': 105, 'DB': 105, 'db': 105, '105': 105,
    'Sg': 106, 'SG': 106, 'sg': 106, '106': 106,
    'Bh': 107, 'BH': 107, 'bh': 107, '107': 107,
    'Hs': 108, 'HS': 108, 'hs': 108, '108': 108,
    'Mt': 109, 'MT': 109, 'mt': 109, '109': 109,
    'Ds': 110, 'DS': 110, 'ds': 110, '110': 110,
    'Rg': 111, 'RG': 111, 'rg': 111, '111': 111,
    'Cn': 112, 'CN': 112, 'cn': 112, '112': 112,
    'Nh': 113, 'NH': 113, 'nh': 113, '113': 113,
    'Fl': 114, 'FL': 114, 'fl': 114, '114': 114,
    'Mc': 115, 'MC': 115, 'mc': 115, '115': 115,
    'Lv': 116, 'LV': 116, 'lv': 116, '116': 116,
    'Ts': 117, 'TS': 117, 'ts': 117, '117': 117,
    'Og': 118, 'OG': 118, 'og': 118, '118': 118
};

function plotMolecule(text, extensionUri, iconPathMol) {
    // Parse molecule data
    const molecule = parseMolecule(text);

    // Show the Three.js visualization in a webview
    const panel = vscode.window.createWebviewPanel(
        'moleculeViewer',
        'Mol View',
        vscode.ViewColumn.Beside,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );
    panel.iconPath = iconPathMol;
    // Prepare the webview content
    const scriptUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'src', 'webview_scripts', 'scriptMolecule.js')
    );
    panel.webview.html = getWebviewContent(molecule, scriptUri);
    panel.webview.onDidReceiveMessage(
        (message) => {
            if (message.command === 'copyToClipboard') {
                const text = message.text;
                vscode.env.clipboard
                    .writeText(text)
                    .then(() => {
                        vscode.window.showInformationMessage(
                            'Measurements saved to clipboard!'
                        );
                    })
                    .catch((err) => {
                        vscode.window.showErrorMessage(
                            'Failed to save Measurements: ' + err
                        );
                    });
            }
        }
    );
}

function parseMolecule(data) {
    const lines = data.trim().split('\n');
    return lines.map(line => {
        const [Z, x, y, z] = line.trim().split(/\s+/);
        return [atom[Z], parseFloat(x), parseFloat(y), parseFloat(z)];
    });
}

function getWebviewContent(molecule, scriptUri) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                margin: 0;
            }
        </style>
        <title>Orbital Plots</title>
    </head>

    <body></body>

    <canvas id="c"></canvas>
    <script type="importmap" >{
        "imports": {
            "three": "https://threejs.org/build/three.module.js",
            "three/addons/": "https://threejs.org/examples/jsm/"
        }
    }</script>
    <script>
        window.molecule = ${JSON.stringify(molecule)};
    </script>
    <script type="module" src="${scriptUri}"></script>
    </html>`;
}

module.exports = plotMolecule;