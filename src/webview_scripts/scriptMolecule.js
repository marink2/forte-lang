import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const CAM_ZOOM = 100;
const BKG_COLOR = 'white';
const MOL_ROT_SPEED = 0.01;
const MOL_STICK_REP = false;
const ANGLE_RADIUS = 1.0;
let BOND_RADIUS = 0.25;
let BOND_CUTOFF = 2.88;
let ATOM_SCALE = 2;

const ATOM_COLOR = [
    0xD8D4D4,   // Bond Color
    0xC5C5C5,   // H
    0xD5FFFD,   // He

    0xCC7EFF,   // Li
    0xC5FE01,   // Be
    0xFFB6BB,   // B
    0x2E2D2D,   // C
    0x2F41BA,   // N
    0xDE1F0D,   // O
    0xD5F240,   // F
    0xAFE3F3,   // Ne

    0xAB5EF2,   // Na
    0x87FF00,   // Mg
    0xD4A4A5,   // Al
    0x819A9B,   // Si
    0xFF8103,   // P
    0xFEFF02,   // S
    0x1FEF21,   // Cl
    0x7FD1E6,   // Ar

    0x8F41D4,   // K
    0x3AFF00,   // Ca
    0xE5E6E3,   // Sc
    0xC1C3C4,   // Ti
    0xA7A5AD,   // V
    0x8D99CA,   // Cr
    0x9B7DC7,   // Mn
    0x817CC4,   // Fe
    0x707CC1,   // Co
    0x607CC2,   // Ni
    0xFE7A61,   // Cu
    0x7C82B2,   // Zn
    0xC19492,   // Ga
    0x639491,   // Ge
    0xBE83E2,   // As
    0xFFA200,   // Se
    0xAA2A29,   // Br
    0x5CBAD1,   // Kr

    0x752EAE,   // Rb
    0x00FF03,   // Sr
    0x98FEFF,   // Y
    0x94E2E1,   // Zr
    0x73C3CC,   // Nb
    0x56B5B7,   // Mo
    0x3BA0A9,   // Tc
    0x248D95,   // Ru
    0x067E8C,   // Rh
    0x006985,   // Pd
    0x98C5FF,   // Ag
    0xFFD990,   // Cd
    0xA87673,   // In
    0x678281,   // Sn
    0xA065B7,   // Sb
    0xD57B01,   // Te
    0x930093,   // I
    0x429FAF,   // Xe

    0x551991,   // Cs
    0x00CB01,   // Ba
    0x6FE0FC,   // La
    0xFFFFC8,   // Ce
    0xDAFFC8,   // Pr
    0xC6FFC7,   // Nd
    0xA4FFC7,   // Pm
    0x91FFC8,   // Sm
    0x60FFC9,   // Eu
    0x46FFC6,   // Gd
    0x32FFC7,   // Tb
    0x22FEB9,   // Dy
    0x00FF9E,   // Ho
    0x01E776,   // Er
    0x00D453,   // Tm
    0x03BD38,   // Yb
    0x01AD23,   // Lu
    0x4DC2FF,   // Hf
    0x4BA8FF,   // Ta
    0x2896D6,   // W
    0x297EAF,   // Re
    0x256898,   // Os
    0x165589,   // Ir
    0x175C96,   // Pt
    0xFED126,   // Au
    0xB3B6C3,   // Hg
    0xA5564F,   // Tl
    0x585A5E,   // Pb
    0xA04EB3,   // Bi
    0xAD5D00,   // Po
    0x794C46,   // At
    0x428395,   // Rn

    0x430066,   // Fr
    0x037D00,   // Ra
    0x70A9FD,   // Ac
    0x01B9FF,   // Th
    0x00A3FF,   // Pa
    0xF6B305,   // U
    0x0083F4,   // Np
    0x006DF2,   // Pu
    0x535BEF,   // Am
    0x765BE8,   // Cm
    0x8A4DE6,   // Bk
    0x9E38D5,   // Cf
    0xB21ED9,   // Es
    0xB322B9,   // Fm
    0xB60CA5,   // Md
    0xBF0B8A,   // No
    0xC90068,   // Lr
    0x9B7CC9,   // Rf
    0x9B7CC9,   // Db
    0x9B7CC9,   // Sg
    0x9B7CC9,   // Bh
    0x9B7CC9,   // Hs
    0xA8A7AC,   // Mt
    0xA8A7AC,   // Ds
    0xA8A7AC,   // Rg
    0xA8A7AC,   // Cn
    0xA8A7AC,   // Nh
    0xA8A7AC,   // Fl
    0xA8A7AC,   // Mc
    0xA8A7AC,   // Lv
    0xA8A7AC,   // Ts
    0xA8A7AC    // Og
];

const LABEL_COLOR = [
    0xD8D4D4,   // Bond Color
    0xA5A5A5,   // H
    0xA3D7D6,   // He

    0xB388CD,   // Li
    0x97CD81,   // Be
    0xD5989F,   // B
    0x999999,   // C
    0x0F219A,   // N
    0xAE0F0D,   // O
    0xA5C240,   // F
    0x7FB3C3,   // Ne

    0x7B2EC2,   // Na
    0x57CED0,   // Mg
    0xA47475,   // Al
    0x585A5E,   // Si
    0xFFB133,   // P
    0xCECEB2,   // S
    0x0BBEC1,   // Cl
    0x4FA1B6,   // Ar

    0x8F41D4,   // K
    0x3AFF00,   // Ca
    0xE5E6E3,   // Sc
    0xC1C3C4,   // Ti
    0xA7A5AD,   // V
    0x8D99CA,   // Cr
    0x9B7DC7,   // Mn
    0x817CC4,   // Fe
    0x707CC1,   // Co
    0x607CC2,   // Ni
    0xFE7A61,   // Cu
    0x7C82B2,   // Zn
    0xC19492,   // Ga
    0x639491,   // Ge
    0xBE83E2,   // As
    0xFFA200,   // Se
    0xAA2A29,   // Br
    0x5CBAD1,   // Kr

    0x752EAE,   // Rb
    0x00FF03,   // Sr
    0x98FEFF,   // Y
    0x94E2E1,   // Zr
    0x73C3CC,   // Nb
    0x56B5B7,   // Mo
    0x3BA0A9,   // Tc
    0x248D95,   // Ru
    0x067E8C,   // Rh
    0x006985,   // Pd
    0x98C5FF,   // Ag
    0xFFD990,   // Cd
    0xA87673,   // In
    0x678281,   // Sn
    0xA065B7,   // Sb
    0xD57B01,   // Te
    0x930093,   // I
    0x429FAF,   // Xe

    0x551991,   // Cs
    0x00CB01,   // Ba
    0x6FE0FC,   // La
    0xFFFFC8,   // Ce
    0xDAFFC8,   // Pr
    0xC6FFC7,   // Nd
    0xA4FFC7,   // Pm
    0x91FFC8,   // Sm
    0x60FFC9,   // Eu
    0x46FFC6,   // Gd
    0x32FFC7,   // Tb
    0x22FEB9,   // Dy
    0x00FF9E,   // Ho
    0x01E776,   // Er
    0x00D453,   // Tm
    0x03BD38,   // Yb
    0x01AD23,   // Lu
    0x4DC2FF,   // Hf
    0x4BA8FF,   // Ta
    0x2896D6,   // W
    0x297EAF,   // Re
    0x256898,   // Os
    0x165589,   // Ir
    0x175C96,   // Pt
    0xFED126,   // Au
    0xB3B6C3,   // Hg
    0xA5564F,   // Tl
    0x585A5E,   // Pb
    0xA04EB3,   // Bi
    0xAD5D00,   // Po
    0x794C46,   // At
    0x428395,   // Rn

    0x430066,   // Fr
    0x037D00,   // Ra
    0x70A9FD,   // Ac
    0x01B9FF,   // Th
    0x00A3FF,   // Pa
    0xF6B305,   // U
    0x0083F4,   // Np
    0x006DF2,   // Pu
    0x535BEF,   // Am
    0x765BE8,   // Cm
    0x8A4DE6,   // Bk
    0x9E38D5,   // Cf
    0xB21ED9,   // Es
    0xB322B9,   // Fm
    0xB60CA5,   // Md
    0xBF0B8A,   // No
    0xC90068,   // Lr
    0x9B7CC9,   // Rf
    0x9B7CC9,   // Db
    0x9B7CC9,   // Sg
    0x9B7CC9,   // Bh
    0x9B7CC9,   // Hs
    0xA8A7AC,   // Mt
    0xA8A7AC,   // Ds
    0xA8A7AC,   // Rg
    0xA8A7AC,   // Cn
    0xA8A7AC,   // Nh
    0xA8A7AC,   // Fl
    0xA8A7AC,   // Mc
    0xA8A7AC,   // Lv
    0xA8A7AC,   // Ts
    0xA8A7AC    // Og
];

const ATOM_LABEL = [
    "Bond",     // Bond
    "H",        // H
    "He",       // He

    "Li",       // Li
    "Be",       // Be
    "B",        // B
    "C",        // C
    "N",        // N
    "O",        // O
    "F",        // F
    "Ne",       // Ne

    "Na",       // Na
    "Mg",       // Mg
    "Al",       // Al
    "Si",       // Si
    "P",        // P
    "S",        // S
    "Cl",       // Cl
    "Ar",       // Ar

    "K",        // K
    "Ca",       // Ca
    "Sc",       // Sc
    "Ti",       // Ti
    "V",        // V
    "Cr",       // Cr
    "Mn",       // Mn
    "Fe",       // Fe
    "Co",       // Co
    "Ni",       // Ni
    "Cu",       // Cu
    "Zn",       // Zn
    "Ga",       // Ga
    "Ge",       // Ge
    "As",       // As
    "Se",       // Se
    "Br",       // Br
    "Kr",       // Kr

    "Rb",       // Rb
    "Sr",       // Sr
    "Y",        // Y
    "Zr",       // Zr
    "Nb",       // Nb
    "Mo",       // Mo
    "Tc",       // Tc
    "Ru",       // Ru
    "Rh",       // Rh
    "Pd",       // Pd
    "Ag",       // Ag
    "Cd",       // Cd
    "In",       // In
    "Sn",       // Sn
    "Sb",       // Sb
    "Te",       // Te
    "I",        // I
    "Xe",       // Xe

    "Cs",       // Cs
    "Ba",       // Ba
    "La",       // La
    "Ce",       // Ce
    "Pr",       // Pr
    "Nd",       // Nd
    "Pm",       // Pm
    "Sm",       // Sm
    "Eu",       // Eu
    "Gd",       // Gd
    "Tb",       // Tb
    "Dy",       // Dy
    "Ho",       // Ho
    "Er",       // Er
    "Tm",       // Tm
    "Yb",       // Yb
    "Lu",       // Lu
    "Hf",       // Hf
    "Ta",       // Ta
    "W",        // W
    "Re",       // Re
    "Os",       // Os
    "Ir",       // Ir
    "Pt",       // Pt
    "Au",       // Au
    "Hg",       // Hg
    "Tl",       // Tl
    "Pb",       // Pb
    "Bi",       // Bi
    "Po",       // Po
    "At",       // At
    "Rn",       // Rn

    "Fr",       // Fr
    "Ra",       // Ra
    "Ac",       // Ac
    "Th",       // Th
    "Pa",       // Pa
    "U",        // U
    "Np",       // Np
    "Pu",       // Pu
    "Am",       // Am
    "Cm",       // Cm
    "Bk",       // Bk
    "Cf",       // Cf
    "Es",       // Es
    "Fm",       // Fm
    "Md",       // Md
    "No",       // No
    "Lr",       // Lr
    "Rf",       // Rf
    "Db",       // Db
    "Sg",       // Sg
    "Bh",       // Bh
    "Hs",       // Hs
    "Mt",       // Mt
    "Ds",       // Ds
    "Rg",       // Rg
    "Cn",       // Cn
    "Nh",       // Nh
    "Fl",       // Fl
    "Mc",       // Mc
    "Lv",       // Lv
    "Ts",       // Ts
    "Og"        // Og
];

function main() {
    //######################################
    //##  Renderers
    //######################################

    const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#c') });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.position = 'fixed';
    document.body.appendChild(labelRenderer.domElement);

    //######################################
    //##  Scene, Camera, and Lighting
    //######################################

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BKG_COLOR);

    const camera = new THREE.OrthographicCamera();
    const light = new THREE.AmbientLight(0xffffff, 6);
    scene.add(camera, light);

    //######################################
    //##  Plotting
    //######################################

    const molecule = window.molecule;
    let Mol = makeMolGroup(molecule);
    scene.add(Mol);

    //######################################
    //##  Event Listeners
    //######################################

    let Selected = {};
    let posVals = 0;
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();
    let lastMouse = new THREE.Vector2();
    let scrollSpeed = 0.005;
    let isDragging = false;
    let isSpacebarPressed = false;
    let isDelete = false;
    let isSaved = false;

    document.body.style.overflow = "hidden";

    document.addEventListener('dblclick', (event) => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {

            // Remove measurement label if it is intersected
            const removedMeas = deselectMeas(intersects, Mol);
            if (removedMeas) { return; }

            // Check if intersected is an atom group object
            let head = intersects[0].object;
            while (head.name && head.name !== 'atomG') {
                head = head.parent;
            }

            if (!head.name) { return; }

            // Highlight intersected atom group outline if not already highlighted
            head.children[1].userData.highlighted ^= true;

            if (head.children[1].userData.highlighted) {

                head.children[1].material.color.set(0x00ffff);
                if (posVals >= 3) {
                    posVals = 0;
                    Selected = {};
                    scene.traverse((child) => {
                        if (child.name === "OutlineAtom") {
                            if (child.uuid === head.children[1].uuid) {
                                return;
                            }
                            child.material.color.set(0x000000);
                            child.userData.highlighted = false;
                        }
                    });
                }
                Selected[posVals] = { 'uuid': head.children[0].uuid, 'pos': head.children[0].position };
                posVals += 1;

            } else {
                posVals -= 1;
                let found = false;
                head.children[1].material.color.set(0x000000);
                head.children[1].userData.highlighted = false;
                Object.keys(Selected).forEach(key => {
                    if (found) {
                        Selected[key - 1] = Selected[key];
                        delete Selected[key];
                    } else if (Selected[key].uuid === head.children[0].uuid) {
                        delete Selected[key];
                        found = true;
                    }
                });
            }

        } else {
            scene.traverse((child) => {
                if (child.name === "OutlineAtom") {
                    child.material.color.set(0x000000);
                    child.userData.highlighted = false;
                }
            });
            posVals = 0;
            Selected = {};
        }
    });
    const vscode = acquireVsCodeApi();
    document.addEventListener('keydown', (event) => {
        if (!isSpacebarPressed && event.key === ' ') {
            addMeasurement(Selected, Mol);
            isSpacebarPressed = true;
        }
        if (!isDelete && event.key === 'c') {
            Mol.children.slice().forEach((child, i) => {
                if (child.name === "BLength" || child.name === "BAngle" || child.name === "ALoc") {
                    child.remove(child.children[0]);
                    Mol.remove(child);
                }
            });
            isDelete = true;
        }
        if (!isSaved && event.key === 's') {
            let dataToSave = '';
            Mol.children.slice().forEach((child, i) => {
                if (child.name === "BLength" || child.name === "BAngle") {
                    dataToSave += child.userData.measText + '\n';
                }
            });
            console.log("save");
            vscode.postMessage({
                command: 'copyToClipboard',
                text: dataToSave,
            });
            isSaved = true;
        }
        if (event.key === 'b') {
            scene.background.r ^= true;
            scene.background.b ^= true;
            scene.background.g ^= true;
        }
    });

    document.addEventListener('keyup', (event) => {
        if (isSpacebarPressed && event.key === ' ') {
            isSpacebarPressed = false;
        }
        if (isDelete && event.key === 'c') {
            isDelete = false;
        }
        if (isSaved && event.key === 's') {
            isSaved = false;
        }
    });

    document.addEventListener("mousedown", (event) => {
        isDragging = true;
        lastMouse.x = event.clientX;
        lastMouse.y = event.clientY;
    });

    document.addEventListener("mouseup", (event) => {
        isDragging = false;
    });

    document.addEventListener("mousemove", (event) => {
        const rect = renderer.domElement.getBoundingClientRect();

        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        if (!isDragging) return;

        // Calculate change in mouse position
        const deltaX = event.clientX - lastMouse.x;
        const deltaY = event.clientY - lastMouse.y;

        // Update mouse position
        lastMouse.x = event.clientX;
        lastMouse.y = event.clientY;

        // Create quaternions for the rotation along the global axes
        const deltaRotationX = new THREE.Quaternion();
        const deltaRotationY = new THREE.Quaternion();

        // Apply rotation around the global Y-axis (horizontal drag)
        deltaRotationY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * MOL_ROT_SPEED);

        // Apply rotation around the global X-axis (vertical drag)
        deltaRotationX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * MOL_ROT_SPEED);

        // Combine the new rotations with the molecule's current quaternion
        Mol.quaternion.multiplyQuaternions(deltaRotationY, Mol.quaternion);
        Mol.quaternion.multiplyQuaternions(deltaRotationX, Mol.quaternion);
    });

    document.addEventListener("wheel", (event) => {
        const scrollAmount = event.deltaY * scrollSpeed;
        Mol.scale.x -= scrollAmount;
        Mol.scale.y -= scrollAmount;
        Mol.scale.z -= scrollAmount;
    });

    // Custom menu on right-click
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        const rect = renderer.domElement.getBoundingClientRect();

        const menu = document.createElement('div');
        menu.style.position = 'absolute';
        menu.style.top = `${rect.top + 10}px`;
        menu.style.left = `${rect.left + 10}px`;
        menu.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        menu.style.border = '1px solid #cccccc';
        menu.style.borderRadius = '8px';
        menu.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
        menu.style.padding = '8px';
        menu.style.zIndex = '1000';
        menu.style.cursor = 'default';
        menu.style.fontFamily = 'Helvetica Neue';
        menu.style.fontSize = '12px';

        // Menu items
        const items = [
            { label: 'Select Atom', action: 'Doub-click' },
            { label: 'Deselect Atom', action: 'Doub-click' },
            { label: 'Remove Measurement', action: 'Doub-click' },
            { label: 'Make Measurement', action: 'Spacebar' },
            { label: 'Clear All Meas.', action: 'C' },
            { label: 'Bkg. Color', action: 'B' },
            { label: 'Save Meas.', action: 'S' },
            { label: 'Zoom in/out', action: 'Scroll' }
        ];

        items.forEach((item) => {
            const itemRow = document.createElement('div');
            itemRow.style.display = 'flex';
            itemRow.style.justifyContent = 'space-between';
            itemRow.style.padding = '4px 8px';

            const label = document.createElement('span');
            label.textContent = item.label;
            label.style.color = 'rgba(255, 255, 255, 1)';
            label.style.flex = '1';

            const action = document.createElement('span');
            action.textContent = item.action;
            action.style.color = 'rgba(0, 255, 255, 1)';
            action.style.marginLeft = '16px';
            action.style.textAlign = 'right';

            itemRow.appendChild(label);
            itemRow.appendChild(action);
            menu.appendChild(itemRow);
        });

        // Remove existing menu (if any)
        document.body.querySelectorAll('.custom-context-menu').forEach((el) => el.remove());

        // Add menu to body
        menu.className = 'custom-context-menu';
        document.body.appendChild(menu);

        // Remove menu on click elsewhere
        document.addEventListener(
            'click',
            () => {
                menu.remove();
            },
            { once: true }
        );
    });

    // Change units by double clicking on units label
    const labelUnits = document.createElement('div');
    labelUnits.innerText = "Bohr";
    labelUnits.style.position = 'absolute';
    labelUnits.style.bottom = '10px';
    labelUnits.style.left = '30px';
    labelUnits.style.color = 'white';
    labelUnits.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    labelUnits.style.padding = '5px';
    labelUnits.style.borderRadius = '3px';
    labelUnits.style.fontSize = '12px';
    labelUnits.style.fontFamily = 'Helvetica Neue';
    labelUnits.style.userSelect = 'none';
    document.body.appendChild(labelUnits);

    labelUnits.addEventListener('dblclick', () => {
        // Toggle units label
        labelUnits.innerHTML = (labelUnits.innerHTML === "Bohr") ? "Angs" : "Bohr";

        // Remove current Mol group and children
        if (Mol) {
            Mol.traverse((child) => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach((mat) => mat.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }

                if (child.isCSS2DObject && child.parent) {
                    child.parent.remove(child);
                }
            });
            scene.remove(Mol);
        }

        // Reset selected list
        posVals = 0;
        Selected = {};

        BOND_CUTOFF = (BOND_CUTOFF === 2.88) ? 1.525 : 2.88;
        ATOM_SCALE = (ATOM_SCALE === 2) ? 4 : 2;
        BOND_RADIUS = (BOND_RADIUS === 0.25) ? 0.125 : 0.25;

        Mol = makeMolGroup(molecule);
        scene.add(Mol);
    });

    function resize() {
        camera.top = window.innerHeight;
        camera.bottom = -window.innerHeight;
        camera.left = -window.innerWidth;
        camera.right = window.innerWidth;
        camera.zoom = CAM_ZOOM;

        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', resize);
    resize();

    //######################################
    //##  Rendering
    //######################################

    function render() {
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}


//###########################################
//##  Object selection functions
//###########################################

function deselectMeas(intersects, Mol) {
    let removedMeas = false;
    intersects.forEach((intersection) => {
        const obj = intersection.object;
        if (obj.name && (obj.name === "BLength" || obj.name === "BAngle" || obj.name === "ALoc")) {
            Mol.children.forEach((child) => {
                if (child.uuid === obj.uuid) {
                    if (child.children.length === 1 && child.children[0].isCSS2DObject) {
                        child.remove(child.children[0]);
                    }
                    Mol.remove(child);
                }
            });
            removedMeas = true;
        }
    });
    return removedMeas;
}


//###########################################
//##  Measurement label functions
//###########################################

function addMeasurement(dict, Mol) {
    if (Object.keys(dict).length == 0) {
        console.log("no selection to measure");
    }

    if (Object.keys(dict).length == 1) {
        console.log("measure atom location");
        const loc = dict[0].pos.clone();
        loc.set(
            Math.round(loc.x * 1000) / 1000,
            Math.round(loc.y * 1000) / 1000,
            Math.round(loc.z * 1000) / 1000
        );

        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0, 1, 0),
            depthTest: false,
            depthWrite: false,
            transparent: true,
            opacity: 0.5,
        });

        const sphere = new THREE.Mesh(geometry, material);
        sphere.name = "ALoc";
        sphere.position.copy(dict[0].pos);

        const div = document.createElement('div');
        const text = `${loc.x}<br>${loc.y}<br>${loc.z}`;
        div.innerHTML = text;
        div.className = 'ALoc';
        div.style.color = '#16b523';
        div.style.fontSize = '12px';
        div.style.fontWeight = 'bold';
        div.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        div.style.padding = '2px';
        div.style.marginLeft = '16px';
        div.style.textAlign = 'right';

        const label = new CSS2DObject(div);
        label.name = "label";
        label.position.set(0, 0, 0);
        label.center.set(1, 1);

        sphere.add(label);
        Mol.add(sphere);
    }

    if (Object.keys(dict).length == 2) {
        console.log("measure bond length");

        const posA = dict[0].pos;
        const posB = dict[1].pos;

        const [cylinder, text] = makeLineSegment(posA, posB);

        const atomA = Mol.getObjectByProperty('uuid', dict[0].uuid);
        const atomB = Mol.getObjectByProperty('uuid', dict[1].uuid);
        const textA = atomA.userData.atomLabel;
        const textB = atomB.userData.atomLabel;
        const measText = `${textA}-${textB}:\t\t${text}`;

        cylinder.userData.measText = measText;

        Mol.add(cylinder);
    }

    if (Object.keys(dict).length == 3) {
        console.log("measure associated lengths");

        const posA = dict[0].pos.clone();
        const posB = dict[1].pos.clone();
        const posC = dict[2].pos.clone();

        const [cylinderBA, textBA] = makeLineSegment(posB, posA);
        const [cylinderBC, textBC] = makeLineSegment(posB, posC);

        const atomA = Mol.getObjectByProperty('uuid', dict[0].uuid);
        const atomB = Mol.getObjectByProperty('uuid', dict[1].uuid);
        const atomC = Mol.getObjectByProperty('uuid', dict[2].uuid);
        const textA = atomA.userData.atomLabel;
        const textB = atomB.userData.atomLabel;
        const textC = atomC.userData.atomLabel;
        const measTextBA = `${textB}-${textA}:\t\t${textBA}`;
        const measTextBC = `${textB}-${textC}:\t\t${textBC}`;

        cylinderBA.userData.measText = measTextBA;
        cylinderBC.userData.measText = measTextBC;

        Mol.add(cylinderBA);
        Mol.add(cylinderBC);

        console.log("measure bond angle");

        const vecBC = new THREE.Vector3().subVectors(posC, posB).normalize().multiplyScalar(ANGLE_RADIUS);
        const vecBA = new THREE.Vector3().subVectors(posA, posB).normalize().multiplyScalar(ANGLE_RADIUS);

        // Compute angle between vector BC and vector BA
        const dotProduct = vecBA.dot(vecBC);
        const magBC = vecBC.length();
        const magBA = vecBA.length();
        const cosineAngle = dotProduct / (magBC * magBA);
        const theta = Math.acos(cosineAngle);
        const thetaDeg = Math.abs(theta) * 180 / Math.PI;

        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0xffae17),
            depthTest: false,
            depthWrite: false,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide,
        });

        // Build angle fan geometry
        let vertices = [
            posB.x, posB.y, posB.z,
            posA.x, posA.y, posA.z
        ];

        // Calculate equally spaced points along A-C edge
        const numPoints = 129;
        const vecMid = new THREE.Vector3(0, 0, 0);
        for (let i = 0; i <= numPoints; i++) {

            // Find edge point on A-C segment
            const t = i / numPoints;
            const edgePoint = new THREE.Vector3().lerpVectors(posA, posC, t);

            // Find the vector from B to edge point
            const toPoint = new THREE.Vector3().subVectors(edgePoint, posB);
            toPoint.normalize().multiplyScalar(ANGLE_RADIUS);

            // Add the point back to vector B
            const finalPoint = new THREE.Vector3().addVectors(posB, toPoint);
            if (i == 64) {
                vecMid.copy(finalPoint);
            }
            vertices.push(finalPoint.x, finalPoint.y, finalPoint.z);
        }
        vertices.push(posC.x, posC.y, posC.z);

        const float32Vertices = new Float32Array(vertices);
        const geometryFan = new THREE.BufferGeometry();
        geometryFan.setAttribute('position', new THREE.BufferAttribute(float32Vertices, 3));

        // Create indices for a triangle fan starting from the center (index 0)
        const indices = [];
        const totalVertices = vertices.length / 3;
        for (let i = 1; i < totalVertices - 1; i++) {
            indices.push(0, i, i + 1);
        }

        geometryFan.setIndex(indices);
        geometryFan.computeVertexNormals();

        let discMesh = null;

        const geometrySemiCirc = new THREE.CircleGeometry(1, 32, 0, Math.PI);
        const tolerance = 0.05;
        const deltaPI = Math.abs(theta - Math.PI);

        if (!(deltaPI < tolerance)) {
            // If angle is not close to 180, use fan geometry
            discMesh = new THREE.Mesh(geometryFan, material);

        } else {
            // If angle is close to 180, use semicircle geometry
            const quaternion = new THREE.Quaternion();
            const defaultDirection = new THREE.Vector3(1, 0, 0);
            quaternion.setFromUnitVectors(defaultDirection, vecBC);

            discMesh = new THREE.Mesh(geometrySemiCirc, material);
            discMesh.quaternion.copy(quaternion);
            discMesh.position.copy(posB);
        }
        discMesh.name = "BAngle";

        const div = document.createElement('div');
        const text = `${Math.round(thetaDeg * 100) / 100}`;
        div.innerHTML = text;
        div.className = 'BAngle';
        div.style.color = '#ff5c00';
        div.style.fontSize = '12px';
        div.style.fontWeight = 'bold';
        div.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        div.style.padding = '2px';

        const label = new CSS2DObject(div);
        label.name = "label";
        if (!(deltaPI < tolerance)) {
            label.position.copy(vecMid);
            label.center.set(0.5, 0.5);
        } else {
            label.position.set(0, 0, 0);
            label.center.set(1, 1);
        }

        const measTextABC = `∠${textA},${textB},${textC}:\t${text}`;
        discMesh.userData.measText = measTextABC;
        discMesh.add(label);
        Mol.add(discMesh);
    }
    return;
}

function makeLineSegment(posA, posB) {
    const distance = new THREE.Vector3().subVectors(posA, posB);
    const length = distance.length();
    const midpoint = new THREE.Vector3().addVectors(posA, posB).multiplyScalar(0.5);
    const axis = new THREE.Vector3(0, 1, 0);

    const geometry = new THREE.CylinderGeometry(0.05, 0.05, length, 8);
    const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0, 1, 1),
        depthTest: false,
        depthWrite: false,
        transparent: true,
        opacity: 0.5,
    });

    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.copy(midpoint);
    cylinder.quaternion.setFromUnitVectors(axis, distance.normalize());
    cylinder.name = "BLength";

    const div = document.createElement('div');
    const text = `${Math.round(length * 1000) / 1000}`;
    div.innerHTML = text;
    div.className = 'BLength';
    div.style.color = '#0ffaf6';
    div.style.fontSize = '12px';
    div.style.fontWeight = 'bold';
    div.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    div.style.padding = '2px';

    const label = new CSS2DObject(div);
    label.name = "label";
    label.position.set(0, 0, 0);
    label.center.set(0.5, 0.5);

    cylinder.add(label);
    return [cylinder, text];
}


//###########################################
//##  Molecular Builder Functions
//###########################################

function makeMolGroup(data) {
    const molGroup = new THREE.Group();
    molGroup.name = "MolGroup";

    const atomGroup = makeAtomGroup(data);
    const bondGroup = makeBondGroup(data);

    molGroup.add(atomGroup);
    molGroup.add(bondGroup);

    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(molGroup);
    molGroup.userData.diagLength = boundingBox.min.distanceTo(boundingBox.max);
    molGroup.position.z = - molGroup.userData.diagLength;

    return molGroup;
}

function makeAtomGroup(atoms) {
    const atomGroup = new THREE.Group();
    atomGroup.name = "atomGroup";

    const atomCount = {};

    atoms.forEach(([n, x, y, z], i) => {
        const material = new THREE.MeshPhongMaterial({ color: ATOM_COLOR[n] });
        const size = (MOL_STICK_REP) ? BOND_RADIUS : Math.pow(n, 0.2) / ATOM_SCALE;
        const geometry = new THREE.SphereGeometry(size, 30, 30);
        const sphere = new THREE.Mesh(geometry, material);
        sphere.name = "atom";

        if (!atomCount[n]) { atomCount[n] = 1; } else { atomCount[n] += 1; }

        const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
        const outlineGeometry = new THREE.SphereGeometry(size + 0.12, 30, 30); // Slightly larger for outline
        const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
        outline.name = "OutlineAtom";
        outline.userData.highlighted = false;

        sphere.position.set(x, y, z);
        outline.position.set(x, y, z);


        const div = document.createElement('div');
        const text = `${ATOM_LABEL[n]}${atomCount[n]}`;
        div.innerHTML = text;
        div.className = "atomLabel";
        div.style.color = '#' + LABEL_COLOR[n].toString(16).padStart(6, '0');
        div.style.fontSize = '12px';
        div.style.fontWeight = 'bold';
        div.style.backgroundColor = 'transparent';

        const label = new CSS2DObject(div);
        label.name = "label";
        label.position.set(0, 0, 0);
        label.center.set(0.5, 0.5);

        sphere.add(label);
        sphere.userData.atomLabel = text;

        const atomG = new THREE.Group();
        atomG.name = "atomG";
        atomG.add(sphere);
        atomG.add(outline);

        atomGroup.add(atomG);
    });

    return atomGroup;
}

function makeBondGroup(atoms) {
    const bondGroup = new THREE.Group();
    bondGroup.name = "bondGroup";

    const posVectors = atoms.map(([n, x, y, z]) => new THREE.Vector3(x, y, z));
    const col = atoms.map(([n, x, y, z]) => n);

    for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
            const distance = posVectors[i].distanceTo(posVectors[j]);
            if (distance < BOND_CUTOFF) {
                const [bondI, bondJ, outline] = buildBond(posVectors[i], posVectors[j], col[i], col[j]);
                bondGroup.add(bondI, bondJ, outline);
            }
        }
    }

    function buildBond(posVecI, posVecJ, cI, cJ) {
        // Calculate the direction, midpoint, and axis for alignment
        const direction = new THREE.Vector3().subVectors(posVecJ, posVecI);
        const length = direction.length() / 2;
        const midpoint = new THREE.Vector3().addVectors(posVecI, posVecJ).multiplyScalar(0.5);
        const axis = new THREE.Vector3(0, 1, 0);

        const geometry = new THREE.CylinderGeometry(BOND_RADIUS, BOND_RADIUS, length, 32, 2);

        // Create bond I (from posVecI to midpoint)
        const colorI = ATOM_COLOR[cI];
        const materialI = new THREE.MeshPhongMaterial({ color: colorI });
        const cylinderI = new THREE.Mesh(geometry, materialI);
        const midpointI = new THREE.Vector3().addVectors(posVecI, midpoint).multiplyScalar(0.5);
        const directionI = new THREE.Vector3().subVectors(midpoint, posVecI);
        cylinderI.position.copy(midpointI);
        cylinderI.quaternion.setFromUnitVectors(axis, directionI.normalize());

        // Create bond J (from midpoint to posVecJ)
        const colorJ = ATOM_COLOR[cJ];
        const materialJ = new THREE.MeshPhongMaterial({ color: colorJ });
        const cylinderJ = new THREE.Mesh(geometry, materialJ);
        const midpointJ = new THREE.Vector3().addVectors(midpoint, posVecJ).multiplyScalar(0.5);
        const directionJ = new THREE.Vector3().subVectors(posVecJ, midpoint);
        cylinderJ.position.copy(midpointJ);
        cylinderJ.quaternion.setFromUnitVectors(axis, directionJ.normalize());

        // Create outline of bond
        const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
        const outlineGeometry = new THREE.CylinderGeometry(BOND_RADIUS + 0.12, BOND_RADIUS + 0.12, 2 * length, 32, 2);
        const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
        const outlineMidpoint = new THREE.Vector3().addVectors(posVecI, posVecJ).multiplyScalar(0.5);
        const outlineDirection = new THREE.Vector3().subVectors(posVecJ, posVecI);
        outline.position.copy(outlineMidpoint);
        outline.quaternion.setFromUnitVectors(axis, outlineDirection.normalize());
        outline.name = "OutlineBond";

        return [cylinderI, cylinderJ, outline];
    }

    return bondGroup;
}

main();