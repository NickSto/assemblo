'use strict';
/* global Crafty, GAME, HEAD, CONSENSUS, MAIN, BANK, COLORS, BASE_SIZE,
          READ_LENGTH, NUM_READS, randSeq, wgsim, makeUI, startVideo, ToyPrng,
          destroyAll */
/* exported startGame, newGame, destroyGame, restartGame, drawGrid */

// Global game state
var Game = {
  consensus: null,
  reference: null,
  success: null,
  prng: new ToyPrng(),
  timeout: null,
  baseGrid: new BaseGrid(),
};

// Start the game:
// Initialize Crafty game area, create UI, and generate a new game.
function startGame() {
  Crafty.init(GAME.width, GAME.height);
  makeUI();
  startVideo();
}

/* Generate a new game with a new consensus bar and new reads.
 * If "reference" is provided, use that as a reference sequence.
 * Otherwise, generate a new, random reference as large as can fit in the
 * MAIN game panel.
 * If a "seed" number is provided, use that as the random number generator seed.
 * This can recreate a past game exactly. To give a seed without a reference,
 * just give "undefined" as the reference, i.e. "newGame(undefined, 15);"
 */
function newGame(reference, seed) {
  drawGrid();
  // Cancel any videos or animations that are currently running
  window.clearTimeout(Game.timeout);
  destroyAll('Video');
  if (seed === undefined) {
    seed = Date.now();
  }
  console.log('seed: '+seed);
  Game.prng = new ToyPrng(seed);
  if (reference === undefined) {
    // Generate a reference as long as the panel is wide
    Game.reference = randSeq(Math.floor(CONSENSUS.width/BASE_SIZE));
  } else {
    Game.reference = reference;
  }
  Game.consensus = makeConsensus(Game.reference.length);
  console.log("Shhh, the answer is "+Game.reference+"!");
  var reads = wgsim(Game.reference, NUM_READS, READ_LENGTH, 1);
  for (var i = 0; i < reads.length; i++) {
    makeRead(reads[i], MAIN.x+i*BASE_SIZE, BANK.y+i*BASE_SIZE);
  }
  Game.baseGrid.update();
  calcConsensus(Game.baseGrid);
}

// Destroy all game components, but not the UI.
// Removes reads, consensus sequence bar, grid, etc.
function destroyGame() {
  if (Game.consensus !== null) {
    Game.consensus.destroy();
  }
  Game.consensus = null;
  Game.reference = null;
  if (Game.success !== null) {
    Game.success.destroy();
    Game.success = null;
  }
  destroyAll('Read');
  destroyAll('Grid');
}

function restartGame() {
  destroyGame();
  newGame();
}

// Make each read snap to the grid when the user stops moving it.
function readStopDrag(event) {
  /* jshint validthis:true */
  //TODO: keep reads from overlapping
  this.x = snap(this._x, this._w, MAIN.x, MAIN.x+MAIN.width);
  this.y = snap(this._y, this._h, MAIN.y, BANK.y+BANK.height);
  Game.baseGrid.update();
  calcConsensus(Game.baseGrid);
  checkAnswer();
}

// Recalculate an x or y coordinate that is aligned with the grid and
// within the panel borders.
// Calculates the closest grid coordinate to the given one, and makes sure
// the entire width or height of the object fits in the panel area.
function snap(pos, size, min, max) {
  // Is the left/upper side beyond the panel border?
  if (pos < min) {
    return min;
  // Is the right/lower side beyond the last grid line before the border?
  } else if (pos + size > max - (max % BASE_SIZE)) {
    return max - (max % BASE_SIZE) - size;
  // Otherwise, just find the closest grid line and snap to it
  } else {
    var offset = (pos - min) % BASE_SIZE;
    if (offset < BASE_SIZE/2) {
      return pos - offset;
    } else {
      return pos - offset + BASE_SIZE;
    }
  }
}

// Calculate the consensus sequence based on the read alignment.
// All reads must agree on the base in order for it to appear.
// Conflicts appear as 'N', "no data" appears as undefined.
function calcConsensus(baseGrid) {
  var consensus = Game.consensus;
  consensus.seq = new Array(consensus.length);
  // Visit each read, incorporating it into the consensus sequence.
  for (var i = 0; i < baseGrid.rows.length && i < MAIN.height/BASE_SIZE; i++) {
    var read = baseGrid.rows[i];
    for (var j = 0; j < read.length; j++) {
      // Initialize new consensus bases to the first base you see there.
      if (consensus.seq[j] === undefined) {
        consensus.seq[j] = read[j];
      // If the read has a base at this position and it disagrees with the
      // consensus, mark it 'N'.
      } else if (read[j] !== undefined && consensus.seq[j] !== read[j]) {
        consensus.seq[j] = 'N';
      }
    }
  }
  // Fill in the rest with N's
  for (var i = 0; i < consensus.length; i++) {
    if (consensus.seq[i] === undefined) {
      consensus.seq[i] = 'N';
    }
  }
  // Make the displayed bases match the computed data
  consensus.updateBases();
}

// Draw guidelines to show where the snap-to grid is
function drawGrid() {
  // draw vertical grid lines
  for (var x = MAIN.x+BASE_SIZE; x < MAIN.x+MAIN.width; x += BASE_SIZE) {
    Crafty.e('Grid')
      .attr({x: x, y: MAIN.y, w: 1, h: MAIN.height});
  }
  // draw horizontal grid lines
  for (var y = MAIN.y+BASE_SIZE; y < MAIN.y+MAIN.height; y += BASE_SIZE) {
    Crafty.e('Grid')
      .attr({x: MAIN.x, y: y, w: MAIN.width, h: 1});
  }
}

// Make a Read entity with sequence "seq" at a position defined by "x" and "y".
// "x" and "y" are the distance of the top-left corner from the origin of the
// Crafty game (absolute position).
function makeRead(seq, x, y) {
  // Make an invisible entity the size of the entire read, which will
  // be what the user actually clicks and drags. The bases will be
  // behind it and attached to it.
  var read = Crafty.e('Read')
    .attr({x: x, y: y, w: seq.length*BASE_SIZE, h: BASE_SIZE});
  // Make each base in the sequence, attach to the read
  for (var i = 0; i < seq.length; i++) {
    var base = Crafty.e('Base')
      .attr({x: x+i*BASE_SIZE, y: y, w: BASE_SIZE, h: BASE_SIZE})
      .color(COLORS[seq[i]])
      .text(seq[i]);
    base.letter = seq[i];
    read.add(base);
  }
  read.bind('StopDrag', readStopDrag);
  return read;
}

// Initialize the consensus sequence at the top of the CONSENSUS panel
function makeConsensus(length) {
  var consensus = Crafty.e('Consensus');
  for (var i = 0; i < length; i++) {
    consensus.add('N', i);
  }
  return consensus;
}


function checkAnswer() {
  // Did the user reconstruct the reference perfectly?
  // N.B.: This assumes the entire reference is covered by the reads!
  if (Game.reference === Game.consensus.seqStr()) {
    // If there's no success indicator showing yet, make one.
    if (Game.success === null) {
      var btn_width = 50;
      var center = HEAD.x + Math.floor(HEAD.width/2);
      var btn_x = center - Math.floor(btn_width/2);
      Game.success = Crafty.e('Button')
        .attr({x: btn_x, y: HEAD.y+10, w: btn_width, h: 30})
        .color('#1A1')
        .text('\u2713');
    // If there's already a success indicator, make it show success.
    } else {
      Game.success.color('#1A1').text('\u2713');
    }
  // If the consensus is full (no N's) but not correct, show a X indicator.
  } else if (Game.consensus.seqStr().indexOf('N') === -1) {
    if (Game.success === null) {
      var btn_width = 50;
      var center = HEAD.x + Math.floor(HEAD.width/2);
      var btn_x = center - Math.floor(btn_width/2);
      Game.success = Crafty.e('Button')
        .attr({x: btn_x, y: HEAD.y+10, w: btn_width, h: 30})
        .color('#F77')
        .text('X');
    } else {
      Game.success.color('#F77').text('X');
    }
  } else {
    // Not correct. If there's a success indicator, remove it.
    if (Game.success !== null) {
      Game.success.destroy();
      Game.success = null;
    }
  }
}

// Encapsulates a 2D array storing the locations of all bases in all reads on
// the grid.
function BaseGrid() {
  // The actual array
  this.rows = [];
  Object.defineProperty(this, 'length', {
    get: function() { return this.rows.length; },
  });
  // Fill a 2D array with all bases on the grid
  this.update = function() {
    // Initialize this.rows
    var total_rows = Math.floor((MAIN.height+BANK.height) / BASE_SIZE);
    this.rows = new Array(total_rows);
    for (var i = 0; i < this.rows.length; i++) {
      this.rows[i] = [];
    }
    var reads = Crafty('Read').get();
    for (var i = 0; i < reads.length; i++) {
      var bases = reads[i].bases;
      var row = (reads[i]._y-MAIN.y) / BASE_SIZE;
      for (var j = 0; j < bases.length; j++) {
        var column = (bases[j]._x - MAIN.x) / BASE_SIZE;
        this.rows[row][column] = bases[j].letter;
      }
    }
    return this;
  };
  this.addRead = function (read) {
    //TODO
  };
}
