class Board {
    constructor(THREE, scene, loader, pointer, raycaster, camera) {
        this.THREE = THREE;
        this.scene = scene;
        this.loader = loader;
        this.pointer = pointer;
        this.raycaster = raycaster;
        this.camera = camera;

        this.game = "startpost";
        this.currentPossibleMoves = [];
        this.gettingCurrentPossibleMoves = false;
        this.activeSelectors = [];
        this.currentPlayer = 1; // 1->whites, -1->blacks

        // chess variables
        this.selected = NaN;
        this.board = "rnbqkbnrppppppppeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeePPPPPPPPRNBQKBNR".split("");
        this.pieces = new Array(8 * 8);

        // board lights
        this.lights = new Array(4);
        this.counter = 0;

        // add board ground
        this.ground = new Array(8*8);
        for (let i = 0; i < 8 * 8; i++) {
            const geometryBoard = new THREE.PlaneGeometry(1, 1);
            const materialBoardWhite = new THREE.MeshPhongMaterial({ color: 0x333333, side: THREE.DoubleSide });
            const materialBoardBlack = new THREE.MeshPhongMaterial({ color: 0xcccccc, side: THREE.DoubleSide });
            const plane = new THREE.Mesh(geometryBoard, (Math.floor(i / 8) + i % 8) % 2 == 0 ? materialBoardBlack : materialBoardWhite);
            plane.position.set(i % 8 - 3.5, 0, Math.floor(i / 8) - 3.5);
            plane.rotation.x = Math.PI / 2;
            plane.receiveShadow = true;
            this.ground[i] = plane;
            scene.add(plane);
        }

        // selectors
        this.selectors = new Array(8*8);
        for (let i = 0; i < 8 * 8; i++) {
            const geometryBoard = new THREE.CircleGeometry(.4, 32);
            const materialBoard = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
            const plane = new THREE.Mesh(geometryBoard, materialBoard);
            plane.position.set(i % 8 - 3.5, -0.01, Math.floor(i / 8) - 3.5);
            plane.rotation.x = Math.PI / 2;
            plane.receiveShadow = true;
            plane.userData.class = "selector"
            plane.userData.piece = -1
            this.selectors[i] = plane;
            scene.add(plane);
        }

        for (let i = 0; i < this.board.length; i++) {
            let white = new THREE.MeshPhongMaterial({ color: '#805943', side: THREE.DoubleSide });
            let black = new THREE.MeshPhongMaterial({ color: '#dadaca', side: THREE.DoubleSide });
            let y = Math.floor(i / 8);
            let x = i % 8;
            let char = this.board[i];
            if (this.board[i] != 'e') {
                loader.load('/models/' + char + '.glb', (gltf) => {
                    let loadedModel = gltf

                    var mesh01;
                    loadedModel.scene.traverse(function (child) {
                        if (child.isMesh) {
                            mesh01 = child;
                            // mesh01.receiveShadow = true;
                            mesh01.castShadow = true;
                            child.material = char.toUpperCase() == char ? black : white; // This is

                            mesh01.userData.class = "piece"
                        }

                    });

                    loadedModel.scene.position.set(-0.5 + x - 3, 0, -0.5 + y - 3);
                    loadedModel.scene.scale.set(0.15, 0.15, 0.15);
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
                    child.material = new THREE.MeshPhongMaterial({ color: "#805943", side: THREE.DoubleSide })
                    // child.material = char.toUpperCase()==char ? black : white ; // This is
                }
            });

            loadedModel.scene.position.y = 0.66;
            loadedModel.scene.scale.set(0.15, 0.15, 0.15);
            loadedModel.scene.rotation.y += -Math.PI / 2;
            scene.add(loadedModel.scene);
        });

        // point lights
        const geometryLight = new THREE.SphereGeometry(0.05, 16, 8);
        const materialLight = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        for (let i = 0; i < this.lights.length; i++) {
            this.lights[i] = {
                'light': new THREE.PointLight(0xffffff, .2, 100),
                'ball': new THREE.Mesh(geometryLight, materialLight)
            };
            this.lights[i].light.castShadow = true; // default false
            scene.add(this.lights[i].light);
            scene.add(this.lights[i].ball);
        }

    }

    select(origin, ...indices) {
        while( this.activeSelectors.length>0 ) {
            let i = this.activeSelectors.pop()
            this.selectors[i].position.y *= -1;
        }
        for(let i of indices ) {
            this.activeSelectors.push(i)
            this.selectors[i].position.y *= -1;
            this.selectors[i].userData.piece = origin;
        }
    }

    update(scene) {
        for (let i = 0; i < this.lights.length; i++) {
            this.lights[i].light.position.set(
                Math.cos(this.counter * 0.01 + Math.PI / this.lights.length * i * 2) * 3,
                2,
                Math.sin(this.counter * 0.01 + Math.PI / this.lights.length * i * 2) * 3)

            this.lights[i].ball.position.set(
                Math.cos(this.counter * 0.01 + Math.PI / this.lights.length * i * 2) * 3,
                2,
                Math.sin(this.counter * 0.01 + Math.PI / this.lights.length * i * 2) * 3)
        }


        this.counter++;
    }

    onMouseDown( event ) {
        
    }
}

export { Board }