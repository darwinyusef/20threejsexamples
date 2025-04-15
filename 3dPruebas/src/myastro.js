import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.121.1/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import Stats from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/libs/stats.module.js";
// import { GUI } from "https://cdn.jsdelivr.net/npm/lil-gui@0.16.0/+esm";


let anim, clock, gui, mixer, actions, activeAction, previousAction;
let camera, scene, renderer, model, hemiLight, dirLight;
let rotation = 0; // Variable para rotación basada en el scroll
const api = { state: 'Walking' };

init();

function init() {
    const container = document.getElementById('container');
    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.25, 20);
    camera.position.set(10, 4, 0);
    camera.lookAt(1, -2, 0);

    // Escena
    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0x000000);
    // scene.fog = new THREE.Fog(0x000000, 20, 100);

    clock = new THREE.Clock();

    // Luces
    hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 1.4);
    hemiLight.position.set(0, 40, 0);
    scene.add(hemiLight);

    dirLight = new THREE.DirectionalLight(0xffffff, 4);
    dirLight.position.set(0, 40, 0);
    scene.add(dirLight);

    // Suelo
    // const mesh = new THREE.Mesh(
    //     new THREE.PlaneGeometry(1000, 2000),
    //     new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
    // );
    // mesh.rotation.x = -Math.PI / 2;
    //scene.add(mesh);

    // const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
    // grid.material.opacity = 0.2;
    // grid.material.transparent = true;
    // scene.add(grid);

    // Cargar modelo con animaciones
    const loader = new GLTFLoader();
    loader.load('./models/pagado/astro.glb', function (gltf) {
        model = gltf.scene;
        anim = gltf.animations;

        model.scale.set(1, 1, 1);
        model.position.set(3, -1, 2);
        model.rotation.set(0, 0.5, 0.6);
        scene.add(model);

        mixer = new THREE.AnimationMixer(model);
        // Buscar la animación "Armature"
        print(anim[0].name)
        const armatureClip = gltf.animations.find(clip => clip.name === anim[0].name);
        console.log(armatureClip);
        if (armatureClip) {
            const action = mixer.clipAction(armatureClip);
            action.play();
        }

        animate();

    }, undefined, function (error) {
        console.error(error);
    });

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    container.appendChild(renderer.domElement);

    // Eventos
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onScroll);

    // Estadísticas
    // stats = new Stats();
    // container.appendChild(stats.dom);
}


function activationAnim(action) {
    if (model) {
        const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];
        let final = 0.5;
        if (emotes.includes(action)) {
            final = 0.2;
        }
        fadeToAction(action, final);
        mixer.addEventListener('finished', restoreState);

    }
}

document.getElementById('ia1').addEventListener('mouseenter', (e) => {
    e.preventDefault();
    activationAnim('Armature');
});


const controls = document.getElementById('controls')
if (controls) {
    // Agregar un evento de clic al contenedor
    controls.addEventListener('click', (e) => {
        // Verificar que el objetivo del clic es un botón con un atributo data-action
        if (e.target && e.target.dataset.action) {
            // Obtener el valor de data-action
            const action = e.target.dataset.action;
            activationAnim(action)
        }
    });
} else {
    console.log('No se encontró el contenedor de controles.');
}

function fadeToAction(name, duration) {
    console.log(name, duration);
    previousAction = activeAction;
    activeAction = actions[name];

    if (previousAction !== activeAction) {
        previousAction.fadeOut(duration);
    }

    activeAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(duration).play();
}

function restoreState() {
    mixer.removeEventListener('finished', restoreState);
    fadeToAction(api.state, 0.2);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onScroll() {
    // Rotación y escala basadas en el scroll
    const scrollY = window.scrollY;
    rotation = scrollY * 2;
    hemiLight.intensity = 1.4 + scrollY * 0.1;
    dirLight.intensity = 4 + scrollY * 0.1;
    document.getElementById('container').style.filter = `blur(${0 + scrollY * 0.5}px)`;
    document.getElementById('ia1').style.filter = `blur(${0 + scrollY * 0.5}px)`;
    if (model) {
        // model.rotation.y = rotation;
        //model.scale.set(1.4 + rotation, 1.4 + rotation, 1.4 + rotation);
    }
}

function animate() {
    const dt = clock.getDelta();
    if (mixer) mixer.update(dt);
    renderer.render(scene, camera);
    // stats.update();
}

// Redimensionar pantalla
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
