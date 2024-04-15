// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Vars
let canvas;
let gl;
let a_Position;
let u_Size;
let u_FragColor;


// Classes

class Point{
    constructor(){
        this.type = "point";
        this.position = [0.0,0.0,0.0];
        this.color = [1.0,1.0,1.0,1.0];
        this.size = 5.0;
    }

    render() {
        var xy = this.position
        var rgba = this.color;
        var size = this.size;
        
        gl.disableVertexAttribArray(a_Position);
        // Pass the position of a point to a_Position variable
        gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Pass the size of a point to u_Size variable
        gl.uniform1f(u_Size,size);

        // Draw
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}

class Triangle{
    constructor(){
        this.type="triangle"
        this.position = [0.0,0.0,0.0];
        this.color = [1.0,1.0,1.0,1.0];
        this.size = 5.0;
    }

    render(){
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

               // Pass the color of a point to u_FragColor variable
               gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
               // Pass the size of a point to u_Size variable
               gl.uniform1f(u_Size,size);
       
               // Draw
               var d = this.size/200.0
               drawTriangle( [xy[0]-d,xy[1],xy[0]+d,xy[1],xy[0],xy[1]+2*d])
    }
}

class Circle{
    constructor(){
        this.type = "circle";
        this.position = [0.0,0.0,0.0];
        this.color = [1.0,1.0,1.0,1.0];
        this.size = 5.0;
        this.segments = g_segmentCount;
    }

    render(){
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        // Draw
        
        var d = this.size/200.0
               
        let angleStep = 360/this.segments;
            for(var angle = 0; angle < 360; angle=angle+angleStep){
                let centerPt = [xy[0],xy[1]];
                let angle1=angle;
                let angle2=angle+angleStep;
                let vec1=[Math.cos(angle1*Math.PI/180)*d,Math.sin(angle1*Math.PI/180)*d]
                let vec2=[Math.cos(angle2*Math.PI/180)*d,Math.sin(angle2*Math.PI/180)*d]
                let pt1 = [centerPt[0]+vec1[0],centerPt[1]+vec1[1]];
                let pt2 = [centerPt[0]+vec2[0],centerPt[1]+vec2[1]];
            
                drawTriangle( [xy[0],xy[1],pt1[0],pt1[1],pt2[0],pt2[1]])
            }

               
    }
}

function drawTriangle(vertices){
    var n = 3;

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer){
        console.log("Failed to ceate the buffer object");
        return -1
    }

    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW)


    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES,0,n);
}


function setupWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById("asg1");

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function connectVariablesToGLSL(){

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
      }
    
      // // Get the storage location of a_Position
      a_Position = gl.getAttribLocation(gl.program, 'a_Position');
      if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
      }
    
      // Get the storage location of u_FragColor
      u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
      if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
      }

      u_Size = gl.getUniformLocation(gl.program,'u_Size');
      if (!u_Size) {
        console.log("Failed to get the storage location of u_Size");
        return;
      }
}

function convertCoordinatesEventToGL(ev){

    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y]);
}

var g_shapesList = []

function renderAllShapes(){

    //var startTime = performance.now();

    // Clear <canvas>
    //gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;

    for(var i = 0; i < len; i++) {
        g_shapesList[i].render()
    }

    //var duration = performance.now() - startTime;
    //sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "numdot");

}

/*
function sendTextToHTML(text,htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}*/

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global Variables
let g_selectedColor=[1.0,1.0,1.0,1.0]
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_segmentCount = 10;

let fancymode = false;

function addActionsForHtmlUI(){
    
    document.getElementById("clear").onclick = function() { g_shapesList = []; gl.clear(gl.COLOR_BUFFER_BIT);};
    document.getElementById("fancy").onclick = function() { fancy();};
    document.getElementById("picture").onclick = function() { drawPicture();};

    document.getElementById("point").onclick = function() { g_selectedType = POINT };
    document.getElementById("triangle").onclick = function() { g_selectedType = TRIANGLE };
    document.getElementById("circle").onclick = function() { g_selectedType = CIRCLE };

    document.getElementById("redSlide").addEventListener('mouseup',function() {g_selectedColor[0] = this.value/100; })
    document.getElementById("greenSlide").addEventListener('mouseup',function() {g_selectedColor[1] = this.value/100; })
    document.getElementById("blueSlide").addEventListener('mouseup',function() {g_selectedColor[2] = this.value/100; })



    document.getElementById("sizeSlide").addEventListener('mouseup',function() {g_selectedSize = this.value})
    document.getElementById("segmentSlide").addEventListener('mouseup',function() {g_segmentCount = this.value})
}

function drawPicture(){
    console.log("Drawing picture...")
    
    gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
    drawTriangle([0.25,0,-0.25,0,0,0.5])
    gl.uniform4f(u_FragColor, .5, .5, .5, 1.0);
    drawTriangle([0.22,.03,-0.22,.03,0,0.47])
    gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
    drawTriangle([0.20,.03,-0.20,.03,0,0.42])


    gl.uniform4f(u_FragColor, .5, .5, .5, 1.0);
    drawTriangle([-1,-.12,-1,-.24,-0.14,.2])
    gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
    drawTriangle([-1,0,-0.14,.2,-1,-.12])


    gl.uniform4f(u_FragColor, .5, .5, .5, 1.0);
    drawTriangle([-0.14,.2,0,.12,0,.25])
    gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
    drawTriangle([-0.14,.2,0,.15,0,.25])

    gl.uniform4f(u_FragColor, 1.0, 0, 0, 1.0);
    drawTriangle([0.14,.2,1,0,1,.05])
    gl.uniform4f(u_FragColor, 1.0, .55, 0, 1.0);
    drawTriangle([0.14,.2,1,0,1,-.05])
    gl.uniform4f(u_FragColor, 1.0, .75, 0, 1.0);
    drawTriangle([0.14,.2,1,-.05,1,-.1])
    gl.uniform4f(u_FragColor, 0, 1.0, 0, 1.0);
    drawTriangle([0.14,.2,1,-.1,1,-.15])
    gl.uniform4f(u_FragColor, 0, 0, 1, 1.0);
    drawTriangle([0.14,.2,1,-.15,1,-.2])
    gl.uniform4f(u_FragColor, .5, 0, 1, 1.0);
    drawTriangle([0.14,.2,1,-.2,1,-.25])
    
    gl.uniform4f(u_FragColor, 1.0, 0, 0, 1.0);
    drawTriangle([1,1,1,-1,.95,1])
    gl.uniform4f(u_FragColor, 1.0, .55, 0, 1.0);
    drawTriangle([.95,1,1,-1,.95,-1])

    gl.uniform4f(u_FragColor, 0, 0, 1, 1.0);
    drawTriangle([-1,-1,-1,1,-.95,-1])
    gl.uniform4f(u_FragColor, .5, 0, 1, 1.0);
    drawTriangle([-.95,-1,-1,1,-.95,1])

    gl.uniform4f(u_FragColor, 0, 0, 1, 1.0);
    drawTriangle([-1,-1,1,-1,-1,-.95])
    gl.uniform4f(u_FragColor, .5, 0, 1, 1.0);
    drawTriangle([-1,-.95,1,-1,1,-.95])

    gl.uniform4f(u_FragColor, 1.0, 0, 0, 1.0);
    drawTriangle([1,1,-1,1,1,.95])
    gl.uniform4f(u_FragColor, 1.0, .55, 0, 1.0);
    drawTriangle([1,.95,-1,1,-1,.95])


    //drawTriangle([-0.14,.2,0,.15,0,.25])


}


function main() {

  // Sets up canvas and gl vars
  setupWebGL();
  // Set up GLSL shader programs
  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) {click(ev) }}

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

// Relating to FancymodeTM
var cheer = new Audio("assets/clapping.wav");

function click(ev) {

    if(fancymode){
        cheer.play();
    }

    [x,y] = convertCoordinatesEventToGL(ev);
    let point;
    console.log(g_selectedType)
    if (g_selectedType == POINT){
        point =  new Point();
    }else if(g_selectedType == TRIANGLE) {
        point = new Triangle();
    }else{
        point = new Circle();
    }

    point.position = [x,y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_shapesList.push(point);

    renderAllShapes();

}


// Some of this was informed by tutorials on w3schools.com //
function fancy(){
    console.log("Fancy Mode Activated");
    if(fancymode){
        return;
    }

    fancymode = true;
    document.getElementById("orchestra").src = "assets/curtains_up.gif";
    
    // Preloading image
    var play = new Image();
    play.src = "assets/orchestra.gif";

    var clapping = new Audio("assets/clapping.wav");
    clapping.play();
    var bach = new Audio("assets/bach.mp4")

    setTimeout(function() {document.getElementById("orchestra").src = play.src; bach.play();},5000)

}
