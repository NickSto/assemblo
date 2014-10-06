'use strict';
/* global Crafty, Game, MAIN, BASE_SIZE, COLORS, ToyPrng, destroyGame, makeRead */
/* exported runIntro */

var reads_data = [
  {seq:'ATCTATTA', start:0, x:5, y:5},
  {seq:'TATTACTG', start:3, x:0, y:3},
  {seq:'TACTGTTA', start:6, x:3, y:7},
  {seq:'ACTGTTAT', start:7, x:8, y:6},
  {seq:'TGTTATTC', start:9, x:12, y:4},
  {seq:'TTATTCGC', start:11, x:12, y:8},
  {seq:'TATTCGCA', start:12, x:10, y:2},
];

// Pythagorean distance between (xa, ya) and (xb, yb)
function distance(xa, ya, xb, yb) {
  var x_dist = Math.abs(xa - xb);
  var y_dist = Math.abs(ya - yb);
  return Math.sqrt(x_dist*x_dist + y_dist*y_dist);
}

function runIntro() {
  var TIMING = {
    // pause before animation starts
    startDelay: 1000,
    // time between each read starting to move
    interval: 500,
    // how long each read is in flight
    travelTime: 1000,
  };
  destroyGame();

  // Make the reference sequence
  Game.reference = 'ATCTATTACTGTTATTCGCA';
  Game.consensus = Crafty.e('Consensus');
  Game.consensus.length = Game.reference.length;
  for (var i = 0; i < Game.consensus.length; i++) {
    var base = Crafty.e('Base')
      .attr({x: MAIN.x+i*BASE_SIZE, y: MAIN.y, w: BASE_SIZE, h: BASE_SIZE})
      .color(COLORS[Game.reference[i]])
      .text(Game.reference[i]);
    base.letter = Game.reference[i];
    Game.consensus.bases[i] = base;
    Game.consensus.seq[i] = base.letter;
  }

  // Make the reads
  var reads = new Array(reads_data.length);
  for (var i = 0; i < reads_data.length; i++) {
    reads[i] = makeRead(reads_data[i].seq, reads_data[i].start*BASE_SIZE, 0);
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
}
