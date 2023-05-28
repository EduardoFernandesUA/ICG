import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

class Board {
    constructor(THREE, scene) {
        this.selected = NaN;
        this.board = "rnbqkbnrppppppppeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeePPPPPPPPRNBQKBNR".split("");
        this.pieces = new Array(8*8);
        
        let textureLoader = new THREE.TextureLoader();

        let whiteTexture = textureLoader.load('./models/wall.jpg');
        // whiteTexture.wrapS = THREE.RepeatWrapping;
        // whiteTexture.wrapT = THREE.RepeatWrapping;
        // whiteTexture.repeat.set(100,100)
        let white = new THREE.MeshPhongMaterial({ color: '#805943' ,side: THREE.DoubleSide});
        let black = new THREE.MeshPhongMaterial({ map: whiteTexture });

        let loader = new GLTFLoader();

        for(let i=0; i<this.board.length; i++) {
            let y = Math.floor(i/8);
            let x = i%8;
            let char = this.board[i];
            if( this.board[i]!='e' ) {
                loader.load('/models/'+char+'.glb', (gltf) => {
                    let loadedModel = gltf
                    // console.log(loadedModel)

                    var mesh01;
                    loadedModel.scene.traverse(function (child) {
                        if (child.isMesh) {
                            mesh01 = child;
                            // mesh01.receiveShadow = true;
                            mesh01.castShadow = true;
                            child.material = char.toUpperCase()==char ? black : white ; // This is
                        }
                    });

                    loadedModel.scene.position.set(-0.5+x-3,0,-0.5+y-3);
                    loadedModel.scene.scale.set(0.15,0.15,0.15);
                    loadedModel.scene.rotation.y += -Math.PI;
                    scene.add(loadedModel.scene);
                    this.pieces[i] = loadedModel.scene;
                })
            }
        }

        loader.load('/models/board.glb', (gltf) => {
            let loadedModel = gltf
            // console.log(loadedModel)

            var mesh01;
            loadedModel.scene.traverse(function (child) {
                if (child.isMesh) {
                    mesh01 = child;
                    // mesh01.receiveShadow = true;
                    mesh01.castShadow = true;
                    child.material = new THREE.MeshPhongMaterial({color:"#805943", side: THREE.DoubleSide})
                    // child.material = char.toUpperCase()==char ? black : white ; // This is
                }
            });
            
            loadedModel.scene.position.y = 0.66;
            loadedModel.scene.scale.set(0.15,0.15,0.15);
            loadedModel.scene.rotation.y += -Math.PI/2;
            scene.add(loadedModel.scene);
        })
    }

    draw(scene) {
        
    }
}

export { Board }