'use strict';
/* global Crafty, Game, MAIN, BASE_SIZE, COLORS, destroyGame, makeRead */
/* exported runIntro */

function runIntro() {
  var TIMING = {
    // pause before animation starts
    startDelay: 1000,
    // time between each read starting to move
    interval: 500,
    // how long each read is in flight
    travelTime: 1000,
  };
  // var prng = new ToyPrng();
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
  var reads = [];
  reads.push(makeRead('ATCTATTA', 0, 0));
  reads.push(makeRead('TATTACTG', 3*BASE_SIZE, 0));
  reads.push(makeRead('TACTGTTA', 6*BASE_SIZE, 0));
  reads.push(makeRead('ACTGTTAT', 7*BASE_SIZE, 0));
  reads.push(makeRead('TGTTATTC', 9*BASE_SIZE, 0));
  reads.push(makeRead('TTATTCGC', 11*BASE_SIZE, 0));
  reads.push(makeRead('TATTCGCA', 12*BASE_SIZE, 0));
  for (var i = 0; i < reads.length; i++) {
    reads[i].removeComponent('Draggable', false);
    reads[i].addComponent('Tween');
  }
  // Animate the reads coming from the reference
  // animator is an array of functions, each one moving one read
  var animator = [
    function() {
      reads[4].z = 20;
      reads[4].tween({x: MAIN.x+BASE_SIZE*12, y: MAIN.y+BASE_SIZE*4},
        TIMING.travelTime);
    },
    function() {
      reads[2].z = 20;
      reads[2].tween({x: MAIN.x+BASE_SIZE*3,  y: MAIN.y+BASE_SIZE*7},
        TIMING.travelTime);
    },
    function() {
      reads[1].z = 20;
      reads[1].tween({x: MAIN.x+BASE_SIZE*0,  y: MAIN.y+BASE_SIZE*3},
        TIMING.travelTime);
    },
    function() {
      reads[3].z = 20;
      reads[3].tween({x: MAIN.x+BASE_SIZE*8,  y: MAIN.y+BASE_SIZE*6},
        TIMING.travelTime);
    },
    function() {
      reads[0].z = 20;
      reads[0].tween({x: MAIN.x+BASE_SIZE*5,  y: MAIN.y+BASE_SIZE*5},
        TIMING.travelTime);
    },
    function() {
      reads[6].z = 20;
      reads[6].tween({x: MAIN.x+BASE_SIZE*12, y: MAIN.y+BASE_SIZE*8},
        TIMING.travelTime);
    },
    function() {
      reads[5].z = 20;
      reads[5].tween({x: MAIN.x+BASE_SIZE*10, y: MAIN.y+BASE_SIZE*2},
        TIMING.travelTime);
    },
  ];
  for (var i = 0; i < animator.length; i++) {
    console.log('scheduling animator['+i+'] for '+(TIMING.startDelay+i*TIMING.interval)+'ms');
    window.setTimeout(animator[i], TIMING.startDelay + i*TIMING.interval);
  }
}
