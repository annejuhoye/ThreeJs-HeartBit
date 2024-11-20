import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


//import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
// Position de la caméra
camera.position.set(20, 60, 300); //G ou D, Haut ou bas, Avant ou Arrière
const canvas = document.getElementById("canvas");
const controls = new OrbitControls(camera, canvas);
const texture = new THREE.TextureLoader();
const decoTexture = texture.load("./assets/texturebois.jpg");
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Ajouter de la lumière
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(50, 50, 50);
scene.add(directionalLight);

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(0, 50, 0); // Positionne la lumière directement au-dessus de la scène
topLight.target.position.set(0, 0, 0); // Cible le centre de la scène
scene.add(topLight);
scene.add(topLight.target);

/*****************MOUVEMENT CAMERA**************************** */

// Position initiale et cible
const initialPosition = new THREE.Vector3(20, 60, 300);
const targetPosition = new THREE.Vector3(0, 40, 150); // Position près du Heartbit et du personnage

// Fonction pour déplacer la caméra vers une position cible
function moveCameraToTarget(onComplete) {
    const delay = 100;
    const duration = 2; // Durée de l'animation en secondes
    const steps = 60 * duration; // Nombre d'étapes de l'animation (60 FPS)
    let currentStep = 0;

    const startPos = camera.position.clone();

    setTimeout(() => {
        // Animation de la caméra
        const interval = setInterval(() => {
            currentStep++;
            const t = currentStep / steps; // Proportion de progression (de 0 à 1)

            // Interpolation de la position
            camera.position.lerpVectors(startPos, targetPosition, t);

            // Fin de l'animation
            if (currentStep >= steps) {
                clearInterval(interval);
                if (onComplete) onComplete(); // Appelle la fonction de retour après l'animation
            }
        }, 1000 / 60); // Exécuter chaque frame (environ 16 ms pour 60 FPS)
    }, delay);
}

// Fonction pour ramener la caméra à sa position initiale
function moveCameraBackToInitial() {
    const duration = 2; // Durée de l'animation en secondes
    const steps = 60 * duration; // Nombre d'étapes de l'animation (60 FPS)
    let currentStep = 0;

    const startPos = camera.position.clone();

    // Animation de la caméra
    const interval = setInterval(() => {
        currentStep++;
        const t = currentStep / steps; // Proportion de progression (de 0 à 1)

        // Interpolation de la position
        camera.position.lerpVectors(startPos, initialPosition, t);

        // Fin de l'animation
        if (currentStep >= steps) {
            clearInterval(interval);
        }
    }, 1000 / 60); // Exécuter chaque frame (environ 16 ms pour 60 FPS)
}

// Événement pour la touche `U` : Aller vers la cible, puis retour automatique
window.addEventListener('keydown', (event) => {
    if (event.key === 'u' || event.key === 'U') {
        // Aller vers la cible
        moveCameraToTarget(() => {
            // Attendre 5 secondes avant de revenir
            setTimeout(() => {
                moveCameraBackToInitial();
            }, 5000); // Délai de 5 secondes
        });
    }
});


/* ---------------MUR---------------------- */
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x879F7D }); // Kaki
const wallGeometry = new THREE.PlaneGeometry(300, 200);
const wallbehindGeometry = new THREE.PlaneGeometry(300,200);
// Mur gauche
const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
leftWall.rotation.y = Math.PI / 2; 
leftWall.position.set(-200, 30, 135); 
scene.add(leftWall);
// Mur droit
const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
rightWall.rotation.y = -Math.PI / 2; 
rightWall.position.set(100, 30, 135); 
scene.add(rightWall);
// Mur arrière
const backWall = new THREE.Mesh(wallbehindGeometry, wallMaterial);
backWall.rotation.y = 0; // 
backWall.position.set(-50, 30, -15); 
scene.add(backWall);
/* ---------------SOL----------------------*/

let loadertexture = new THREE.TextureLoader();
const parquetTexture = loadertexture.load("./assets/parquet.jpg");
parquetTexture.encoding = THREE.sRGBEncoding; // Améliore le rendu des couleurs
parquetTexture.anisotropy = 16; // Réduit le flou sur les angles (valeur maximale selon la carte graphique)

const floorMaterial = new THREE.MeshStandardMaterial({
    map: parquetTexture, // Texture du parquet
    roughness: 0.8, // Rend la surface moins réfléchissante
    metalness: 0.2, // Ajoute un léger effet métallique
    color: 0xffffff // Ajuste globalement la luminosité
});

const floorGeometry = new THREE.PlaneGeometry(300, 300); // Largeur, Hauteur


const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Rotation pour le placer horizontalement
floor.position.set(-50, -70, 135); // Positionner le sol au centre de la scène
scene.add(floor);

let loader = new GLTFLoader();

/*******************OBJET HEARTBIT********************* */
loader.load(
    "./assets/Deco.gltf",
    (deco) => {
        let mesh = deco.scene;
        mesh.scale.set(0.1, 0.1, 0.1);
        mesh.position.set(-30, 0, 0);
        mesh.traverse((node) => {
            if (node.isMesh) {
                node.material = new THREE.MeshStandardMaterial({
                    map: decoTexture
                });
                node.material.needsUpdate = true;
            }
        })
        scene.add(mesh);
    },
    (xhr) => {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},
    (error) => {
        console.log(error)
    }
)
// Création du fil
const wireGeometry = new THREE.CylinderGeometry(0.05, 0.05, 7.5, 29);
const wireMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff }); // Gris
const wire = new THREE.Mesh(wireGeometry, wireMaterial);
wire.position.set(-30, 6.15, 0);
scene.add(wire);

/*****************************************HERATBIT****************************************** */
loader.load(
    "./assets/Pendant.gltf",
    (objet) => {
        let mesh = objet.scene;
        mesh.scale.set(0.1, 0.1, 0.1);
        mesh.position.set(-30.3, -5, 0.9);
        mesh.rotation.x = - Math.PI / 2;
        mesh.traverse((node) => {
            if (node.isMesh) {
                node.material = new THREE.MeshNormalMaterial();
            }
        })
        scene.add(mesh);
    },
    (xhr) => {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},
    (error) => {
        console.log(error)
    }
);
// LUMIERE 
let light = new THREE.PointLight(0x0000ff, 0, 200); //couleur/intensité
light.position.set(-30, -1.15, 0);
light.decay = 1; //  effet réaliste
scene.add(light);

function Lightbeat(light, duration = 2, cycles = 2) {
    let interval = 0.1; // Mise à jour toutes les 100ms pour un effet fluide
    let maxIntensity = 200; // Intensité maximale
    let stepUp = maxIntensity / ((duration / interval) / 2); // Pas pour l'augmentation (standard)
    let stepDown = stepUp / 2; // Pas pour la descente (plus lent)

    let increasing = true; // Indique si la lumière augmente en intensité
    let beatInterval = setInterval(() => {
        if (increasing) {
            light.intensity += stepUp; // Augmenter l'intensité progressivement
            if (light.intensity >= maxIntensity) increasing = false; // Inverser au sommet
        } else {
            light.intensity -= stepDown; // Réduire l'intensité progressivement (plus lentement)
            if (light.intensity <= 0) {
                increasing = true; // Recommencer le cycle
                cycles--; // Diminuer le nombre de cycles restants
                if (cycles <= 0) {
                    clearInterval(beatInterval); // Arrêter l'animation après 2 cycles
                    light.intensity = 0; // S'assurer que la lumière s'éteint
                }
            }
        }
    }, interval * 1000); // Intervalle en millisecondes
}

// Gestion de l'événement de touche
window.addEventListener('keydown', (event) => {
    if (event.key === 'u' || event.key === 'U') { // Si la touche U est pressée
        console.log("Activation de la lumière après 3 secondes...");
        setTimeout(() => {
            Lightbeat(light, 1, 3); // Battement de lumière (1 cycle = 1 seconde, 3 cycles)
        }, 3000); // Délai de 3 secondes
    }
});

/*******************COMMODE**********************/ 
loader.load(
    "./assets/Commode/commode.gltf",
    (commode) => {
        let meshcommode = commode.scene;
        meshcommode.scale.set(70, 70, 70);
        meshcommode.position.set(-30, -69, 0);
        meshcommode.rotation.y = Math.PI;
        scene.add(meshcommode);
    },
    (xhr) => {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},
    (error) => {
        console.log(error)
    }
);

/**********************LAMPE************************ */

loader.load(
    "./assets/lampe.glb",
    (glb) => {
        let lampe = glb.scene;
        lampe.scale.set(60,60,60);
        lampe.position.set(-60,-12,0);
        scene.add(lampe);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
        console.error("Erreur lors du chargement du modèle:", error);
    }
);

loader.load(
    "./assets/lampe.glb",
    (glb) => {
        let lampe1 = glb.scene;
        lampe1.scale.set(60,60,60);
        lampe1.position.set(0,-12,0);
        scene.add(lampe1);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
        console.error("Erreur lors du chargement du modèle:", error);
    }
);

//LUMIERES
const lampLight = new THREE.PointLight(0xffff00, 1, 10); 
lampLight.position.set(-30, 0, 0); 
scene.add(lampLight);

const lampLight1 = new THREE.PointLight(0xffffff, 1, 10); 
lampLight1.position.set(40, 0, 0); 
scene.add(lampLight1);

/**************WINDOWS******************** */
loader.load(
    "./assets/window.glb",
    (window) => {
        let windowpanel = window.scene;
        windowpanel.scale.set(15,15,15);
        windowpanel.position.set(-120,19,-10);
        windowpanel.rotation.y= Math.PI/2;
        scene.add(windowpanel);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
        console.error("Erreur lors du chargement du modèle:", error);
    }
)
/*****************TABLE BASSE******************* */
loader.load(
    "./assets/coffetable.glb",
    (glb) => {
        let coffetable = glb.scene;
        coffetable.scale.set(60,60,60);
        coffetable.position.set(-20,-69,150);
        scene.add(coffetable);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
        console.error("Erreur lors du chargement du modèle:", error);
    }
);
loader.load(
    "./assets/coffetable.glb",
    (glb1) => {
        let coffetable1 = glb1.scene;
        coffetable1.scale.set(60,60,60);
        coffetable1.position.set(-20,-69,170);
        scene.add(coffetable1);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
        console.error("Erreur lors du chargement du modèle:", error);
    }
);
/***************************CADRE***************************** */
loader.load(
    "./assets/cadre/FAIR AP9 GOLD D520.gltf",
    (cadre) => {
        let meshcadre = cadre.scene;
        meshcadre.scale.set(60,60,60);
        meshcadre.position.set(-200, -69, 150);
        meshcadre.rotation.y = Math.PI/2;
        scene.add(meshcadre)
    },
    (xhr) => {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},
    (error) => {
        console.log(error)
    }
);
/*************************SOFA**************************/
loader.load(
    "./assets/sofa/sofa.gltf",
    (commode) => {
        let meshsofa = commode.scene;
        meshsofa.scale.set(1.5, 1.5, 1.5);
        meshsofa.position.set(-150, -69, 150);
        meshsofa.rotation.y = Math.PI/2;
        scene.add(meshsofa);
    },
    (xhr) => {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},
    (error) => {
        console.log(error)
    }
);
/***************************TAPIS******************************* */

let loadtexture = new THREE.TextureLoader();
const tapisGeometry = new THREE.PlaneGeometry(200, 250); // Largeur, Hauteur
const tapisMaterial = new THREE.MeshBasicMaterial({
    map : loadtexture.load("./assets/textapis.jpg")
})
const tapis = new THREE.Mesh(tapisGeometry, tapisMaterial);
tapis.position.set(-30, -69, 145); 
tapis.rotation.x = -Math.PI/2;
scene.add(tapis);

/**********************PERSONNAGE*********************** */
let mixer;
let clips;
// Charger le personnage 1
let personnage;
loader.load(
    "./assets/personnage.glb", 
    (gltf) => {
        personnage = gltf.scene;
        personnage.scale.set(65, 65, 65);
        personnage.position.set(60, -69, 60);
        personnage.rotation.y = -Math.PI/3;
        personnage.visible = false;
        scene.add(personnage);

        // animation
        mixer = new THREE.AnimationMixer(personnage);
        clips = gltf.animations;
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).setLoop(THREE.LoopOnce, 1).play();
        });
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
        console.error("Erreur lors du chargement du modèle:", error);
    }
);

let personnage2;

// Charger le personnage 2
loader.load(
    "./assets/personnage2.glb", 
    (gltf) => {
        personnage2 = gltf.scene; 
        personnage2.scale.set(65, 65, 65);
        personnage2.position.set(60, -69, 60);
        personnage2.rotation.y = -Math.PI/3;
        scene.add(personnage2);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
        console.error("Erreur lors du chargement du modèle:", error);
    }
);

window.addEventListener('keydown', (event) => {
    if (event.key === 'u' || event.key === 'U') { // Vérifie si la touche U est pressée
        console.log("A");
        if(personnage2){
            personnage2.visible = false;
            setTimeout(() => {
                personnage2.visible= true;
            },8000);
        }
    }
});

/******************MESSAGE************************** */


/* ---------------ANIMATION---------------------- */

// Écouteur d'événements pour la touche U
window.addEventListener('keydown', (event) => {
    if (event.key === 'u' || event.key === 'U') { 
        console.log("A");
        if (personnage) { 
            personnage.visible = true; 
            setTimeout(() => {
                personnage.visible = false; 
            }, 8000); 
        }
        // Démarrer l'animation du personnage
        if (mixer && clips) {
            console.log(mixer);
            const action = mixer.clipAction(clips[0]);
            if (!action.isRunning()) { // Vérifie si l'animation n'est pas déjà en cours
                console.log("C");
                action.reset().setLoop(THREE.LoopOnce, 1).play(); // Réinitialise et joue l'animation
            }
        }
    }
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    //vitesse de l'action
    if (mixer) {
        mixer.update(0.01); 
    }
    renderer.render(scene, camera);
}

animate();
