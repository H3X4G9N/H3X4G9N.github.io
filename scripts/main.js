function randomIn(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
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

/*
function pattern1(startPosition, boxSize, boxCount) {
    let lastPosition = vec2.clone(startPosition);
    let positions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];
    
    for (let a = 0; a < boxCount; a++) {
        let position;
        let isIntersecting = false;

        do {
            position = (a == 0) ? startPosition : vec2.add([], lastPosition, vec2.multiply([], boxSize, positions[randomIn(0, 3)]));

            for (let a = 0; a < rectangles.length; a++) {
                if (position == rectangles[a].position) {
                    isIntersecting = true;
                    break;
                }
            }
        } while(isIntersecting);

        new Rectangle(position, 0, boxSize, randomColor());
        lastPosition = position;
    }
}

pattern1([0, 0], [10, 10], 100);
*/

/*
function generateRoom(roomPosition, roomSize, wallWidth) {
    let halfRoomSize = [roomSize[0] / 2, roomSize[1] / 2];

    let positions = [
        vec2.add([], roomPosition, vec2.multiply([], halfRoomSize, [-1, 0])),
        vec2.add([], roomPosition, vec2.multiply([], halfRoomSize, [1, 0])),
        vec2.add([], roomPosition, vec2.multiply([], halfRoomSize, [0, -1])),
        vec2.sub([], vec2.add([], roomPosition, vec2.multiply([], halfRoomSize, [0, 1])), [roomSize[0] / 4, 0])
    ];
    console.log(positions);
    let scales = [
        [wallWidth, roomSize[1] - wallWidth],
        [wallWidth, roomSize[1] - wallWidth],
        [roomSize[0] + wallWidth, wallWidth],
        [(roomSize[0] + wallWidth) / 2, wallWidth]
    ];

    for (let a = 0; a < 4; a++) {
        new Rectangle(positions[a], 0, scales[a], [255, 255, 255]);
    }

    new Rectangle(roomPosition, 0, vec2.sub([], roomSize, [wallWidth, wallWidth]), [255, 0, 0]);
}

generateRoom([0, 0], [10, 10], 1);
*/

function lineSegment(pointA, pointB, width, color) {
    let position = vec2.divide([], vec2.add([], pointA, pointB), [2, 2]);
    let delta = vec2.sub([], pointB, pointA);
    let length = vec2.length(delta);
    let angle = Math.atan2(delta[1], delta[0]);
    let scale = [length, width];

    new Rectangle(position, toDegree(angle), scale, color);
}

function generateRoom(roomPosition, roomSize, wallWidth, doors) {
    /*
    let maxDoorLengthX = roomSize[0] - wallWidth * 2;
    let maxDoorLengthY = roomSize[1] - wallWidth * 2;

    doors[0].doorLength = clamp(doors[a].doorLength, 0, maxDoorLengthY);
    doors[1].doorLength = clamp(doors[a].doorLength, 0, maxDoorLengthY);
    doors[2].doorLength = clamp(doors[a].doorLength, 0, maxDoorLengthX);
    doors[3].doorLength = clamp(doors[a].doorLength, 0, maxDoorLengthX);
    */


    let points = [
        [roomPosition[0] - roomSize[0] / 2, roomPosition[1] + roomSize[1] / 2 - wallWidth / 2],
        [roomPosition[0] + roomSize[0] / 2, roomPosition[1] + roomSize[1] / 2 - wallWidth / 2],
        [roomPosition[0] + roomSize[0] / 2 - wallWidth / 2, roomPosition[1] + roomSize[1] / 2 - wallWidth],
        [roomPosition[0] + roomSize[0] / 2 - wallWidth / 2, roomPosition[1] - roomSize[1] / 2 + wallWidth],
        [roomPosition[0] - roomSize[0] / 2, roomPosition[1] - roomSize[1] / 2 + wallWidth / 2],
        [roomPosition[0] + roomSize[0] / 2, roomPosition[1] - roomSize[1] / 2 + wallWidth / 2],
        [roomPosition[0] - roomSize[0] / 2 + wallWidth / 2, roomPosition[1] + roomSize[1] / 2 - wallWidth],
        [roomPosition[0] - roomSize[0] / 2 + wallWidth / 2, roomPosition[1] - roomSize[1] / 2 + wallWidth]
    ];

    let point2 = [

    ];

    for (let a = 0; a < points.length; a += 2) {
        lineSegment(points[a], points[a + 1], wallWidth, [0, 255, 0]);
    }
}

generateRoom([0, 0], [10, 10], 1);

render();
