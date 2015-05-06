// Not available because we need 
// "use strict";

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
var randomColors = [];
var N_COLORS = 10000;
for (var i = 0; i < 10000; i++) {
  randomColors[i] = getRandomColor();
}

var sourceIndexCount = 0;
var sourceIndexes = {};
function sourceIndex(source) {
  if (!sourceIndexes[source]) {
    sourceIndexes[source] = sourceIndexCount++;
  }
  return sourceIndexes[source];
}


var canvas = document.getElementsByTagName('canvas')[0];
var context = canvas.getContext('2d');

var world = [];
var obj;
function frameClean() {
  update();
  world = {};
}
canvas.requestAnimationFrame ? canvas.requestAnimationFrame(frameClean)  : setInterval(frameClean, 1000 / 60);


var saved = {};
var hooks = {};
for (var attributeName in context) {
  var value = context[attributeName];
  if (typeof(value) === "function") {
    saved[attributeName] = value;
    
    // This beauty will replace the canvas function with a different one,
    // that calls the old function (stored in "saved") and optionally the
    // corresponding hook if there is one. It's like running a piece of
    // code before each call.
    (function(attributeName) {
      context[attributeName] = function() {

        if (attributeName == "save") {
          var caller = arguments.callee.caller.toString()
          var callerIndex = sourceIndex(caller);
          if (!world[callerIndex]) {
            world[callerIndex] = []
          }
          obj = {};
          world[callerIndex].push(obj);
        }
        
        if (hooks[attributeName]) {
          hooks[attributeName].apply(context, arguments);
        }
        saved[attributeName].apply(context, arguments);
      }
    }(attributeName));
  }
}

hooks["save"] = function() {
  obj.minX = Infinity;
  obj.maxX = -Infinity;
  obj.minY = Infinity;
  obj.maxY = -Infinity;
}
hooks["moveTo"] = function(x, y) {
  obj.maxX = Math.max(obj.maxX, x);
  obj.minX = Math.min(obj.minX, x);
  obj.maxY = Math.max(obj.maxY, y);
  obj.minY = Math.min(obj.minY, y);
}
hooks["drawImage"] = function(image, x, y, width, height) {
  hooks["moveTo"](x, y);
  if (width) {
    hooks["moveTo"](x + width, y + height || width);
  }
}
hooks["lineTo"] = hooks["moveTo"];
hooks["restore"] = function() {
  context.globalAlpha = 0.2;
  obj.width = obj.maxX - obj.minX;
  obj.height = obj.maxY - obj.minY;
  obj.size = (obj.width + obj.height) / 2;
  obj.x = (obj.minX + obj.maxX) / 2;
  obj.y = (obj.minY + obj.maxY) / 2;
  var d = context.lineWidth;
  context.fillRect(obj.minX - d, obj.minY - d, obj.width + 2 * d, obj.height + 2 * d);
}

function update() {

}

function putMouseAngle(angle) {
  var width = window.innerWidth;
  var height = window.innerHeight;
  var x = Math.cos(angle) * width;
  var y = Math.sin(angle) * width;
  canvas.onmousemove({clientX: x, clientY: y});
}