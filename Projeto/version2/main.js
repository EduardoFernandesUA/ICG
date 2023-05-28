import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { Board } from './Board.js';
import { ChessEngine } from './chessengine.js';
import { UCItoCord, cordToUCI } from './helpers.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const loader = new GLTFLoader();

const pointer = new THREE.Vector2();

const raycaster = new THREE.Raycaster();

const board = new Board(THREE, scene, loader, pointer, raycaster, camera);

// Position of camera
camera.position.set(0, 6, 2);
camera.lookAt(4, 0, 4);
controls.update();

// Helper Axes
// scene.add(new THREE.AxesHelper(5));

// Ambient Light
const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);

function animate() {
    requestAnimationFrame(animate);

    controls.update();

    board.update();

    renderer.render(scene, camera);
}
animate();

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
}


async function onMouseDown(event) {
    board.onMouseDown(event);

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    let toSelect = [];
    let x = Math.floor(intersects[0].point.x + 4)
    let y = Math.floor(intersects[0].point.z + 4)
    let i = y * 8 + x;

    // search higher priority click
    let cclass = "";
    let intersected = -1;
    console.log(intersected, board.activeSelectors, i, board.activeSelectors.indexOf(i),)
    let haveActiveSelector = board.activeSelectors.indexOf(i) != -1
    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.userData.class == 'selector' && haveActiveSelector) { cclass = 'selector'; intersected = i; break; }
        else if (intersects[i].object.userData.class == 'piece' && board.activeSelectors.indexOf(i) != -1) { cclass = 'selector'; intersected = i; break; }
        else if (intersects[i].object.userData.class == 'piece') { cclass = 'piece'; intersected = i; }
    }
    console.log(intersects)

    if (cclass == "piece") {
        console.log("piece", board.board[i]);
        if (board.currentPlayer == 1) {
            switch (board.board[i]) {
                /* WHITES */
                case 'P':
                    if (x > 0 && board.board[i - 8 - 1] != "e" && board.board[i - 8 - 1] == board.board[i - 8 - 1].toLowerCase()) toSelect.push(i - 8 - 1)
                    if (x < 7 && board.board[i - 8 + 1] != "e" && board.board[i - 8 + 1] == board.board[i - 8 + 1].toLowerCase()) toSelect.push(i - 8 + 1)
                    if (board.board[i - 8] == 'e') {
                        toSelect.push(i - 8)
                        if (y == 6 && board.board[i - 8 * 2] == 'e') toSelect.push(i - 8 * 2);
                    }
                    break;
                case 'R':
                    for (let j = x - 1; j >= 0 && (board.board[y * 8 + j] == 'e' || board.board[y * 8 + j].toLowerCase() == board.board[y * 8 + j]); j--) { // left
                        toSelect.push(y * 8 + j)
                        if(board.board[y * 8 + j] != 'e' && board.board[y * 8 + j].toLowerCase() == board.board[y * 8 + j]) break;
                    }
                    for (let j = x + 1; j < 8 && (board.board[y * 8 + j] == 'e' || board.board[y * 8 + j].toLowerCase() == board.board[y * 8 + j]); j++) {
                        toSelect.push(y * 8 + j) // right
                        if(board.board[y * 8 + j] != 'e' && board.board[y * 8 + j].toLowerCase() == board.board[y * 8 + j]) break;
                    }
                    for (let j = y - 1; j >= 0 && (board.board[j * 8 + x] == 'e' || board.board[j * 8 + x].toLowerCase() == board.board[j * 8 + x]); j--) {
                        toSelect.push(j * 8 + x) // up
                        if(board.board[j * 8 + x] != 'e' && board.board[j * 8 + x].toLowerCase() == board.board[j * 8 + x]) break;
                    }
                    for (let j = y + 1; j < 8 && (board.board[j * 8 + x] == 'e' || board.board[j * 8 + x].toLowerCase() == board.board[j * 8 + x]); j++) {
                        toSelect.push(j * 8 + x) // down
                        if(board.board[j * 8 + x] != 'e' && board.board[j * 8 + x].toLowerCase() == board.board[j * 8 + x]) break;
                    }
                    break;
                case 'N':
                    const nmoves = [[1, -2], [2, -1], [2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2]];
                    for (let j of nmoves) {
                        let jx = x + j[0], jy = y + j[1];
                        if (jx >= 0 && jx < 8 && jy >= 0 && jy < 8 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx])) toSelect.push(jy * 8 + jx)
                    }
                    break;
                case 'B':
                    for (let jx = x + 1, jy = y - 1; jx < 8 && jy >= 0 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx]); jx++, jy--) {
                        toSelect.push(jy * 8 + jx) // up-right
                        if(board.board[jy * 8 + jx] != 'e' && board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx]) break;
                    }
                    for (let jx = x + 1, jy = y + 1; jx < 8 && jy < 8 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx]); jx++, jy++) {
                        toSelect.push(jy * 8 + jx) // bottom-right
                        if(board.board[jy * 8 + jx] != 'e' && board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx]) break;
                    }
                    for (let jx = x - 1, jy = y + 1; jx >= 0 && jy < 8 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx]); jx--, jy++) {
                        toSelect.push(jy * 8 + jx) // bottom-left
                        if(board.board[jy * 8 + jx] != 'e' && board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx]) break;
                    }
                    for (let jx = x - 1, jy = y - 1; jx >= 0 && jy >= 0 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx]); jx--, jy--) {
                        toSelect.push(jy * 8 + jx) // up-left
                        if(board.board[jy * 8 + jx] != 'e' && board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx]) break;
                    }
                    break
                case 'Q':
                    for (let j = x - 1; j >= 0 && (board.board[y * 8 + j] == 'e' || board.board[y * 8 + j].toLowerCase() == board.board[y * 8 + j]); j--) { // left
                        toSelect.push(y * 8 + j)
                        if(board.board[y * 8 + j] != 'e' && board.board[y * 8 + j].toLowerCase() == board.board[y * 8 + j]) break;
                    }
                    for (let j = x + 1; j < 8 && board.board[y * 8 + j] == 'e'; j++) {
                        toSelect.push(y * 8 + j) // right
                        if(board.board[y * 8 + j] != 'e' && board.board[y * 8 + j].toLowerCase() == board.board[y * 8 + j]) break;
                    }
                    for (let j = y - 1; j >= 0 && (board.board[j * 8 + x] == 'e' || board.board[j * 8 + x].toLowerCase() == board.board[j * 8 + x]); j--) {
                        toSelect.push(j * 8 + x) // up
                        if(board.board[j * 8 + x] != 'e' && board.board[j * 8 + x].toLowerCase() == board.board[j * 8 + x]) break;
                    }
                    for (let j = y + 1; j < 8 && board.board[j * 8 + x] == 'e'; j++) {
                        toSelect.push(j * 8 + x) // down
                        if(board.board[j * 8 + x] != 'e' && board.board[j * 8 + x].toLowerCase() == board.board[j * 8 + x]) break;
                    }
                    for (let jx = x + 1, jy = y - 1; jx < 8 && jy >= 0 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx]); jx++, jy--) {
                        toSelect.push(jy * 8 + jx) // up-right
                        if(board.board[jy * 8 + jx] != 'e' && board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx]) break;
                    }
                    for (let jx = x + 1, jy = y + 1; jx < 8 && jy < 8 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx]); jx++, jy++) {
                        toSelect.push(jy * 8 + jx) // bottom-right
                        if(board.board[jy * 8 + jx] != 'e' && board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx]) break;
                    }
                    for (let jx = x - 1, jy = y + 1; jx >= 0 && jy < 8 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx]); jx--, jy++) {
                        toSelect.push(jy * 8 + jx) // bottom-left
                        if(board.board[jy * 8 + jx] != 'e' && board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx]) break;
                    }
                    for (let jx = x - 1, jy = y - 1; jx >= 0 && jy >= 0 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx]); jx--, jy--) {
                        toSelect.push(jy * 8 + jx) // up-left
                        if(board.board[jy * 8 + jx] != 'e' && board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx]) break;
                    }
                    break
                    break;
                case 'K':
                    const kmoves = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
                    for (let j of kmoves) {
                        let jx = x + j[0], jy = y + j[1];
                        if (jx >= 0 && jx < 8 && jy >= 0 && jy < 8 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toLowerCase() == board.board[jy * 8 + jx])) toSelect.push(jy * 8 + jx)
                    }
                    break;

                /* BLACKS */
                default:
                    break;
            }
        } else {
            switch (board.board[i]) {
                /* WHITES */
                case 'p':
                    if (x > 0 && board.board[i + 8 - 1] != "e" && board.board[i + 8 - 1] == board.board[i + 8 - 1].toUpperCase()) toSelect.push(i + 8 - 1)
                    if (x < 7 && board.board[i + 8 + 1] != "e" && board.board[i + 8 + 1] == board.board[i + 8 + 1].toUpperCase()) toSelect.push(i + 8 + 1)
                    if ( y<7 && board.board[i + 8] == 'e') {
                        toSelect.push(i + 8)
                        if (y == 1 && board.board[i + 8 * 2] == 'e') toSelect.push(i + 8 * 2)
                    }
                    break;
                case 'r':
                    for (let j = x - 1; j >= 0 && (board.board[y * 8 + j] == 'e' || board.board[y * 8 + j].toUpperCase() == board.board[y * 8 + j]); j--) { // left
                        toSelect.push(y * 8 + j)
                        if(board.board[y * 8 + j] != 'e' && board.board[y * 8 + j].toUpperCase() == board.board[y * 8 + j]) break;
                    }
                    for (let j = x + 1; j < 8 && (board.board[y * 8 + j] == 'e' || board.board[y * 8 + j].toUpperCase() == board.board[y * 8 + j]); j++) {
                        toSelect.push(y * 8 + j) // right
                        if(board.board[y * 8 + j] != 'e' && board.board[y * 8 + j].toUpperCase() == board.board[y * 8 + j]) break;
                    }
                    for (let j = y - 1; j >= 0 && (board.board[j * 8 + x] == 'e' || board.board[j * 8 + x].toUpperCase() == board.board[j * 8 + x]); j--) {
                        toSelect.push(j * 8 + x) // up
                        if(board.board[j * 8 + x] != 'e' && board.board[j * 8 + x].toUpperCase() == board.board[j * 8 + x]) break;
                    }
                    for (let j = y + 1; j < 8 && (board.board[j * 8 + x] == 'e' || board.board[j * 8 + x].toUpperCase() == board.board[j * 8 + x]); j++) {
                        toSelect.push(j * 8 + x) // down
                        if(board.board[j * 8 + x] != 'e' && board.board[j * 8 + x].toUpperCase() == board.board[j * 8 + x]) break;
                    }
                    break;
                case 'n':
                    const nmoves = [[1, -2], [2, -1], [2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2]];
                    for (let j of nmoves) {
                        let jx = x + j[0], jy = y + j[1];
                        if (jx >= 0 && jx < 8 && jy >= 0 && jy < 8 && board.board[jy * 8 + jx] == 'e') toSelect.push(jy * 8 + jx)
                    }
                    break;
                case 'b':
                    for (let jx = x + 1, jy = y - 1; jx < 8 && jy >= 0 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toUpperCase() == board.board[jy * 8 + jx]); jx++, jy--) {
                        toSelect.push(jy * 8 + jx) // up-right
                        if(board.board[jy * 8 + jx] != 'e' && board.board[jy * 8 + jx].toUpperCase() == board.board[jy * 8 + jx]) break;
                    }
                    for (let jx = x + 1, jy = y + 1; jx < 8 && jy < 8 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toUpperCase() == board.board[jy * 8 + jx]); jx++, jy++) {
                        toSelect.push(jy * 8 + jx) // bottom-right
                        if(board.board[jy * 8 + jx] != 'e' && board.board[jy * 8 + jx].toUpperCase() == board.board[jy * 8 + jx]) break;
                    }
                    for (let jx = x - 1, jy = y + 1; jx >= 0 && jy < 8 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toUpperCase() == board.board[jy * 8 + jx]); jx--, jy++) {
                        toSelect.push(jy * 8 + jx) // bottom-left
                        if(board.board[jy * 8 + jx] != 'e' && board.board[jy * 8 + jx].toUpperCase() == board.board[jy * 8 + jx]) break;
                    }
                    for (let jx = x - 1, jy = y - 1; jx >= 0 && jy >= 0 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toUpperCase() == board.board[jy * 8 + jx]); jx--, jy--) {
                        toSelect.push(jy * 8 + jx) // up-left
                        if(board.board[jy * 8 + jx] != 'e' && board.board[jy * 8 + jx].toUpperCase() == board.board[jy * 8 + jx]) break;
                    }
                    break
                case 'q':
                    for (let j = x - 1; j >= 0 && (board.board[y * 8 + j] == 'e' || board.board[y * 8 + j].toUpperCase() == board.board[y * 8 + j]); j--) { // left
                        toSelect.push(y * 8 + j)
                        if(board.board[y * 8 + j] != 'e' && board.board[y * 8 + j].toUpperCase() == board.board[y * 8 + j]) break;
                    }
                    for (let j = x + 1; j < 8 && (board.board[y * 8 + j] == 'e' || board.board[y * 8 + j].toUpperCase() == board.board[y * 8 + j]); j++) {
                        toSelect.push(y * 8 + j) // right
                        if(board.board[y * 8 + j] != 'e' && board.board[y * 8 + j].toUpperCase() == board.board[y * 8 + j]) break;
                    }
                    for (let j = y - 1; j >= 0 && (board.board[j * 8 + x] == 'e' || board.board[j * 8 + x].toUpperCase() == board.board[j * 8 + x]); j--) {
                        toSelect.push(j * 8 + x) // up
                        if(board.board[j * 8 + x] != 'e' && board.board[j * 8 + x].toUpperCase() == board.board[j * 8 + x]) break;
                    }
                    for (let j = y + 1; j < 8 && (board.board[j * 8 + x] == 'e' || board.board[j * 8 + x].toUpperCase() == board.board[j * 8 + x]); j++) {
                        toSelect.push(j * 8 + x) // down
                        if(board.board[j * 8 + x] != 'e' && board.board[j * 8 + x].toUpperCase() == board.board[j * 8 + x]) break;
                    }
                    for (let jx = x + 1, jy = y - 1; jx < 8 && jy >= 0 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toUpperCase() == board.board[jy * 8 + jx]); jx++, jy--) {
                        toSelect.push(jy * 8 + jx) // up-right
                        if(board.board[jy * 8 + jx] != 'e' && board.board[jy * 8 + jx].toUpperCase() == board.board[jy * 8 + jx]) break;
                    }
                    for (let jx = x + 1, jy = y + 1; jx < 8 && jy < 8 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toUpperCase() == board.board[jy * 8 + jx]); jx++, jy++) {
                        toSelect.push(jy * 8 + jx) // bottom-right
                        if(board.board[jy * 8 + jx] != 'e' && board.board[jy * 8 + jx].toUpperCase() == board.board[jy * 8 + jx]) break;
                    }
                    for (let jx = x - 1, jy = y + 1; jx >= 0 && jy < 8 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toUpperCase() == board.board[jy * 8 + jx]); jx--, jy++) {
                        toSelect.push(jy * 8 + jx) // bottom-left
                        if(board.board[jy * 8 + jx] != 'e' && board.board[jy * 8 + jx].toUpperCase() == board.board[jy * 8 + jx]) break;
                    }
                    for (let jx = x - 1, jy = y - 1; jx >= 0 && jy >= 0 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toUpperCase() == board.board[jy * 8 + jx]); jx--, jy--) {
                        toSelect.push(jy * 8 + jx) // up-left
                        if(board.board[jy * 8 + jx] != 'e' && board.board[jy * 8 + jx].toUpperCase() == board.board[jy * 8 + jx]) break;
                    }
                    break;
                case 'k':
                    const kmoves = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
                    for (let j of kmoves) {
                        let jx = x + j[0], jy = y + j[1];
                        if (jx >= 0 && jx < 8 && jy >= 0 && jy < 8 && (board.board[jy * 8 + jx] == 'e' || board.board[jy * 8 + jx].toUpperCase() == board.board[jy * 8 + jx])) toSelect.push(jy * 8 + jx)
                    }
                    break;

                /* BLACKS */
                default:
                    break;
            }
        }
    } else if (cclass == "selector") {
        movePiece(intersects[intersected].object.userData.piece, i);
        board.currentPlayer *= -1;
    }
    board.select(i, ...toSelect)
}

function movePiece(from, to) {
    if (board.pieces[to] != null) scene.remove(board.pieces[to])
    board.board[to] = board.board[from];
    board.board[from] = 'e';
    board.pieces[to] = board.pieces[from];
    board.pieces[from] = null;
    let interval = setInterval(() => {
        board.pieces[to].position.x += -(board.pieces[to].position.x - to % 8 + 3.5) * 0.1
        board.pieces[to].position.z += -(board.pieces[to].position.z - Math.floor(to / 8) + 3.5) * 0.1
        if (Math.abs((board.pieces[to].position.x - to % 8 + 3.5)) + Math.abs((board.pieces[to].position.z - Math.floor(to / 8) + 3.5)) < 0.01) {
            board.pieces[to].position.x = to % 8 - 3.5;
            board.pieces[to].position.z = Math.floor(to / 8) - 3.5;
            clearInterval(interval);
        }
    }, 1000 / 60);
}

window.addEventListener('pointermove', onPointerMove);
window.addEventListener('mousedown', onMouseDown);



