import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const CAM_ZOOM = 30;
const BKG_COLOR = 'black';
const MOL_ROT_SPEED = 0.01;
const MOL_STICK_REP = true;
const BOND_CUTOFF = 4;
const BOND_RADIUS = 0.25;
const ATOM_SCALE = 0.20;

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

    window.plotHeightR = 0;
    window.plotHeightL = 0;
    window.recenterL = 0;
    window.recenterR = 0;
    const allCubeData = window.allCubeData;
    const plotObjects = allCubeData.map((cubeData, i) => {
        const MolOrb = makeMolOrb(cubeData);
        scene.add(MolOrb);
        return MolOrb;
    });

    orderPlot(plotObjects);
    let initMove = movePlot(plotObjects);
    while (initMove.every(value => value !== 1)) {
        initMove = movePlot(plotObjects);
    }

    //######################################
    //##  Event Listeners
    //######################################

    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();
    let lastMouse = new THREE.Vector2();
    let isDragging = false;
    let eventListen = false;
    let scrollSpeed = 0.03;

    document.body.style.overflow = "hidden";

    document.addEventListener('mousedown', (event) => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            let headParent = intersects[0].object;
            while (headParent.name !== 'MolOrb') {
                headParent = headParent.parent;
            }

            headParent.userData.plotVis ^= true;
            eventListen ^= true;
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'b') {
            scene.background.r ^= true;
            scene.background.b ^= true;
            scene.background.g ^= true;
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

        // Update mouse positions
        lastMouse.x = event.clientX;
        lastMouse.y = event.clientY;

        // Rotate the plot objects based on mouse movement
        plotObjects.forEach(object => {
            object.rotation.y += deltaX * MOL_ROT_SPEED;
            object.rotation.x += deltaY * MOL_ROT_SPEED;
        });
    });

    document.addEventListener("wheel", (event) => {
        const scrollAmount = event.deltaY * scrollSpeed;

        if (event.clientX > window.innerWidth / 2) {
            // Handle right-side scrolling
            const nextRecenterR = window.recenterR + scrollAmount;
            const clampedRecenterR = Math.max(-window.plotHeightR / 2, Math.min(window.plotHeightR / 2, nextRecenterR));

            const effectiveScrollR = clampedRecenterR - window.recenterR;
            window.recenterR = clampedRecenterR;

            plotObjects.forEach((object, i) => {
                if (object.userData.plotVis == 0) {
                    object.position.y += effectiveScrollR;
                    object.userData.plotMoveTo.y += effectiveScrollR;
                }
            });

        } else {
            // Handle left-side scrolling
            const nextRecenterL = window.recenterL + scrollAmount;
            const clampedRecenterL = Math.max(-window.plotHeightL / 2, Math.min(window.plotHeightL / 2, nextRecenterL));

            const effectiveScrollL = clampedRecenterL - window.recenterL;
            window.recenterL = clampedRecenterL;

            plotObjects.forEach((object, i) => {
                if (object.userData.plotVis == 1) {
                    object.position.y += effectiveScrollL;
                    object.userData.plotMoveTo.y += effectiveScrollL;
                }
            });
        }
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

    let animateMove = false;
    function render() {
        if (eventListen) {
            console.log("event Activated");
            orderPlot(plotObjects);
            animateMove = true;
            eventListen = false;
            movePlot.progress = plotObjects.map(() => 0);
        }

        if (animateMove) {
            const doneMoving = movePlot(plotObjects);

            if (doneMoving.every(value => value === 1)) {
                animateMove = false;
            }
        }

        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}


//###########################################
//##  Plot Ordering and Movement Functions
//###########################################

function moveTowardsBezier(current, target, progress) {
    // Cubic Bezier control points
    const p0 = 0;
    const p1 = 0.42; // Ease-in control point
    const p2 = 0.58; // Ease-out control point
    const p3 = 1;

    // Calculate Bezier curve value at given progress
    const t = progress;
    const bezierValue = (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3;

    // Interpolate position (Bezier)
    const newPosition = current.clone().lerp(target, bezierValue);

    return newPosition;
}


function movePlot(objects) {
    const duration = 1;

    // Assign progress value to each object (orbital)
    if (!movePlot.progress) {
        movePlot.progress = objects.map(() => 0);
    }

    const deltaTime = 0.016;

    const boolList = Array(objects.length).fill(0);

    objects.forEach((MolOrb, i) => {
        const targetPosition = MolOrb.userData.plotMoveTo;

        // Update progress
        movePlot.progress[i] = Math.min(movePlot.progress[i] + deltaTime / duration, 1);
        const progress = movePlot.progress[i];

        // Move mesh closer to final position (bezier movement)
        const newPosition = moveTowardsBezier(MolOrb.position, targetPosition, progress);
        MolOrb.position.copy(newPosition);

        // Check if the mesh has reached final position
        if (progress >= 1) {
            boolList[i] = 1;
        }
    });

    return boolList;
}


function orderPlot(objects) {
    let maxBounds = 0;
    let yOffsetL = 0;
    let yOffsetR = 0;

    let totHeightL = 0;
    let totHeightR = 0;

    objects.forEach(MolOrb => {
        const size = MolOrb.userData.plotSep;
        if (size > maxBounds) {
            maxBounds = size;
        }

        if (MolOrb.userData.plotVis) {
            totHeightL += size;
        } else {
            totHeightR += size;
        }
    });

    maxBounds = maxBounds * 0.6;

    window.plotHeightL = totHeightL;
    window.plotHeightR = totHeightR;

    if (window.recenterR > window.plotHeightR / 2) {
        window.recenterR = window.plotHeightR / 2 - 0.5;
    }

    if (window.recenterR < -window.plotHeightR / 2) {
        window.recenterR = -window.plotHeightR / 2 + 0.5;
    }

    if (window.recenterL > window.plotHeightL / 2) {
        window.recenterL = window.plotHeightL / 2 - 0.5;
    }

    if (window.recenterL < -window.plotHeightL / 2) {
        window.recenterL = -window.plotHeightL / 2 + 0.5;
    }

    objects.forEach(MolOrb => {
        const size = MolOrb.userData.plotSep;
        if (MolOrb.userData.plotVis) {
            MolOrb.userData.plotMoveTo.set(-0.5 * maxBounds, (0.5 * size + yOffsetL) - (0.5 * totHeightL) + window.recenterL, -maxBounds);
            yOffsetL = yOffsetL + size;
        } else {
            MolOrb.userData.plotMoveTo.set(0.5 * maxBounds, (0.5 * size + yOffsetR) - (0.5 * totHeightR) + window.recenterR, -maxBounds);
            yOffsetR = yOffsetR + size;
        }
    });
}


//###########################################
//##  Molecular Orbital Builder Functions
//###########################################

function makeMolOrb(cubeData) {
    const [atoms, orbVoxels, label] = cubeData;

    const MolOrb = new THREE.Group();
    MolOrb.name = "MolOrb";
    MolOrb.userData.plotVis = false;
    MolOrb.userData.plotMoveTo = new THREE.Vector3();

    const irrepTag = makeIrrepTag(label);
    const atomGroup = makeAtomGroup(atoms);
    const bondGroup = makeBondGroup(atoms);
    const orbitalGroup = makeOrbitalGroup(orbVoxels);

    MolOrb.add(irrepTag);
    MolOrb.add(atomGroup);
    MolOrb.add(bondGroup);
    MolOrb.add(orbitalGroup);

    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(MolOrb);
    MolOrb.userData.plotSep = boundingBox.min.distanceTo(boundingBox.max);

    return MolOrb;
}

function makeIrrepTag(label) {
    const div = document.createElement('div');
    const irrep = label.replace('-', '');
    div.innerHTML = irrep;
    div.className = 'irrep';
    div.style.color = '#ffffff';
    div.style.fontSize = '12px';
    div.style.fontWeight = 'bold';
    div.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    div.style.padding = '2px';

    const irrepTag = new CSS2DObject(div);
    irrepTag.name = "irrepTag";
    irrepTag.position.set(0, 0, 0);
    irrepTag.center.set(-1, -1.5);
    return irrepTag;
}

function makeAtomGroup(atoms) {
    const atomGroup = new THREE.Group();
    atomGroup.name = "atomGroup";

    atoms.forEach(([n, x, y, z]) => {
        const material = new THREE.MeshPhongMaterial({ color: ATOM_COLOR[n] });
        const size = (MOL_STICK_REP) ? BOND_RADIUS : Math.pow(n, ATOM_SCALE) / 2;
        const geometry = new THREE.SphereGeometry(size, 30, 30);
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, z);
        atomGroup.add(sphere);
    });

    return atomGroup;
}

function makeBondGroup(atoms) {
    const bondGroup = new THREE.Group();
    bondGroup.name = "bondGroup";

    const posVectors = atoms.map(([n, x, y, z]) => new THREE.Vector3(x, y, z));
    const Znum = atoms.map(([n, x, y, z]) => n);

    // Compute all possible unique bonds and properties
    let possibleBonds = [];
    for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
            const distance = posVectors[i].distanceTo(posVectors[j]);
            const totZnum = Znum[i] + Znum[j];
            const containsCarbon = Znum[i] === 6 || Znum[j] === 6;
            possibleBonds.push({ i, j, distance, totZnum, containsCarbon });
        }
    }

    // Sort bonds
    possibleBonds.sort((a, b) => {
        if (a.containsCarbon !== b.containsCarbon) {
            return b.containsCarbon - a.containsCarbon; // Bonds with carbon
        }
        if (b.totZnum !== a.totZnum) {
            return b.totZnum - a.totZnum; // Descending totZnum
        }
        return a.distance - b.distance; // Ascending bond length
    });

    // Bond counts for each atom
    const bondCounts = Array(atoms.length).fill(0);

    // Max allowed bonds for atoms
    function canFormBond(atomIndex) {
        const maxBonds = (() => {
            switch (Znum[atomIndex]) {
                case 6: return 4; // Carbon
                case 3: return 1; // Lithium
                case 1: return 1; // Hydrogen
                case 5: return 3; // Boron
                case 7: return 3; // Nitrogen
                case 8: return 2; // Oxygen
                case 9: return 1; // Fluorine
                case 11: return 1; // Sodium
                case 12: return 2; // Magnesium
                case 13: return 3; // Aluminum
                case 14: return 4; // Silicon
                case 15: return 5; // Phosphorus
                case 16: return 6; // Sulfur
                case 17: return 1; // Chlorine
                case 19: return 1; // Potassium
                case 20: return 2; // Calcium
                case 35: return 1; // Bromine
                case 53: return 1; // Iodine
                default: return 8; // Default for other elements
            }
        })();
        return bondCounts[atomIndex] < maxBonds;
    }

    // Make bonds
    for (const { i, j, distance } of possibleBonds) {
        if (distance < BOND_CUTOFF && canFormBond(i) && canFormBond(j)) {
            const [bondI, bondJ, outline] = buildBond(posVectors[i], posVectors[j], Znum[i], Znum[j]);
            bondGroup.add(bondI, bondJ, outline);
            bondCounts[i]++;
            bondCounts[j]++;
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

        return [cylinderI, cylinderJ];
    }

    return bondGroup;
}

function makeOrbitalGroup(voxels) {
    const orbitalGroup = new THREE.Group();
    orbitalGroup.name = "orbitalGroup";

    const matRed = new THREE.MeshPhongMaterial({ color: "red", transparent: true, opacity: 0.2 });
    const matBlue = new THREE.MeshPhongMaterial({ color: "blue", transparent: true, opacity: 0.2 });

    const bsize = 0.2;
    const voxelGeom = new THREE.BoxGeometry(bsize, bsize, bsize);

    const count = voxels.length;
    const instMeshRed = new THREE.InstancedMesh(voxelGeom, matRed, count);
    const instMeshBlue = new THREE.InstancedMesh(voxelGeom, matBlue, count);

    const dummy = new THREE.Object3D();
    voxels.forEach(([x, y, z, d], i) => {
        dummy.position.set(x, y, z);
        dummy.updateMatrix();
        if (d < 0) {
            instMeshRed.setMatrixAt(i, dummy.matrix);
        } else {
            instMeshBlue.setMatrixAt(i, dummy.matrix);
        }
    });

    orbitalGroup.add(instMeshRed);
    orbitalGroup.add(instMeshBlue);

    return orbitalGroup;
}

main();