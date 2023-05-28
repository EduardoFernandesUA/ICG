/* ------- HELPERS --------- */
async function waitFor(inMs) {
    return new Promise(resolve => setTimeout(resolve, inMs))
}

function cordToUCI( point ) {
    let letters = 'abcdefgh'.split("");
    return letters[Math.floor(point.x+4)]+Math.floor(point.z*(-1)+5)
}

function UCItoCord( uci ) {
    let letters = 'abcdefgh';
    return {x: letters.indexOf(uci[0])-4, z: parseInt(uci[1])}
}

export { waitFor, cordToUCI, UCItoCord }