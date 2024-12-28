import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const MOL_ROT_SPEED = 0.01;
const MOL_STICK_REP = false;
const BOND_CUTOFF = 2.8;
const BOND_RADIUS = 0.25;
const ATOM_SCALE = 0.25;
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

    //###########################
    //##  Renderers
    //###########################

    const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#c') });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.position = 'fixed';
    document.body.appendChild(labelRenderer.domElement);

    //###########################
    //##  Scene and Lighting
    //###########################

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const light = new THREE.AmbientLight(0xffffff, 6);
    scene.add(light);

    //###########################
    //##  Plotting
    //###########################

    window.plotWidth = 0;
    window.plotHeight = 0;
    const allCubeData = window.allCubeData;
    const plotObjects = allCubeData.map((cubeData, i) => {
        const MolOrb = makeMolOrb(cubeData);
        scene.add(MolOrb);

        window.plotWidth = Math.max(MolOrb.userData.plotSep, window.plotWidth);
        window.plotHeight += MolOrb.userData.plotSep;

        return MolOrb;
    });

    orderPlot(plotObjects);
    let initMove = movePlot(plotObjects);
    while (initMove.every(value => value !== 1)) {
        initMove = movePlot(plotObjects);
    }

    //###########################
    //##  Camera
    //###########################

    const camera = new THREE.OrthographicCamera();
    function resize() {
        camera.top = window.innerHeight;
        camera.bottom = -window.innerHeight;
        camera.left = -window.innerWidth;
        camera.right = window.innerWidth;
        camera.zoom = 20;

        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', resize);
    resize();

    //###########################
    //##  Event Listeners
    //###########################


    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();
    let lastMouse = new THREE.Vector2();

    let isDragging = false;
    let eventListen = false;

    window.addEventListener('mousedown', (event) => {
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
    const duration = 2; // Duration of the movement in seconds

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


    objects.forEach(MolOrb => {
        const size = MolOrb.userData.plotSep;
        if (MolOrb.userData.plotVis) {
            MolOrb.userData.plotMoveTo.set(-0.5 * maxBounds, (0.5 * size + yOffsetL) - (0.5 * totHeightL), -maxBounds);
            yOffsetL = yOffsetL + size;
        } else {
            MolOrb.userData.plotMoveTo.set(0.5 * maxBounds, (0.5 * size + yOffsetR) - (0.5 * totHeightR), -maxBounds);
            yOffsetR = yOffsetR + size;
        }
    });

}

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
        const geometry = new THREE.SphereGeometry(Math.pow(n, ATOM_SCALE) / 2, 30, 30);
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, z);
        atomGroup.add(sphere);
    });

    return atomGroup;
}

function makeBondGroup(atoms) {
    const bondGroup = new THREE.Group();
    bondGroup.name = "bondGroup";

    const posVectors = atoms.map(([n, x, y, z]) => {
        return new THREE.Vector3(x, y, z);
    });

    for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
            const distance = posVectors[i].distanceTo(posVectors[j]);
            if (distance < BOND_CUTOFF) {
                const bond = buildBond(posVectors[i], posVectors[j]);
                bondGroup.add(bond);
            }
        }
    }

    function buildBond(posVecI, posVecJ) {
        const direction = new THREE.Vector3().subVectors(posVecI, posVecJ);
        const length = direction.length();
        const midpoint = new THREE.Vector3().addVectors(posVecI, posVecJ).multiplyScalar(0.5);
        const axis = new THREE.Vector3(0, 1, 0);

        const material = new THREE.MeshPhongMaterial({ color: ATOM_COLOR[0] });
        const geometry = new THREE.CylinderGeometry(BOND_RADIUS, BOND_RADIUS, length, 32);
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.copy(midpoint);
        cylinder.quaternion.setFromUnitVectors(axis, direction.normalize());

        return cylinder;
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