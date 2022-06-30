const canvas = document.getElementById('canvas'),
      colors = document.querySelectorAll('#colors > span'),
      clear = document.getElementById('clear'),
      eraser = document.getElementById('btn1_1'),
      input_text = document.getElementById('btn1_2'),
      font_style = document.getElementById('select_font'),
      font_size = document.getElementById('select_size'),
      bold = document.getElementById('customSwitch1'),
      italic = document.getElementById('customSwitch2'),
      upload = document.getElementById('btn1_3'),
      fileInput = document.getElementById('fileInput'),
      draw_curcle = document.getElementById('btn2_1'),
      draw_triangle = document.getElementById('btn2_2'),
      draw_rectangle = document.getElementById('btn2_3'),
      undo = document.getElementById('btn3_1'),
      redo = document.getElementById('btn3_2'),
      download = document.getElementById('btn3_3'),
      dark_mode = document.getElementById('customSwitch3');

//***********************//
//****canvas variable****//
//***********************//
// 畫筆預設
const context = canvas.getContext('2d');
context.lineWidth = 4;
context.strokeStyle = '#000';
context.font = '50px serif';
var shapetype = 'brush_drawing';

var before_shape;
var rect;

//variable for brush drawing
var isDrawing = false;
var input_text_ready = false;
var state = context.getImageData(0, 0, canvas.width, canvas.height);
var ready_to_brush = false

//variable for curcle drawing, triangle drawing
var w = canvas.width,
    h = canvas.height,
    StartPointX,                 /// start points
    StartPointY,
    MouseX,
    MouseY; 

//variable for text input
var hasInput = false,
    ready_to_text = false;

//undo redo variable
var step = -1,
    drawing_history = [];

// 切換顏色
for( let i = 0; i < colors.length; i++ ){
  colors[i].addEventListener('click', function(){
    console.log('ready to brush');
    shapetype = 'brush_drawing';
    //console.log(shapetype);
    //ready_to_brush = true;
    context.strokeStyle = this.className;
    context.globalCompositeOperation = 'source-over';
    document.getElementsByTagName("body")[0].style.cursor = "url('cursor/brush.png'), auto";
  }, false);
}

var slider = document.getElementById("slider_range");
var output = document.getElementById("show_value");
output.innerHTML = "brush size: " + parseInt(slider.value); // Display the default slider value
// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = "brush size: " + parseInt(slider.value);
  context.lineWidth = slider.value;
}

draw_curcle.onclick = function(){
  console.log('ready to draw curcle');
  shapetype = 'circle';
  document.getElementsByTagName("body")[0].style.cursor = "url('cursor/icons8-circle-24.png'), auto";
  //ready_to_curcle = true;
  context.globalCompositeOperation = 'source-over';
}

draw_triangle.onclick = function(){
  console.log('ready to draw triangle');
  shapetype = 'triangle';
  document.getElementsByTagName("body")[0].style.cursor = "url('cursor/triangle.png'), auto";
  context.globalCompositeOperation = 'source-over';
}

draw_rectangle.onclick = function(){
  console.log('ready to draw rectangle');
  shapetype = 'rectangle';
  document.getElementsByTagName("body")[0].style.cursor = "url('cursor/rectangle.png'), auto";
  context.globalCompositeOperation = 'source-over';
}

eraser.onclick = function(){
  shapetype = 'eraser';
  document.getElementsByTagName("body")[0].style.cursor = "url('cursor/Eraser-2-icon.png'), auto";
  context.globalCompositeOperation = 'destination-out';
}

// reset
clear.addEventListener('click', function(){
  context.clearRect(0, 0, w, h);
}, false);

canvas.onmousedown = function(e) { 
  if(shapetype == 'brush_drawing'){
    isDrawing = true;
    ready_to_text = false; 
    console.log("in brush zone");
    canvas.removeEventListener("mousemove", triangle_drawing, false);
    canvas.removeEventListener("mousemove", circle_drawing, false);
    canvas.removeEventListener("mousemove", rectangle_drawing, false);
    canvas.removeEventListener("mousemove", eraser_drawing, false);
    canvas.addEventListener('mousemove', brush_drawing,   false);
    context.beginPath();
    context.moveTo(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
  }
  else if ( shapetype == 'circle' ) {
    isDrawing = true;
    ready_to_text = false; 
    console.log("in draw circle zone");
    canvas.removeEventListener("mousemove", brush_drawing, false);
    canvas.removeEventListener("mousemove", triangle_drawing, false);
    canvas.removeEventListener("mousemove", rectangle_drawing, false);
    canvas.removeEventListener("mousemove", eraser_drawing, false);
    canvas.addEventListener("mousemove", circle_drawing, false);
    before_shape = canvas.toDataURL();
  } 
  else if ( shapetype == 'triangle' ){
    isDrawing = true;
    ready_to_text = false; 
    console.log("in draw triangle zone");
    canvas.removeEventListener("mousemove", brush_drawing, false);
    canvas.removeEventListener("mousemove", circle_drawing, false);
    canvas.removeEventListener("mousemove", rectangle_drawing, false);
    canvas.removeEventListener("mousemove", eraser_drawing, false);
    canvas.addEventListener("mousemove", triangle_drawing, false);
    before_shape = canvas.toDataURL();
  }
  else if(shapetype == 'rectangle'){
    isDrawing = true;
    ready_to_text = false; 
    console.log("in draw rectangle zone");
    canvas.removeEventListener("mousemove", brush_drawing, false);
    canvas.removeEventListener("mousemove", circle_drawing, false);
    canvas.removeEventListener("mousemove", triangle_drawing, false);
    canvas.removeEventListener("mousemove", eraser_drawing, false);
    canvas.addEventListener("mousemove", rectangle_drawing, false);
    before_shape = canvas.toDataURL();
  }
  else if(shapetype == 'eraser'){
    isDrawing = true;
    ready_to_text = false; 
    console.log("in eraser zone");
    canvas.removeEventListener("mousemove", brush_drawing, false);
    canvas.removeEventListener("mousemove", circle_drawing, false);
    canvas.removeEventListener("mousemove", triangle_drawing, false);
    canvas.removeEventListener("mousemove", rectangle_drawing, false);
    canvas.addEventListener('mousemove', eraser_drawing,   false);
    context.beginPath();
    context.moveTo(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
  }
  else{
    console.log("in unknown zone");
    //console.log(ready_to_text);
  } 
  rect = canvas.getBoundingClientRect();
  StartPointX = e.clientX - rect.left;
  StartPointY = e.clientY - rect.top;      
};

function brush_drawing(e){
  if(isDrawing){
    context.lineTo(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
    context.stroke();
  }
}

function circle_drawing(e){
  if(isDrawing){
    rect = canvas.getBoundingClientRect(),
    MouseX = e.clientX - rect.left,
    MouseY = e.clientY - rect.top;
    var radiusX = (MouseX - StartPointX) * 0.5,   /// radius for x based on input
        radiusY = (MouseY - StartPointY) * 0.5,
        centerX = StartPointX + radiusX,      /// calc center
        centerY = StartPointY + radiusY,
        step = 0.01,                 /// resolution of ellipse
        a = step,                    /// counter
        pi2 = Math.PI * 2 - step;    /// end angle
    let before = new Image();
    before.src = before_shape;
    before.onload = function(){
      context.beginPath();
      context.clearRect(0, 0, w, h);
      context.drawImage(before,0,0);
      context.moveTo(centerX + radiusX * Math.cos(0), centerY + radiusY * Math.sin(0));
      /// create the ellipse    
      for(; a < pi2; a += step)
        context.lineTo(centerX + radiusX * Math.cos(a), centerY + radiusY * Math.sin(a));
      context.stroke();
      context.closePath();
    }
  }
}

function triangle_drawing(e){
  if(isDrawing){
    MouseX = e.offsetX;
    MouseY = e.offsetY;
    var twidth = Math.abs(MouseX - StartPointX);
    let before = new Image();
    before.src = before_shape;
    before.onload = function(){
      context.beginPath();
      context.clearRect(0, 0, w, h);
      context.drawImage(before,0,0);
      context.lineJoin = context.lineCap = 'round';
      context.moveTo(StartPointX, StartPointY );
      context.lineTo(MouseX, MouseY);
      if(MouseX >= StartPointX)
        context.moveTo(MouseX-(2*twidth), MouseY );
      else
        context.moveTo(MouseX+(2*twidth), MouseY );
      context.lineTo(MouseX, MouseY);
      context.moveTo(StartPointX, StartPointY );
      if(MouseX >= StartPointX)
        context.lineTo(MouseX-(2*twidth), MouseY);
      else
        context.lineTo(MouseX+(2*twidth), MouseY);
      context.stroke();
      context.closePath();
    }
  }
}

function rectangle_drawing(e){
  if(isDrawing){
    let before = new Image();
    before.src = before_shape;
    MouseX = parseInt(e.clientX-canvas.offsetLeft);
    MouseY = parseInt(e.clientY-canvas.offsetTop);
    before.onload = function(){
      context.beginPath(); 
      context.clearRect(0,0,w,h);
      context.drawImage(before,0,0);
      context.strokeRect(StartPointX, StartPointY, MouseX-StartPointX, MouseY-StartPointY);
      context.closePath();
    }
  }
}

function eraser_drawing(e){
  if(isDrawing){
    context.lineTo(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
    context.stroke();
  }
}

canvas.onmouseup = function(){
  if(shapetype == 'brush_drawing') {
    console.log("finish brush drawing");
    //shapetype = 'unknown';
    //console.log(shapetype);
    isDrawing = false;
    push();
    console.log(step);
    //ready_to_brush = false;
    //cPush();
    //console.log("call cpush");
  }
  else if(shapetype == 'circle'){
    console.log("finish circle drawing");
    isDrawing = false;
    push();
  }
  else if(shapetype == 'triangle'){
    console.log("finish triangle drawing");
    isDrawing = false;
    push();
  }
  else if(shapetype == 'rectangle'){
    console.log("finish rectangle drawing");
    isDrawing = false;
    push();
  }
  else if(shapetype == 'eraser'){
    console.log("finish eraser drawing");
    isDrawing = false;
    push();
  }
  else{
    console.log("mouse up with unknown shapetype");
    //console.log(ready_to_text);
  }
};

//**********************************************//
//**********input text function block***********//
//**********************************************//
input_text.onclick = function(e){
  ready_to_text = true;
  shapetype = 'unknown';
  document.getElementsByTagName("body")[0].style.cursor = "text";
  context.globalCompositeOperation = 'source-over';
  console.log("ready to text");
  //console.log(ready_to_text);
}

canvas.onclick = function(e) {
  if (hasInput || !ready_to_text) return;
  rect = canvas.getBoundingClientRect();
  StartPointX = e.clientX - rect.left;
  StartPointY = e.clientY - rect.top;
  addInput(e.clientX, e.clientY);
}

//Function to dynamically add an input box: 
function addInput(x, y) {

  var input = document.createElement('input');

  input.type = 'text';
  input.style.position = 'fixed';
  input.style.left = x + 'px';
  input.style.top = (y - 15) + 'px';

  input.onkeydown = handleEnter;

  document.body.appendChild(input);

  input.focus();

  hasInput = true;
}

//Key handler for input box:
function handleEnter(e) {
  var keyCode = e.keyCode;
  if (keyCode === 13) {
      drawText(this.value);
      document.body.removeChild(this);
      hasInput = false;
  }
}

//Draw the text onto canvas:
function drawText(txt) {
  context.textBaseline = 'top';
  context.textAlign = 'left';
  context.fillStyle = context.strokeStyle;
  if(!bold.checked && !italic.checked)
    context.font = font_size.value + 'px ' + font_style.value;
  else if(bold.checked && !italic.checked)
    context.font = 'bold ' + font_size.value + 'px ' + font_style.value;
  else if(!bold.checked && italic.checked)
    context.font = 'italic ' + font_size.value + 'px ' + font_style.value;
  else
    context.font = 'italic bold ' + font_size.value + 'px ' + font_style.value;
  console.log(context.font);
  context.fillText(txt, StartPointX, StartPointY);
  push();
}

//***********************//
//***undo function block***//
//***********************//
function push() {
  step++;
  if (step < drawing_history.length - 1) 
    drawing_history.length = step + 1;
  drawing_history.push(canvas.toDataURL()); //當前影像存成 Base64 編碼的字串並放入陣列
}

undo.onclick = function() {
  console.log("in undo");
  document.getElementsByTagName("body")[0].style.cursor = "pointer";
  if (step > 0) {
    console.log(step);
    step--;
    let before = new Image(); //建立新的 Image
    before.src = drawing_history[step]; //載入剛剛存放的影像
    before.onload = function() {
      context.clearRect(0, 0, w, h);
      context.drawImage(before, 0, 0) //匯出影像並從座標 x:0 y:0 開始
    }
  }
  else if(step == 0){
    console.log("step = 0");
    context.clearRect(0, 0, w, h);
    step--;
  }
  else
    console.log("undo impossible");
}

redo.onclick = function(){
  console.log("in redo");
  document.getElementsByTagName("body")[0].style.cursor = "pointer";
  if(step < drawing_history.length-1){
    step++;
    let after = new Image();
    after.src = drawing_history[step];
    after.onload = function(){
      context.clearRect(0, 0, w, h);
      context.drawImage(after, 0, 0);
    }
  }
  else
    console.log("redo impossible");
}

//***********************//
//***download function block***//
//***********************//
download.onclick = function(){
  document.getElementsByTagName("body")[0].style.cursor = "pointer";
  canvas.toBlob((blob) => {
    let url = URL.createObjectURL(blob); // 從回傳的 Blob 物件建立 Blob URL
    let imgDl = document.createElement("a"); // 建立一個連結物件 <a></a>
    imgDl.href = url; // <a href="url"></a>
    imgDl.download = "my canvas file.png"; // 存成的檔名 <a href="url" download="filename""></a>
    imgDl.click(); // 對連結物件點擊
    URL.revokeObjectURL(url); // GC
  }, "image/png");
}


upload.addEventListener("click", fileInputClick, false);
fileInput.addEventListener("change", handleImage, false);

function fileInputClick(e) {
  fileInput.click();
  document.getElementsByTagName("body")[0].style.cursor = "pointer";
}

function handleImage(e){
  //console.log("here");
  var reader = new FileReader();
  reader.onload = function(event){
      var img = new Image();
      img.onload = function(){
          img.width = w/100;
          img.height = h/100;
          //canvas.width = img.width;
          //canvas.height = img.height;
          context.drawImage(img,(w - img.width)/2,10);
      }
      img.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);     
}

//dark mode
dark_mode.onclick = function(){
  if(dark_mode.checked){
    console.log("dark mode on");
    document.body.classList.toggle("dark-mode");
    canvas.style = "border:1px solid #5a13b6;";
    document.getElementById('img1_1').src='image/dark_mode/eraser.png';
    document.getElementById('img1_2').src='image/dark_mode/keyboard.png';
    document.getElementById('img1_3').src='image/dark_mode/upload.png';
    document.getElementById('img2_1').src='image/dark_mode/circle.png';
    document.getElementById('img2_2').src='image/dark_mode/triangle.png';
    document.getElementById('img2_3').src='image/dark_mode/rectangle.png';
    document.getElementById('img3_1').src='image/dark_mode/undo.png';
    document.getElementById('img3_2').src='image/dark_mode/redo.png';
    document.getElementById('img3_3').src='image/dark_mode/download.png';
    document.getElementById('img5_1').src='image/dark_mode/photo_camera.png';
    document.getElementById('img5_2').src='image/dark_mode/add_a_photo.png';
    document.getElementById('img5_3').src='image/dark_mode/play_circle_filled.png';
  }
  else{
    console.log("dark mode off");
    document.body.classList.toggle("light-mode");
    canvas.style = "border:1px solid #000;";
    document.getElementById('img1_1').src='image/eraser.png';
    document.getElementById('img1_2').src='image/keyboard.png';
    document.getElementById('img1_3').src='image/upload.png';
    document.getElementById('img2_1').src='image/circle.png';
    document.getElementById('img2_2').src='image/triangle.png';
    document.getElementById('img2_3').src='image/rectangle.png';
    document.getElementById('img3_1').src='image/undo.png';
    document.getElementById('img3_2').src='image/redo.png';
    document.getElementById('img3_3').src='image/download.png';
    document.getElementById('img5_1').src='image/photo_camera.png';
    document.getElementById('img5_2').src='image/add_a_photo.png';
    document.getElementById('img5_3').src='image/play_circle_filled.png';
  }
}

//camera
let camera_button = document.querySelector("#start-camera");
let video = document.querySelector("#video");
let click_button = document.querySelector("#click-photo");

camera_button.addEventListener('click', async function() {
  let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
	video.srcObject = stream;
});

click_button.addEventListener('click', function() {
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  push();
});