'use strict';
/* global Crafty, MAIN, HEAD, BASE_SIZE, snap, calcConsensus, getBaseGrid,
          restartGame, startVideo, assert */
/* exported makeUI */

// Make buttons, icons, controls, etc.
function makeUI() {
  // The shift buttons
  Crafty.e('Button')
    .attr({x: HEAD.x, y: HEAD.y+10, w: 50, h: 30})
    .color('#CCC')
    .text('<')
    .bind('Click', shiftLeft);
  Crafty.e('Button')
    .attr({x: HEAD.width - 50, y: HEAD.y+10, w: 50, h: 30})
    .color('#CCC')
    .text('>')
    .bind('Click', shiftRight);
  // Restart the game
  Crafty.e('Button')
    .attr({x: HEAD.x + 60, y: HEAD.y+10, w: 145, h: 30})
    .color('#ACC')
    .text('New Game')
    .bind('Click', restartGame);
  // Run the intro animation
  //TODO: Make it happen at the beginning!
  Crafty.e('Button')
    .attr({x: HEAD.x + 215, y: HEAD.y+10, w: 70, h: 30})
    .color('#CAC')
    .text('Intro')
    .bind('Click', startVideo);
  drawPanel(MAIN);
}

function drawPanel(panel) {
  // top
  drawLine(panel.x, panel.y, panel.x+panel.width, panel.y);
  // bottom
  drawLine(panel.x, panel.y+panel.height, panel.x+panel.width, panel.y+panel.height);
  // left
  drawLine(panel.x, panel.y, panel.x, panel.y+panel.height);
  // right
  drawLine(panel.x+panel.width, panel.y, panel.x+panel.width, panel.y+panel.height);
}

// Use Canvas to draw a 1px wide line from (x1, y1) to (x2, y2).
// The line must be horizontal or vertical, no diagonals.
function drawLine(x1, y1, x2, y2, color) {
  if (color === undefined) {
    color = '#DDD';
  }
  var line = Crafty.e('2D, Canvas, Color').color(color);
  if (x1 === x2) {
    var y = Math.min(y1, y2);
    var height = Math.abs(y1 - y2);
    line.attr({x: x1, y: y, w: 1, h: height});
  } else if (y1 === y2) {
    var x = Math.min(x1, x2);
    var width = Math.abs(x1 - x2);
    line.attr({x: x, y: y1, w: width, h: 1});
  } else {
    line.destroy();
    assert(false, 'Error: Cannot draw a diagonal line.');
  }
  return line;
}

// Shift left by one grid increment
function shiftLeft() {
  shift(-BASE_SIZE);
}
// Shift right by one grid increment
function shiftRight() {
  shift(BASE_SIZE);
}
// Shift all reads "shiftDist" pixels
function shift(shiftDist) {
  var reads = Crafty('Read').get();
  // Check if there's room to move everything in that direction.
  //TODO: optimize if necessary by combining this check and the actual move loop
  for (var i = 0; i < reads.length; i++) {
    var new_x = reads[i]._x + shiftDist;
    var snapped_x = snap(new_x, reads[i]._w, MAIN.x, MAIN.x+MAIN.width);
    // If snap() says the new_x must be modified, then we must be butting up
    // against the edge of the game area. Abort shift.
    if (new_x !== snapped_x) {
      return;
    }
  }
  // Now loop again, but actually shift everything.
  for (var i = 0; i < reads.length; i++) {
    reads[i].x = reads[i]._x + shiftDist;
  }
  // And update the consensus sequence.
  Game.baseGrid.update();
  calcConsensus(Game.baseGrid);
}
