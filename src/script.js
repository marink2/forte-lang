import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const CAM_ZOOM = 30;
const BKG_COLOR = 'black';
const MOL_ROT_SPEED = 0.01;
const MOL_STICK_REP = true;
const BOND_CUTOFF = 2.8;
const BOND_RADIUS = 0.25;
const ATOM_SCALE = 0.20;
const ATOM_COLOR = [
    0xb8b4b4,   // Bond Color
    0xe0e0e0,   // H
    0xc3f7f6,   // He
    0xd3a8ed,   // Li
    0xb7eda1,   // Be
    0xf5b8bf,   // B
    0x2e2d2d,   // C
    0x2f41ba,   // N
    0xde1f0d,   // O
    0x1bf534    // F
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

    window.plotWidth = 0;
    window.plotHeightR = 0;
    window.plotHeightL = 0;
    window.recenterL = 0;
    window.recenterR = 0;
    const allCubeData = window.allCubeData;
    const plotObjects = allCubeData.map((cubeData, i) => {
        const MolOrb = makeMolOrb(cubeData);
        scene.add(MolOrb);

        window.plotWidth = Math.max(MolOrb.userData.plotSep, window.plotWidth);
        window.plotHeightR += MolOrb.userData.plotSep;

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
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

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

    document.addEventListener("mousedown", (event) => {
        isDragging = true;
        lastMouse.x = event.clientX;
        lastMouse.y = event.clientY;
    });

    document.addEventListener("mouseup", (event) => {
        isDragging = false;
    });

    document.addEventListener("mousemove", (event) => {
        if (!isDragging) return;

        // Calculate the change in mouse position
        const deltaX = event.clientX - lastMouse.x;
        const deltaY = event.clientY - lastMouse.y;

        // Update the mouse positions
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

    // Calculate Bezier curve value for the given progress
    const t = progress;
    const bezierValue = (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3;

    // Interpolate position based on Bezier value
    const newPosition = current.clone().lerp(target, bezierValue);

    return newPosition;
}


function movePlot(objects) {
    const duration = 1; // Duration of the movement in seconds

    // Ensure each object has an associated progress value
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

        // Move the mesh closer to the target position with bezier movement
        const newPosition = moveTowardsBezier(MolOrb.position, targetPosition, progress);
        MolOrb.position.copy(newPosition);

        // Check if the mesh has reached the target position
        if (progress >= 1) {
            boolList[i] = 1; // Mark as done
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

    window.plotHeightL = totHeightL;
    window.plotHeightR = totHeightR;

    if (window.recenterR > window.plotHeightR / 2) {
        window.recenterR = window.plotHeightR / 2 - 0.5
    }

    if (window.recenterR < -window.plotHeightR / 2) {
        window.recenterR = -window.plotHeightR / 2 + 0.5
    }

    if (window.recenterL > window.plotHeightL / 2) {
        window.recenterL = window.plotHeightL / 2 - 0.5
    }

    if (window.recenterL < -window.plotHeightL / 2) {
        window.recenterL = -window.plotHeightL / 2 + 0.5
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
    div.style.backgroundColor = 'transparent';

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
    const col = atoms.map(([n, x, y, z]) => n);

    for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
            const distance = posVectors[i].distanceTo(posVectors[j]);
            if (distance < BOND_CUTOFF) {
                const [bondI, bondJ] = buildBond(posVectors[i], posVectors[j], col[i], col[j]);
                bondGroup.add(bondI, bondJ);
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