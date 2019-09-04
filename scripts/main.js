function randomIn(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomColor() {
    return [randomIn(0, 255), randomIn(0, 255), randomIn(0, 255)];
}

/**/
let backgroundColor = [0, 0, 0, 1];
let zoom = 100;
let zoomSpeed = 1;
let cameraPosition = [0, 0];
let cameraSpeed = 1;
/**/

for (let a = 0; a < 100; a++) {
    new Rectangle([randomIn(-100, 100), randomIn(-100, 100)], randomIn(0, 360), [randomIn(0, 10), randomIn(0, 10)], randomColor());
}

render();
