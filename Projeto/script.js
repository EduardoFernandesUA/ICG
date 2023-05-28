import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';

import { Board } from './Board.js'

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// orbits
const controls = new OrbitControls( camera, renderer.domElement );

// Position the camera
camera.position.set(0,6,2);
camera.lookAt(4,0,4);

// Helper Axes
// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

// Create a cube
// const geometry = new THREE.BoxGeometry();
// const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
// const cube = new THREE.Mesh(geometry, material);
// cube.position.set(0,0,0);
// scene.add(cube);

for(let i=0; i<8*8; i++) {
    let color = (Math.floor(i/8)+i%8)%2==1 ? 0xcccccc : 0x333333;
    const geometry = new THREE.PlaneGeometry( 1, 1 );
    const material = new THREE.MeshPhongMaterial( {color: color, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    plane.position.set(i%8-3.5,0,Math.floor(i/8)-3.5);

    // let text = new THREE.TextGeometry( "A", {} );

    plane.rotation.x = Math.PI/2;
    plane.receiveShadow = true;
    scene.add( plane );
}

let board = new Board(THREE, scene);

// let loader = new GLTFLoader();
// loader.load('/pawn.glb', (gltf) => {
//   let loadedModel = gltf
//   console.log(loadedModel)
//   scene.add(loadedModel.scene)
//   loadedModel.scene.position.set(0.95+3,0.7,0.9+3)
//   loadedModel.scene.scale.set(0.15,0.15,0.15)
// })
// loader.load( "/pawn.glb", gltf => {
//       var scale = 5.6;
//       bus.body = gltf.scene.children[0];
//       bus.body.name = 'body';
//       bus.body.rotation.set ( 0, -1.5708, 0 );
//       bus.body.scale.set (scale,scale,scale);
//       bus.body.position.set ( 0, 3.6, 0 );
//       bus.body.castShadow = true;
//       bus.frame.add(bus.body);
//    }
// );
// scene.add( bus.frame )


// Add lighting to the scene
const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( ambientLight );

let pointLights = [], nPointLights = 3;
const geometry = new THREE.SphereGeometry( 0.05, 16, 8 );
const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
for(let i=0; i<nPointLights; i++) {
  pointLights[i] = { 
    'light': new THREE.PointLight( 0xffffff, .3, 100 ),
    'ball': new THREE.Mesh( geometry, material )
  };
  pointLights[i].light.castShadow = true; // default false
  scene.add( pointLights[i].light );
  scene.add( pointLights[i].ball );
}

let raycaster = new THREE.Raycaster();

window.addEventListener('click', (event)=>{
  let mouse = new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1,-(event.clientY / window.innerHeight) * 2 + 1)

  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(scene.children);
  if( intersects.length>0 ) {
    let x = intersects[0].object.position.x+3.5;
    let y = intersects[0].object.position.z+3.5;
    let ii = y*8+x;

    if( !board.selected && board.pieces[ii] ) {
      board.selected = ii;
    } else if( board.selected ) {
      if( board.pieces[ii] ) {
        animatePiece(board.pieces[ii], -6, board.pieces[ii].position.z)
      }
      let piece = board.pieces[board.selected];
      board.pieces[board.selected] = null;
      board.selected = null;
      board.pieces[ii] = piece;
      animatePiece(piece, x-3.5, y-3.5);
    }
  }
}, false);

window.addEventListener('', () => {

})

// Render the scene
let counter = 0;
function animate() {
  requestAnimationFrame(animate);

  
  // raycaster.setFromCamera(mouse, camera);
  // var intersects = raycaster.intersectObjects(scene.children);
  // console.log(intersects)
  
  //   cube.rotation.x += 0.01;
  //   cube.rotation.y += 0.01;
  // plane.rotation.x += 0.01;
  // camera.position.x = 4*Math.cos(counter)
  // camera.position.z = -4*Math.sin(counter)
  // console.log(camera.position)
  for(let i=0; i<nPointLights; i++) {
    pointLights[i].light.position.set(
      Math.cos(counter+Math.PI/nPointLights*i*2)*3, 
      2, 
      Math.sin(counter+Math.PI/nPointLights*i*2)*3)

    pointLights[i].ball.position.set(
      Math.cos(counter+Math.PI/nPointLights*i*2)*3, 
      2, 
      Math.sin(counter+Math.PI/nPointLights*i*2)*3)
  }
  // pointLight.position.set(Math.cos(counter)*3, 2, Math.sin(counter)*3);
  // lightBulb.position.set(Math.cos(counter)*3, 2, Math.sin(counter)*3);
  camera.lookAt(0,0,0);
  counter += 0.01;
  controls.update();

  
  
  renderer.render(scene, camera);
}
animate();


const animatePiece = (piece, newx, newy) => {
  let interval = setInterval( () => {
      piece.position.x -= (piece.position.x-newx)*0.1;
      piece.position.z -= (piece.position.z-newy)*0.1;
      if( Math.abs((piece.position.x-newx) + (piece.position.z-newy)) < 0.1 ) {
        clearInterval(interval);
        piece.position.x = newx;
        piece.position.z = newy;
      }
    },
    1000/60
  );
}