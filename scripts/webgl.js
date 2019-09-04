let toRadian = glMatrix.glMatrix.toRadian;
let vec2 = glMatrix.vec2;
let mat3 = glMatrix.mat3;

function createCanvas(width, height, parent) {
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    canvas.oncontextmenu = function() {
        return false;
    }

    parent.appendChild(canvas);

    return canvas;
}

function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error("Failed to compile vertex shader!\n" + gl.getShaderInfoLog(vertexShader));
        gl.deleteShader(vertexShader);
        return null;
    }

    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error("Failed to compile fragment shader!\n" + gl.getShaderInfoLog(fragmentShader));
        gl.deleteShader(fragmentShader);
        return null;
    }

    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Failed to link program!\n" + gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

let width = document.body.clientWidth;
let height = document.body.clientHeight;
let canvas = createCanvas(width, height, document.body);
let gl = canvas.getContext("webgl");

/**/
let trackedMouseButtons = {
    0: true,
    1: true,
    2: true
};
let mouseButtonDownCount = 0;
let mouseButtons = {};
let mousePosition = [0, 0];
let mouseDownPosition = [0, 0];

document.addEventListener("mousemove", function(event) {
    mousePosition[0] = event.pageX;
    mousePosition[1] = event.pageY;
});

document.addEventListener("mousedown", function(event) {
    mouseButtonDownCount++;

    if (trackedMouseButtons[event.button]) {
        mouseButtons[event.button] = true;
        mouseDownPosition[0] = mousePosition[0];
        mouseDownPosition[1] = mousePosition[1];
    }
});

document.addEventListener("mouseup", function(event) {
    mouseButtonDownCount--;

    if (trackedMouseButtons[event.button]) {
        mouseButtons[event.button] = false;
    }
});
/**/

/**/
let trackedKeys = {
    65: true,
    68: true,
    83: true,
    87: true,
    81: true,
    69: true,
    16: true
};
let keys = {};
let keyDownCount = 0;

document.addEventListener("keydown", function(event) {
    keyDownCount++;

    if (trackedKeys[event.keyCode]) {
        keys[event.keyCode] = true;
    }
});

document.addEventListener("keyup", function(event) {
    keyDownCount--;

    if (trackedKeys[event.keyCode]) {
        keys[event.keyCode] = false;
    }
});
/**/

let program = createProgram(
    gl,
    `
        precision mediump float;
        uniform mat3 u_Model;
        uniform mat3 u_Projection;
        uniform mat3 u_View;
        attribute vec2 a_Vertex;

        void main(void) {
            gl_Position = vec4((u_Model * u_Projection * u_View * vec3(a_Vertex, 1)).xy, 0, 1);
        }
    `,
    `
        precision mediump float;
        uniform vec4 u_Color;

        void main(void) {
            gl_FragColor = u_Color;
        }
    `
);

let vertexAttribute = gl.getAttribLocation(program, "a_Vertex");
let textureCoordinateAttribute = gl.getAttribLocation(program, "a_TextureCoordinate");
let projectionUniform = gl.getUniformLocation(program, "u_Projection");
let modelUniform = gl.getUniformLocation(program, "u_Model");
let viewUniform = gl.getUniformLocation(program, "u_View");
let vertexBuffer = gl.createBuffer();

let rectangles = [];

class Rectangle {
    constructor(position = [0, 0], angle = 0, scale = [1, 1], color = [255, 255, 255]) {
        this.position = position;
        this.angle = angle;
        this.scale = scale;
        this.color = color;
        this.model = [];
        this.calculateModel();
        rectangles.push(this);
    }

    calculateModel() {
        mat3.fromTranslation(this.model, this.position);
        mat3.rotate(this.model, this.model, toRadian(this.angle));
        mat3.scale(this.model, this.model, this.scale);
    }
}

function render() {
    let projection = [zoom / width, 0, 0, 0, zoom / height, 0, 0, 0, 1];
    let view = [1, 0, 0, 0, 1, 0, -cameraPosition[0], -cameraPosition[1], 1];

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(vertexAttribute);
    gl.vertexAttribPointer(vertexAttribute, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);

    (function draw() {
        if (keyDownCount) {
            if (keys[65]) {
                cameraPosition[0] -= cameraSpeed;
            }

            if (keys[68]) {
                cameraPosition[0] += cameraSpeed;
            }

            if (keys[83]) {
                cameraPosition[1] -= cameraSpeed;
            }

            if (keys[87]) {
                cameraPosition[1] += cameraSpeed;
            }

            if (keys[81]) {
                zoom -= zoomSpeed;
            }

            if (keys[69]) {
                zoom += zoomSpeed;
            }

            projection[0] = zoom / width;
            projection[4] = zoom / height;
            view[6] = -cameraPosition[0];
            view[7] = -cameraPosition[1];
        }

        /**/
        gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.viewport(0, 0, width, height);
        gl.useProgram(program);
        gl.uniformMatrix3fv(projectionUniform, false, projection);
        gl.uniformMatrix3fv(viewUniform, false, view);

        for (let a = 0; a < rectangles.length; a++) {
            gl.uniformMatrix3fv(modelUniform, false, rectangles[a].model);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        /**/

        requestAnimationFrame(draw);
    })();
}
