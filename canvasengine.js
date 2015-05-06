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
var obj = {};
var currentScale = 1;
var offsetX = 0;
var offsetY = 0;
function frameClean() {
  if (world.length > 0) {
    update();
  }
  world = [];
  currentScale = 1;
  offsetX = 0;
  offsetY = 0;
}
canvas.requestAnimationFrame ? canvas.requestAnimationFrame(frameClean)  : setInterval(frameClean, 1000 / 60);

function moveTo(dx, dy) {
  var angle = Math.atan2(dy, dx);
  var width = window.innerWidth;
  var height = window.innerHeight;
  var x = Math.cos(angle) * width;
  var y = Math.sin(angle) * width;
  canvas.onmousemove({clientX: x, clientY: y});
}

function update() {
  var player = world[2][0];

  var smallest = {size: Infinity};
  for each (var other in world[1]) {
    if (other && other.size && other.size < smallest.size) {
      smallest = other;
    }
  }
  moveTo(smallest.x - player.x, smallest.y - player.y);
}

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
        if (hooks[attributeName]) {
          hooks[attributeName].apply(context, arguments);
        }
        if (attributeName == "restore") {
          var caller = arguments.callee.caller.toString()
          var callerIndex = sourceIndex(caller);
          if (!world[callerIndex]) {
            world[callerIndex] = []
          }
          world[callerIndex].push(obj);
          obj = {};
        }
        saved[attributeName].apply(context, arguments);
      }
    }(attributeName));
  }
}

hooks["scale"] = function(multiplier) {
  // No support for asymmetric scaling.
  currentScale *= multiplier;
}
hooks["translate"] = function(x, y) {
  offsetX += x * currentScale;
  offsetY += y * currentScale;
}
hooks["save"] = function() {
  obj = {};
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
  context.fillRect(obj.minX - d / 2, obj.minY - d / 2, obj.width + d, obj.height + d);

  obj.screenX = (obj.x * currentScale) - offsetX;
  obj.screenY = (obj.y * currentScale) - offsetY;
}