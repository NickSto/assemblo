'use strict';
/* global Crafty, Game, HEAD, CONSENSUS, MAIN, BANK, BASE_SIZE, snap,
          calcConsensus, restartGame, startVideo, assert */
/* exported makeUI, drawPanel, drawLine */

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
  // Run the intro
  Crafty.e('Button')
    .attr({x: HEAD.x + 215, y: HEAD.y+10, w: 70, h: 30})
    .color('#CAC')
    .text('Intro')
    .bind('Click', startVideo);
  // Draw panels, plus a box where the consensus display will be.
  drawPanel({x: CONSENSUS.x, y: CONSENSUS.y, height: BASE_SIZE, width: CONSENSUS.width});
  drawPanel(MAIN);
  drawPanel(BANK);
}

function drawPanel(panel) {
  Crafty.e('Line') // top
    .place(panel.x, panel.y, panel.x+panel.width, panel.y);
  Crafty.e('Line') // bottom
    .place(panel.x, panel.y+panel.height, panel.x+panel.width, panel.y+panel.height);
  Crafty.e('Line') // left
    .place(panel.x, panel.y, panel.x, panel.y+panel.height);
  Crafty.e('Line') // right
    .place(panel.x+panel.width, panel.y, panel.x+panel.width, panel.y+panel.height);
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
    // Skip if the read is below the MAIN panel.
    if (reads[i]._y >= MAIN.y+MAIN.height) {
      continue;
    }
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
    // Skip if the read is below the MAIN panel.
    if (reads[i]._y >= MAIN.y+MAIN.height) {
      continue;
    }
    reads[i].x = reads[i]._x + shiftDist;
  }
  // And update the consensus sequence.
  Game.baseGrid.fill();
  calcConsensus(Game.baseGrid);
}
