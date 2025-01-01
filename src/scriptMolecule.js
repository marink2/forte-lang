import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

const CAM_ZOOM = 30;
const BKG_COLOR = 'white';
const MOL_ROT_SPEED = 0.01;
const MOL_STICK_REP = false;
const BOND_CUTOFF = 2.8;
const BOND_RADIUS = 0.25;
const CIRC_RADIUS = 1.2;
const ATOM_SCALE = 0.20;
const ATOM_COLOR = [
    0xd8d4d4,   // Bond Color
    0xc5c5c5,   // H
    0xc3f7f6,   // He
    0xd3a8ed,   // Li
    0xb7eda1,   // Be
    0xf5b8bf,   // B
    0x2e2d2d,   // C
    0x2f41ba,   // N
    0xde1f0d,   // O
    0x1bf534    // F
];

const LABEL_COLOR = [
    0xd8d4d4,   // Bond Color
    0xa5a5a5,   // H
    0xa3d7d6,   // He
    0xb388cd,   // Li
    0x97cd81,   // Be
    0xd5989f,   // B
    0x999999,   // C
    0x0f219a,   // N
    0xae0f0d,   // O
    0x0bd524    // F
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
    // const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const light = new THREE.AmbientLight(0xffffff, 6);
    // const light = new THREE.DirectionalLight(0xffffff, 6);
    light.position.set(-1, 2, 4);
    scene.add(camera, light);

    //######################################
    //##  Plotting
    //######################################

    const molecule = window.molecule;
    const Mol = makeMolGroup(molecule);
    scene.add(Mol)

    //######################################
    //##  Event Listeners
    //######################################

    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();
    let lastMouse = new THREE.Vector2();
    let isDragging = false;
    let isSpacebarPressed = false;
    let scrollSpeed = 0.02;

    document.body.style.overflow = "hidden";

    let Selected = {};
    let posVals = 0;

    document.addEventListener('dblclick', (event) => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            let head = intersects[0].object;
            while (head.name && head.name !== 'atomG') {
                head = head.parent;
            }

            // Intermisionary code to delete potential measurements
            let touchedMeasurement = false;
            intersects.forEach((intersection) => {
                const intersectedObject = intersection.object;
                if (intersectedObject.name && (intersectedObject.name === "BLength" || intersectedObject.name === "BAngle")) {
                    Mol.children.forEach((child) => {
                        if (child.uuid === intersectedObject.uuid) {
                            if (child.children.length === 1 && child.children[0].isCSS2DObject) {
                                child.remove(child.children[0]);
                            }
                            Mol.remove(child);
                        }
                    });
                    touchedMeasurement = true
                }
            });
            if (touchedMeasurement) { return }
            // ##########################################################

            if (!head.name) { return }

            const id = head.children[0].userData.atomListNumber;

            head.children[1].material.color.g ^= true;
            head.children[1].material.color.b ^= true;

            if (head.children[1].material.color.g) {

                if (posVals >= 3) {

                    posVals = 0;
                    Selected = {};

                    scene.traverse((child) => {
                        if (child.name === "OutlineAtom") {
                            if (child.uuid === head.children[1].uuid) {
                                return
                            }
                            child.material.color.set(0x000000);
                        }
                    });
                    Selected[posVals] = { 'uuid': id, 'pos': head.children[0].position };
                    posVals += 1;
                    return;
                }

                Selected[posVals] = { 'uuid': id, 'pos': head.children[0].position };
                posVals += 1;

            } else {
                posVals -= 1;
                let found = false;
                Object.keys(Selected).forEach(key => {
                    if (found) {
                        Selected[key - 1] = Selected[key];
                        delete Selected[key];
                    } else if (Selected[key].uuid === id) {
                        delete Selected[key];
                        found = true;
                    }
                });
            }

        } else {
            scene.traverse((child) => {
                if (child.name === "OutlineAtom") {
                    child.material.color.set(0x000000);
                }
            });
            posVals = 0;
            Selected = {}
        }
    });

    function makeLabel(dict) {
        if (Object.keys(dict).length == 0) {
            console.log("No Atoms Selected")
            return
        }
        if (Object.keys(dict).length == 1) {
            console.log("Only One Atom Selected")
            return
        }

        if (Object.keys(dict).length == 2) {
            console.log("Graphing Bond")

            const A = dict[0].pos;
            const B = dict[1].pos;

            const cyl = makeBlen(A, B)

            Mol.add(cyl)
        }
        if (Object.keys(dict).length == 3) {
            //make some quick bond lengths 

            const Abl = dict[0].pos;
            const Bbl = dict[1].pos;
            const Cbl = dict[2].pos;

            const cyl1 = makeBlen(Bbl, Abl)
            const cyl2 = makeBlen(Bbl, Cbl)

            Mol.add(cyl1)
            Mol.add(cyl2)

            // #####################
            const A = dict[0].pos;
            const B = dict[1].pos;
            const C = dict[2].pos;

            const refVec = new THREE.Vector3(1, 0, 0);
            const BC = new THREE.Vector3().subVectors(C, B);
            const BA = new THREE.Vector3().subVectors(A, B);

            let ang1 = BC.angleTo(refVec);


            // Calculate the dot product of BA and BC
            const dotProduct = BA.dot(BC);

            // Calculate the magnitudes (norms) of the vectors
            const magnitudeBA = BA.length();
            const magnitudeBC = BC.length();

            // Compute the cosine of the angle
            const cosineAngle = dotProduct / (magnitudeBA * magnitudeBC);

            // Compute the angle in radians
            let angle = Math.acos(cosineAngle);

            console.log(ang1)
            console.log(angle)

            if (BC.y < 0) {
                ang1 = -ang1
            }

            if (((A.x - B.x) < 0) && (BC.y < 0)) {
                angle = - angle
            }

            if (((A.y - B.y) < 0) && !(BC.y < 0) && (C.x - B.x >= 0)) {
                angle = -angle
            }

            if (((A.y - B.y) >= 0) && !(BC.y < 0) && (C.x - B.x < 0)) {
                angle = -angle
            }

            // if (((A.x - B.x) >= 0) && (BC.y < 0) && (C.x - A.x > 0)) {
            //     angle = -angle
            // }

            console.log(ang1)
            console.log(angle)

            const thetaStart = ang1;
            const thetaLength = angle;
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0xffae17),
                depthTest: false,
                depthWrite: false,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide,
            });
            // const geometry = new THREE.CircleGeometry(CIRC_RADIUS, 30, thetaStart, thetaLength);
            // const circ = new THREE.Mesh(geometry, material);
            // circ.position.copy(B)

            // Define your vectors
            const v1 = new THREE.Vector3().subVectors(C, B).normalize();
            const v2 = new THREE.Vector3().subVectors(A, B).normalize();

            // Create the geometry for the triangle
            const geometry = new THREE.BufferGeometry();

            // Define the vertices of the triangle relative to point B
            const vertices = new Float32Array([
                0, 0, 0, // Vertex 1: B (center)
                v1.x, v1.y, v1.z, // Vertex 2: B + v1
                v2.x, v2.y, v2.z  // Vertex 3: B + v2
            ]);

            // Set the vertices into the geometry
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

            // Create the mesh
            const circ = new THREE.Mesh(geometry, material);

            circ.position.copy(B)


            circ.name = "BAngle"

            const div = document.createElement('div');
            const angDeg = Math.abs(angle) * 180 / Math.PI;
            const text = `${Math.round(angDeg * 100) / 100}°`;
            div.innerHTML = text;
            div.className = 'BAngle';
            div.style.color = '#d48a00';
            div.style.fontSize = '12px';
            div.style.fontWeight = 'bold';
            div.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            div.style.padding = '2px';


            const Atag = dict[0].pos;
            const Btag = dict[1].pos;
            const Ctag = dict[2].pos;

            const mid = new THREE.Vector3().addVectors(Atag, Ctag).multiplyScalar(0.5)
            const vecM = new THREE.Vector3().subVectors(mid, Btag);
            vecM.normalize()

            const label = new CSS2DObject(div);
            label.name = "label";
            label.position.set(vecM.x, vecM.y, vecM.z);
            label.center.set(0.5, 0.5);

            circ.add(label)

            Mol.add(circ)
        }
        return
    }



    document.addEventListener('keydown', (event) => {
        if (!isSpacebarPressed && event.key === ' ') {
            makeLabel(Selected);
        }
    });

    document.addEventListener('keyup', (event) => {
        if (isSpacebarPressed && event.key === ' ') {
            isSpacebarPressed = false
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
        // Calculate the change in mouse position
        const deltaX = event.clientX - lastMouse.x;
        const deltaY = event.clientY - lastMouse.y;

        // Update the mouse positions
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
        Mol.quaternion.multiplyQuaternions(deltaRotationY, Mol.quaternion); // Apply Y-axis rotation
        Mol.quaternion.multiplyQuaternions(deltaRotationX, Mol.quaternion); // Apply X-axis rotation
    });

    document.addEventListener("wheel", (event) => {
        const scrollAmount = event.deltaY * scrollSpeed;
        Mol.scale.x -= scrollAmount;
        Mol.scale.y -= scrollAmount;
        Mol.scale.z -= scrollAmount;
    });

    function resize() {
        camera.top = window.innerHeight;
        camera.bottom = -window.innerHeight;
        camera.left = -window.innerWidth;
        camera.right = window.innerWidth;
        camera.zoom = CAM_ZOOM;

        // camera.aspect = window.innerWidth / window.innerHeight

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

    atoms.forEach(([n, x, y, z], i) => {
        const material = new THREE.MeshPhongMaterial({ color: ATOM_COLOR[n] });
        const size = (MOL_STICK_REP) ? BOND_RADIUS : Math.pow(n, ATOM_SCALE) / 2;
        const geometry = new THREE.SphereGeometry(size, 30, 30);
        const sphere = new THREE.Mesh(geometry, material);
        sphere.name = "atom";
        sphere.userData.atomListNumber = i;

        const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
        const outlineGeometry = new THREE.SphereGeometry(size + 0.12, 30, 30); // Slightly larger for outline
        const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
        outline.name = "OutlineAtom"

        sphere.position.set(x, y, z);
        outline.position.set(x, y, z)


        const div = document.createElement('div');
        div.innerHTML = `${i}`;
        div.className = "atomLabel";
        div.style.color = '#' + LABEL_COLOR[n].toString(16).padStart(6, '0');;
        div.style.fontSize = '14px';
        div.style.fontWeight = 'bold';
        div.style.backgroundColor = 'transparent';

        const label = new CSS2DObject(div);
        label.name = "label";
        label.position.set(0, 0, 0);
        label.center.set(0.5, 0.5);

        sphere.add(label)

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
        outline.position.copy(outlineMidpoint)
        outline.quaternion.setFromUnitVectors(axis, outlineDirection.normalize());
        outline.name = "OutlineBond"

        return [cylinderI, cylinderJ, outline];
    }

    return bondGroup;
}

function makeBlen(A, B) {
    const distVec = new THREE.Vector3().subVectors(A, B);
    const bLength = distVec.length()
    const midpoint = new THREE.Vector3().addVectors(A, B).multiplyScalar(0.5);
    const axis = new THREE.Vector3(0, 1, 0);

    const geometry = new THREE.CylinderGeometry(0.05, 0.05, bLength, 8);
    const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0, 1, 1),
        depthTest: false,
        depthWrite: false,
        transparent: true,
        opacity: 0.5,
    });
    const cyl = new THREE.Mesh(geometry, material);
    cyl.position.copy(midpoint);
    cyl.quaternion.setFromUnitVectors(axis, distVec.normalize());
    cyl.name = "BLength"

    const div = document.createElement('div');
    const text = `${Math.round(bLength * 1000) / 1000}`;
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

    cyl.add(label)
    return cyl
}

main();