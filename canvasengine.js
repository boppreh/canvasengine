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
var currentObj = {};
var startingTransformation = {scale: 1, offsetX: 0, offsetY: 0};
var transformations = [startingTransformation];
function frameClean() {
    if (world.length > 0) {
        update();
    }
    world = [];
    var transformations = [startingTransformation];
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
    /*
    var player = world[2][0];

    var smallest = {size: Infinity};
    for each (var other in world[1]) {
        if (other && other.size && other.size < smallest.size) {
            smallest = other;
        }
    }
    moveTo(player.x, smallest.x, player.y, smallest.y);
    */
}

function render(obj) {
    var d = context.lineWidth;
    //context.fillRect(currentObj.minX - d / 2, currentObj.minY - d / 2, currentObj.width + d, currentObj.height + d);

    var mass = Math.round(currentObj.size / 3);
    if (mass > 10 && mass < 300) {
        context.globalAlpha = 0.9;
        context.font = mass + "px Ubuntu";
        context.fillStyle = "#FFFFFF";
        context.strokeStyle = "#000000";
        context.lineWidth = 3;
        context.strokeText(mass, currentObj.x, currentObj.y + currentObj.size / 2);
        context.fillText(mass, currentObj.x, currentObj.y + currentObj.size / 2);
    }
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
                    world[callerIndex].push(currentObj);
                    currentObj = {};
                }
                saved[attributeName].apply(context, arguments);
            }
        }(attributeName));
    }
}

hooks["scale"] = function(multiplier) {
    // No support for asymmetric scaling.
    transformations[transformations.length - 1].scale *= multiplier;
}
hooks["translate"] = function(x, y) {
    var t = transformations[transformations.length - 1];
    t.offsetX += x * t.scale;
    t.offsetY += y * t.scale;
}
hooks["save"] = function() {
    currentObj = {};
    currentObj.minX = Infinity;
    currentObj.maxX = -Infinity;
    currentObj.minY = Infinity;
    currentObj.maxY = -Infinity;

    var t = transformations[transformations.length - 1];
    transformations.push({scale: t.scale, offsetX: t.offsetX, offsetY: t.offsetY});
}
hooks["moveTo"] = function(x, y) {
    var t = transformations[transformations.length - 1];
    //console.log(x, y, t.scale);
    //x = x * t.scale + t.offsetX;
    //y = y * t.scale + t.offsetY;

    currentObj.maxX = Math.max(currentObj.maxX, x);
    currentObj.minX = Math.min(currentObj.minX, x);
    currentObj.maxY = Math.max(currentObj.maxY, y);
    currentObj.minY = Math.min(currentObj.minY, y);
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
    currentObj.width = currentObj.maxX - currentObj.minX;
    currentObj.height = currentObj.maxY - currentObj.minY;
    currentObj.size = (currentObj.width + currentObj.height) / 2;
    currentObj.x = (currentObj.minX + currentObj.maxX) / 2;
    currentObj.y = (currentObj.minY + currentObj.maxY) / 2;

    render(currentObj);

    transformations.pop();
}
