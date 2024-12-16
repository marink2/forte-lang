import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const atomColor = [
    0xb8b4b4, // bond color
    0xe0e0e0, // H
    0xc3f7f6, // He
    0xd3a8ed, // Li
    0xb7eda1, // Be
    0xf5b8bf, // B
    0x2e2d2d, // C
    0x2f41ba, // N
    0xde1f0d, // O
    0x1bf534  // F
];

const test_molData = [
    [
        [6, 0.000000, 0.000000, -0.125241],
        [1, 0.000000, 1.423056, 0.993829],
        [1, 0.000000, -1.423056, 0.993829]
    ],
    [
        [7, 0.000000, 0.000000, -0.125241],
        [1, 0.000000, 1.423056, 0.993829],
        [1, 0.000000, -1.423056, 0.993829]
    ],
    [
        [8, 0.000000, 0.000000, -0.125241],
        [1, 0.000000, 1.423056, 0.993829],
        [1, 0.000000, -1.423056, 0.993829]
    ],
    [
        [9, 0.000000, 0.000000, -0.125241],
        [1, 0.000000, 1.423056, 0.993829],
        [1, 0.000000, -1.423056, 0.993829]
    ]];

function main() {

    const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#c') });

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'fixed';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild(labelRenderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const light = new THREE.AmbientLight(0xFFFFFF, 2);
    // light.position.set(-1, 2, 4);
    scene.add(light);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 60);

    let width = 0
    let height = 0
    // responsive
    function resize() {
        width = window.innerWidth
        height = window.innerHeight
        camera.aspect = width / height
        const target = new THREE.Vector3(0, 0, 0)
        const distance = camera.position.distanceTo(target)
        const fov = (camera.fov * Math.PI) / 180
        const viewportHeight = 2 * Math.tan(fov / 2) * distance
        const viewportWidth = viewportHeight * (width / height)
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
        scene.traverse((obj) => {
            if (obj.onResize) obj.onResize(viewportWidth, viewportHeight, camera.aspect)
        })
    }

    window.addEventListener('resize', resize)
    resize()


    const allCubeData = window.allCubeData;
    const plotObjects = allCubeData.map((cubeData, i) => {
        const MolOrb = makeMolOrb(cubeData);
        MolOrb.name = i;
        MolOrb.userData.customID = 0;
        const [BoundingBox, BBHelper] = getBoundingBox(MolOrb);
        // MolOrb.add(BBHelper);
        scene.add(MolOrb);

        return [MolOrb, BoundingBox, 0, new THREE.Vector3(0, 0, 0)];
    });

    initOrderPlot(plotObjects)


    let eventListen = false;
    const gui = new GUI();
    const displayFolder = gui.addFolder('Displays'); // Create a folder called "Displays"

    // Iterate over plotGroup.children backwards
    for (let i = plotObjects.length - 1; i >= 0; i--) {
        let toggBool = true;

        // Create a display object for each child
        const display = {
            toggHide: function () {
                // Shift the child along the X-axis
                plotObjects[i][2] = toggBool ? 1 : 0;
                // Toggle the state
                toggBool = !toggBool;
                console.log(toggBool ? `Child ${i + 1} shifted to the left` : `Child ${i + 1} shifted to the right`);
                eventListen = true;
            }
        };

        // Add the toggle button under the "Displays" folder
        displayFolder.add(display, 'toggHide').name(`<span style="color: cyan;">(un-hide all) ${i + 1}</span>`);
    }

    displayFolder.open(); // Open the folder by default

    // let toggBool = true;
    // let hovered = {};
    // let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();

    // // Create a mapping of MolGroups and their bounding boxes
    // let boundingBoxes = {};

    // // Initialize bounding boxes for all MolGroups
    // scene.children.forEach((child) => {
    //     if (child.name && plotObjects[parseInt(child.name, 10)]) {
    //         // Compute the bounding box
    //         const box = new THREE.Box3().setFromObject(child);

    //         // Check if the bounding box is valid (not empty)
    //         if (!box.isEmpty()) {
    //             boundingBoxes[child.name] = box;
    //         } else {
    //             console.warn(`Bounding box for ${child.name} is empty.`);
    //         }
    //     }
    // });

    // // Update raycaster based on pointer movements
    // window.addEventListener('pointermove', (e) => {
    //     mouse.set(
    //         (e.clientX / window.innerWidth) * 2 - 1,
    //         -(e.clientY / window.innerHeight) * 2 + 1
    //     );
    //     raycaster.setFromCamera(mouse, camera);
    //     const intersects = raycaster.intersectObjects(scene.children, true);

    //     // Handle hovered items
    //     Object.keys(hovered).forEach((key) => {
    //         if (!intersects.some((hit) => hit.object.uuid === key)) {
    //             delete hovered[key]; // Remove if no longer hovered
    //         }
    //     });

    //     intersects.forEach((hit) => {
    //         if (!hovered[hit.object.uuid]) {
    //             hovered[hit.object.uuid] = hit; // Mark as hovered
    //         }
    //     });
    // });

    // // Handle clicks
    // window.addEventListener('click', (e) => {
    //     const pointer = new THREE.Vector2(
    //         (e.clientX / window.innerWidth) * 2 - 1,
    //         -(e.clientY / window.innerHeight) * 2 + 1
    //     );

    //     raycaster.setFromCamera(pointer, camera);
    //     const ray = raycaster.ray;

    //     // Iterate over MolGroups and their bounding boxes
    //     for (const [name, box] of Object.entries(boundingBoxes)) {
    //         const molGroup = scene.children.find((child) => child.name === name);

    //         if (box && box.intersectsRay(ray)) { // Ensure box exists and check intersection
    //             console.log(
    //                 `MolGroup clicked! Name: ${molGroup.name}, ID: ${molGroup.userData.customID}`
    //             );

    //             // Update the corresponding plotObjects value
    //             plotObjects[parseInt(name, 10)][2] = toggBool ? 1 : 0;
    //             toggBool = !toggBool; // Toggle the state

    //             break; // Only handle one MolGroup per click
    //         }
    //     }
    // });





    // // Handle clicks
    // window.addEventListener('click', (e) => {
    //     raycaster.setFromCamera(mouse, camera);
    //     intersects = raycaster.intersectObjects(scene.children, true);

    //     intersects.forEach((hit) => {
    //         let parent = hit.object; // Start with the clicked object
    //         while (parent.parent && parent.parent.type !== 'Scene') {
    //             parent = parent.parent; // Move up the hierarchy
    //         }
    //         console.log(`Outermost Parent name: ${parent.name}, Parent ID: ${parent.userData.customID}`);

    //         // Shift the child along the X-axis
    //         plotObjects[parseInt(parent.name, 10)][2] = toggBool ? 1 : 0;
    //         // Toggle the state
    //         toggBool = !toggBool;
    //         // console.log(toggBool ? `Child ${i + 1} shifted to the left` : `Child ${i + 1} shifted to the right`);
    //         eventListen = true;

    //     });
    // });










    let isDragging = false;
    // let mouse = { x: 0, y: 0 };
    let lastMouse = { x: 0, y: 0 };
    let rotationSpeed = 0.01; // Adjust for sensitivity

    // Event Listeners
    document.addEventListener("mousedown", onMouseDown, false);
    document.addEventListener("mouseup", onMouseUp, false);
    document.addEventListener("mousemove", onMouseMove, false);



    function onMouseDown(event) {
        isDragging = true;
        lastMouse.x = event.clientX;
        lastMouse.y = event.clientY;
    }

    function onMouseUp() {
        isDragging = false;
    }

    function onMouseMove(event) {
        if (!isDragging) return;

        // Calculate the change in mouse position
        const deltaX = event.clientX - lastMouse.x;
        const deltaY = event.clientY - lastMouse.y;

        // Update the mouse positions
        lastMouse.x = event.clientX;
        lastMouse.y = event.clientY;

        // Rotate the cubes based on mouse movement
        plotObjects.forEach(object => {
            object[0].rotation.y += deltaX * rotationSpeed;
            object[0].rotation.x += deltaY * rotationSpeed;
        });
    }



    let animateMove = false;
    function render(time) {
        time *= 0.001;

        if (eventListen) {
            console.log("event Activated");
            orderPlot(plotObjects); // Assume this function is defined elsewhere
            animateMove = true;
            eventListen = false;
            // Reset progress for movePlot to ensure animation starts fresh
            movePlot.progress = plotObjects.map(() => 0);
        }

        if (animateMove) {
            const doneMoving = movePlot(plotObjects);

            // Check if all objects are done moving
            if (doneMoving.every(value => value === 1)) {
                animateMove = false;
                console.log("done Moving");
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

    const deltaTime = 0.016; // Approximate time step for 60 FPS

    const boolList = Array(objects.length).fill(0); // Initialize a list of zeros

    for (let i = 0; i < objects.length; i++) {
        const mesh = objects[i][0]; // The mesh object to move
        const targetPosition = objects[i][3]; // Final position

        // Update progress
        movePlot.progress[i] = Math.min(movePlot.progress[i] + deltaTime / duration, 1);
        const progress = movePlot.progress[i];

        // Move the mesh closer to the target position with bezier movement
        const newPosition = moveTowardsBezier(mesh.position, targetPosition, progress);
        mesh.position.copy(newPosition);

        // Check if the mesh has reached the target position
        if (progress >= 1) {
            boolList[i] = 1; // Mark as done
        }
    }

    return boolList;
}


function orderPlot(objects) {
    let totalHeight1 = 0;
    let totalHeight2 = 0;

    let yOffset1 = 0;
    let yOffset2 = 0;

    let xOffset = 0;
    let zOffset = -20;

    for (let i = 0; i < objects.length; i++) {
        const size = objects[i][1].min.distanceTo(objects[i][1].max);
        if (size > xOffset) {
            xOffset = size;
        }
    }

    for (let i = 0; i < objects.length; i++) {
        const size = objects[i][1].min.distanceTo(objects[i][1].max);
        const mp = size / 2;
        if (objects[i][2] == 0) {
            objects[i][3].set(-xOffset, mp + yOffset1, zOffset);
            yOffset1 = yOffset1 + size;
            totalHeight1 = totalHeight1 + size;
        }

        if (objects[i][2] == 1) {
            objects[i][3].set(0, mp + yOffset2, 0);
            yOffset2 = yOffset2 + size;
            totalHeight2 = totalHeight2 + size;
        }
    }


    const recenter1 = totalHeight1 / 2;
    const recenter2 = totalHeight2 / 2;
    for (let i = 0; i < objects.length; i++) {
        const currentY = objects[i][3].y;

        if (objects[i][2] == 0) {
            objects[i][3].set(-xOffset, currentY - recenter1, zOffset);
        }
        if (objects[i][2] == 1) {
            objects[i][3].set(0, currentY - recenter2, 0);
        }
    }
}


function initOrderPlot(objects) {
    let yOffset = 0;
    let totalHeight = 0;

    let xOffset = 0;
    let zOffset = -20;

    for (let i = 0; i < objects.length; i++) {
        const size = objects[i][1].min.distanceTo(objects[i][1].max);
        if (size > xOffset) {
            xOffset = size;
        }
    }

    for (let i = 0; i < objects.length; i++) {
        const size = objects[i][1].min.distanceTo(objects[i][1].max);
        const mp = size / 2;
        objects[i][0].position.set(-xOffset, mp + yOffset, zOffset)
        objects[i][3].set(-xOffset, mp + yOffset, zOffset);
        yOffset = yOffset + size;
        totalHeight = totalHeight + size;
    }

    for (let i = 0; i < objects.length; i++) {
        const recenter = totalHeight / 2;
        const currentY = objects[i][3].y;
        objects[i][0].position.set(-xOffset, currentY - recenter, zOffset)
        objects[i][3].set(-xOffset, currentY - recenter, zOffset);
    }
}







function getBoundingBox(object) {
    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(object);

    const BBHelper = new THREE.Box3Helper(boundingBox, 0xffff00);

    return [boundingBox, BBHelper];
}

function makeMolOrb(cubeData) {
    const [atoms, orbVoxels, labels] = cubeData;

    const MolOrb = new THREE.Group();

    const atomGroup = makeAtomGroup(atoms);
    const bondGroup = makeBondGroup(atoms);
    const orbitalGroup = makeOrbitalGroup(orbVoxels);

    MolOrb.add(atomGroup);
    MolOrb.add(bondGroup);
    MolOrb.add(orbitalGroup);

    const irrep = makeLabel(labels);
    MolOrb.add(irrep)

    return MolOrb;
}

function makeLabel(s) {
    // Transform "1-A2" into "1<i>a</i>&#8322;"
    const irrep = s; //.replace(/-[A](\d+)/, (_, num) => `1<i>a</i>&#832${num};`);

    const div = document.createElement('div');
    div.className = 'label';
    div.innerHTML = irrep; // Add some text to the label
    div.style.color = '#ffff00'; // Set the label's color to yellow
    div.style.fontSize = '16px'; // Optionally set the font size
    div.style.backgroundColor = 'transparent';

    const label = new CSS2DObject(div);
    label.position.set(0, 0, 0); // Set the label's position
    label.center.set(0, 0); // Adjust the label's center point

    return label;
}


// function make3DLabel(s) {
//     const loader = new FontLoader();

//     function loadFont(url) {
//         return new Promise((resolve, reject) => {
//             loader.load(url, resolve, undefined, reject);
//         });
//     }

//     async function createTextMesh() {
//         const material = new THREE.MeshPhongMaterial({ color: "white" });
//         const font = await loadFont('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json');
//         const geometry = new TextGeometry(s, {
//             font: font,
//             size: 3.0,
//             height: 0.2,
//             curveSegments: 12,
//             bevelEnabled: true,
//             bevelThickness: 0.15,
//             bevelSize: 0.3,
//             bevelSegments: 5,
//         });
//         return new THREE.Mesh(geometry, material);
//     }

//     // Group to hold the text mesh
//     const group = new THREE.Group();

//     // Generate the text mesh and add it to the group
//     createTextMesh().then((textMesh) => {
//         group.add(textMesh);
//     });

//     return group;
// }


function makeAtomGroup(atoms) {
    const atomGroup = new THREE.Group();

    atoms.forEach(([n, x, y, z]) => {
        const material = new THREE.MeshPhongMaterial({ color: atomColor[n] });
        const geometry = new THREE.SphereGeometry(Math.pow(n, 0.3) / 2, 30, 30);
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, z);
        atomGroup.add(sphere)
    });

    return atomGroup;
}

function makeBondGroup(atoms) {
    const bondGroup = new THREE.Group();
    const thresholdDistance = 2.8;

    const posVectors = atoms.map(([n, x, y, z]) => {
        return new THREE.Vector3(x, y, z);
    });

    for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
            const distance = posVectors[i].distanceTo(posVectors[j]);
            if (distance < thresholdDistance) {
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

        const material = new THREE.MeshPhongMaterial({ color: atomColor[0] });
        const geometry = new THREE.CylinderGeometry(0.25, 0.25, length, 32);
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.copy(midpoint);
        cylinder.quaternion.setFromUnitVectors(axis, direction.normalize());

        return cylinder;
    }
    return bondGroup;
}

function makeOrbitalGroup(voxels) {
    const OrbGroup = new THREE.Group();
    const matR = new THREE.MeshPhongMaterial({ color: "red", transparent: true, opacity: 0.2 });
    const matB = new THREE.MeshPhongMaterial({ color: "blue", transparent: true, opacity: 0.2 });
    const bsize = 0.1;

    // Define box geometry
    const geo = new THREE.BoxGeometry(bsize, bsize, bsize);

    const count = voxels.length;
    const instancedMeshR = new THREE.InstancedMesh(geo, matR, count);
    const instancedMeshB = new THREE.InstancedMesh(geo, matB, count);

    // Set positions for each instance
    const dummy = new THREE.Object3D();
    voxels.forEach((element, index) => {
        dummy.position.set(element[0], element[1], element[2]);
        dummy.updateMatrix();
        if (element[3] < 0) {
            instancedMeshR.setMatrixAt(index, dummy.matrix);
        } else {
            instancedMeshB.setMatrixAt(index, dummy.matrix);
        }
    });

    OrbGroup.add(instancedMeshR);
    OrbGroup.add(instancedMeshB);
    return OrbGroup;
}

main();