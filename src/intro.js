'use strict';
/* global Crafty, Game, MAIN, CONSENSUS, BASE_SIZE, COLORS, ToyPrng,
          destroyGame, restartGame, makeRead, drawGrid, destroyAll */
/* exported runIntroAnimation, startVideo */

var reads_data = [
  {seq:'ATCTATTA', start:0, x:5, y:3},
  {seq:'TATTACTG', start:3, x:0, y:1},
  {seq:'TACTGTTA', start:6, x:3, y:5},
  {seq:'ACTGTTAT', start:7, x:8, y:4},
  {seq:'TGTTATTC', start:9, x:12, y:2},
  {seq:'TTATTCGC', start:11, x:12, y:6},
  {seq:'TATTCGCA', start:12, x:10, y:0},
];
var TIMING = {
  // pause before animation starts
  startDelay: 1000,
  // time between each read starting to move
  interval: 500,
  // how long each read is in flight
  travelTime: 1000,
};

function startVideo() {
  window.clearTimeout(Game.timeout);
  destroyGame();
  Crafty.e("Video")
   .attr({w:640, h:400})
   .append("<video id='intro' autoplay src='assets/intro.mp4'></video>")
   .center('xy')
   .addBorder();
  var video = document.getElementById('intro');
  video.onended = runIntroAnimation;
}

function runIntroAnimation() {
  // Cancel any videos or animations that are currently running
  window.clearTimeout(Game.timeout);
  destroyAll('Video');

  // Draw grid, if necessary
  var gridLines = Crafty('Grid').get();
  if (gridLines.length === 0) {
    drawGrid();
  }

  // Make the reference sequence
  Game.reference = 'ATCTATTACTGTTATTCGCA';
  Game.consensus = Crafty.e('Consensus');
  for (var i = 0; i < Game.reference.length; i++) {
    Game.consensus.add(Game.reference[i], i);
  }

  // Make the reads
  var reads = new Array(reads_data.length);
  for (var i = 0; i < reads_data.length; i++) {
    reads[i] = makeRead(reads_data[i].seq, CONSENSUS.x+reads_data[i].start*BASE_SIZE, CONSENSUS.y);
  }
  for (var i = 0; i < reads.length; i++) {
    reads[i].removeComponent('Draggable', false);
    reads[i].addComponent('Tween');
    reads[i].unbind('StopDrag');
  }

  // Animate the reads coming from the reference
  // Randomize the order the reads are animated in
  var index = new Array(reads.length);
  for (var i = 0; i < reads.length; i++) {
    index[i] = i;
  }
  var prng = new ToyPrng(3);
  index = prng.shuffle(index);
  // Animate each read
  var j = 0;
  var animator = function() {
    var x_orig = reads_data[j].start*BASE_SIZE;
    var x_dest = MAIN.x + BASE_SIZE*reads_data[index[j]].x;
    var y_dest = MAIN.y + BASE_SIZE*reads_data[index[j]].y;
    // Calculate flight time based on distance to keep speed constant
    var dist = distance(x_orig, 0, x_dest, y_dest);
    reads[index[j]].tween({x: x_dest, y: y_dest}, 5*Math.floor(dist));
    j++;
  };
  // Schedule the animations
  for (var i = 0; i < reads.length; i++) {
    window.setTimeout(animator, TIMING.startDelay + i*TIMING.interval);
  }
  // After a pause, exit the animation and start the game.
  Game.timeout = window.setTimeout(restartGame, 9500);
}

// Pythagorean distance between (xa, ya) and (xb, yb)
function distance(xa, ya, xb, yb) {
  var x_dist = Math.abs(xa - xb);
  var y_dist = Math.abs(ya - yb);
  return Math.sqrt(x_dist*x_dist + y_dist*y_dist);
}
