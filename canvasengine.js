"use strict";

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


var canvas = document.getElementsByTagName('canvas')[0]
var context = canvas.getContext('2d');

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
        saved[attributeName].apply(context, arguments);
      }
    }(attributeName));
  }
}


var obj;
hooks["save"] = function() {
  obj = {minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity};
}
hooks["moveTo"] = function(x, y) {
  obj.maxX = Math.max(obj.maxX, x);
  obj.minX = Math.min(obj.minX, x);
  obj.maxY = Math.max(obj.maxY, y);
  obj.minY = Math.min(obj.minY, y);
}
hooks["lineTo"] = hooks["moveTo"];
hooks["restore"] = function() {
  context.globalAlpha = 0.2;
  context.fillRect(obj.minX, obj.minY, obj.maxX - obj.minX, obj.maxY - obj.minY);
}
