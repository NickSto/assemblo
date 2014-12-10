'use strict';
/* global Crafty, Panels, COLORS, BASE_SIZE, NUM_READS, BASES, PARAMS,
          PARAMS_ORDER, ToyPrng, readParameters, randSeq, wgsim, makeUI,
          startVideo, destroyAll */
/* exported startGame, newGame, destroyGame, restartGame, drawGrid */

// Global game state
// Explicitly enumerate all attributes, even when undefined, for clarity.
var Game = {
  consensus: undefined,
  reference: undefined,
  success: undefined,
  prng: new ToyPrng(),
  timeout: undefined,
  baseGrid: new BaseGrid(),
  numReads: 7,
  genomeLength: PARAMS.genomeLength.default,
  readLength: PARAMS.readLength.default,
  errorRate: PARAMS.errorRate.default,
  snpRate: PARAMS.snpRate.default,
  depth: PARAMS.depth.default,
};

// Start the game:
// Initialize Crafty game area, create UI, and generate a new game.
function startGame() {
  console.assert(Panels.head.x === Panels.consensus.x &&
                 Panels.consensus.x === Panels.main.x &&
                 Panels.main.x === Panels.main.x,
                 "Error: panels are not horizontally aligned.");
  Crafty.init(GAME_WIDTH, GAME_HEIGHT);
  makeUI();
  startVideo();
}

/* Generate a new game with a new consensus bar and new reads.
 * If "reference" is provided, use that as a reference sequence.
 * Otherwise, generate a new, random reference as large as can fit in the
 * main game panel.
 * If a "seed" number is provided, use that as the random number generator seed.
 * This can recreate a past game exactly. To give a seed without a reference,
 * just give "undefined" as the reference, i.e. "newGame(undefined, 15);"
 */
function newGame(reference, seed) {
  // Cancel any videos or animations that are currently running.
  window.clearTimeout(Game.timeout);
  destroyAll('Video');
  // Read the parameters in from the input panel.
  Game = readParameters(Game, PARAMS, PARAMS_ORDER);
  // Generate a PRNG seed if not given.
  if (seed === undefined) {
    seed = Date.now();
  }
  console.log('seed: '+seed);
  Game.prng = new ToyPrng(seed);
  // Generate a reference sequence, if none given.
  /// Make reference as long as the consensus panel is wide.
  //TODO: Make it Game.genomeLength long, and change the panel size to fit.
  Game.genomeLength = Math.floor(Panels.consensus.w/BASE_SIZE);
  if (reference === undefined) {
    Game.reference = randSeq(Game.genomeLength);
  } else {
    Game.reference = reference;
  }
  if (Game.consensus) {
    Game.consensus.destroy();
  }
  Game.consensus = makeConsensus(Game.reference.length);
  console.log("Shhh, the answer is "+Game.reference+"!");
  // Generate the reads.
  /// Calculate number of reads required for the desired depth of coverage.
  Game.numReads = Math.round((Game.genomeLength*Game.depth) / Game.readLength);
  var reads = wgsim(Game.reference, NUM_READS, Game.readLength, 1, Game.errorRate);
  for (var i = 0; i < reads.length; i++) {
    var read = makeRead(reads[i], Panels.main.x+i*BASE_SIZE,
                        Panels.bank.y+i*BASE_SIZE);
    // var read = Crafty.e('Read')
    //   .attr({x: Panels.bank.x+i*BASE_SIZE, y: Panels.bank.y+i*BASE_SIZE})
    // read.setSeq(reads[i]);
    read.addBorders('#FFF');
    for (var j = 0; j < read.bases.length; j++) {
      read.bases[j].css('cursor', 'grab');
    }
  }
  Game.baseGrid.fill();
  calcConsensus(Game.baseGrid);
}

// Destroy all game components, but not the UI.
// Removes reads, consensus sequence bar, grid, etc.
function destroyGame() {
  Game.reference = undefined;
  setSuccessIndicator(undefined);
  destroyAll('Read');
}

function restartGame() {
  destroyGame();
  newGame();
}

// Everything that needs to happen once the user has moved a read.
// This is bound to each read's 'StopDrag' event.
function readStopDrag(event) {
  /* jshint validthis:true */
  var main = Panels.main;
  var bank = Panels.bank;
  // Make each read snap to the grid when the user stops moving it.
  this.x = snap(this._x, this._w, main.x, main.x+main.w);
  if (this._y < (main.y+main.h+bank.y-BASE_SIZE)/2) {
    this.y = snap(this._y, this._h, main.y, main.y+main.h);
  } else {
    this.y = snap(this._y, this._h, bank.y, bank.y+bank.h);
  }
  this.defaultDepth();
  // If it's overlapping a read already at that position, undo the dragging
  if (this.hit('Read')) {
    this.x = this.x_last;
    this.y = this.y_last;
    return;
  }
  // Recalculate the consensus and check if it's correct
  Game.baseGrid.fill();
  calcConsensus(Game.baseGrid);
  setSuccessIndicator(checkAnswer());
}

// This is bound to each read's 'StartDrag' event.
function readStartDrag(event) {
  /* jshint validthis:true */
  // Record its original position before dragging.
  this.x_last = this._x;
  this.y_last = this._y;
  // Bring the read above all other reads as it's being dragged.
  this.foreground();
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
    return max - ((max-min) % BASE_SIZE) - size;
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
// Uses a vote system, calculating the most common base at a given position.
// Ties currently go toward the base occurring earliest in BASES.
//TODO: Tie-break better.
function calcConsensus(baseGrid) {
  // New consensus sequence
  var seq = new Array(Game.consensus.length);
  // Create array containing the base counts at each coordinate in the consensus.
  var counts = new Array(Game.consensus.length);
  for (var i = 0; i < counts.length; i++) {
    counts[i] = {};
    for (var j = 0; j < BASES.length; j++) {
      counts[i][BASES[j]] = 0;
    }
  }
  // Visit each read, tallying the base counts.
  for (var i = 0; i < baseGrid.rows.length; i++) {
    if (i >= Panels.main.h/BASE_SIZE) {
      break;
    } 
    var read = baseGrid.rows[i];
    for (var j = 0; j < read.length; j++) {
      counts[j][read[j]]++;
    }
  }
  // Determine the winning base for each coordinate.
  for (var i = 0; i < counts.length; i++) {
    var bestCount = 0;
    var bestBase = 'N';
    for (var base in counts[i]) {
      if (counts[i][base] > bestCount) {
        bestCount = counts[i][base];
        bestBase = base;
      }
    }
    seq[i] = bestBase;
  }
  Game.consensus.counts = counts;
  Game.consensus.seq = seq;
  // Make the displayed bases match the computed data
  Game.consensus.updateBases();
}

// Draw guidelines to show where the snap-to grid is
function drawGrid() {
  var main = Panels.main;
  // draw vertical grid lines
  for (var x = main.x+BASE_SIZE; x < main.x+main.w; x += BASE_SIZE) {
    Crafty.e('Grid')
      .attr({x: x, y: main.y, w: 1, h: main.h});
  }
  // draw horizontal grid lines
  for (var y = main.y+BASE_SIZE; y < main.y+main.h; y += BASE_SIZE) {
    Crafty.e('Grid')
      .attr({x: main.x, y: y, w: main.w, h: 1});
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
  read.bind('StartDrag', readStartDrag);
  return read;
}

// Initialize the consensus sequence at the top of the consensus panel
function makeConsensus(length) {
  var consensus = Crafty.e('Consensus')
    .attr({x:Panels.consensus.x, y:Panels.consensus.y,
           w:length*BASE_SIZE, h:BASE_SIZE});
  for (var i = 0; i < length; i++) {
    consensus.add('N', i);
  }
  return consensus;
}


// Did the user reconstruct the reference perfectly?
function checkAnswer() {
  //TODO: Check that all the reads are on the board (in the main panel).
  // Does the consensus match the actual (reference) sequence?
  if (Game.reference === Game.consensus.seqStr()) {
    return true;
  // Is the consensus full, but incorrect?
  } else if (Game.consensus.seqStr().indexOf('N') === -1) {
    return false;
  } else {
    return undefined;
  }
}


// Show an indicator of success or failure.
function setSuccessIndicator(success) {
  // Create success indicator if it doesn't exist yet.
  if (Game.success === undefined) {
    Game.success = Crafty.e('Button')
      .attr({x: Panels.param.x+10, y: Panels.consensus.y+5,
             w: Panels.param.w-20, h: 30})
      .css('cursor', 'default');
  }
  // When there is no result, show a neutral indicator.
  if (success === undefined) {
    Game.success.color('#CCC').text('...');
  // On success, show a green checkmark.
  } else if (success) {
    Game.success.color('#1A1').text('\u2713');
  // If incorrect, show a red X.
  } else {
    Game.success.color('#F77').text('X');
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
  this.fill = function() {
    // Initialize this.rows
    var totalRows = Math.floor((Panels.main.h+Panels.bank.h) / BASE_SIZE);
    this.rows = new Array(totalRows);
    for (var i = 0; i < this.rows.length; i++) {
      this.rows[i] = [];
    }
    var reads = Crafty('Read').get();
    for (var i = 0; i < reads.length; i++) {
      var bases = reads[i].bases;
      // Determine the row the read is in.
      if (reads[i]._y < Panels.bank.y) {
        // It's in the main panel
        var row = (reads[i]._y-Panels.main.y) / BASE_SIZE;
      } else {
        // It's in the bank panel
        var row = ((reads[i]._y-Panels.bank.y) / BASE_SIZE) +
                  (Panels.main.h/BASE_SIZE);
      }
      for (var j = 0; j < bases.length; j++) {
        var column = (bases[j]._x - Panels.main.x) / BASE_SIZE;
        this.rows[row][column] = bases[j].letter;
      }
    }
    return this;
  };
  this.addRead = function(read) {
    //TODO
  };
  this.removeRead = function(read) {
    //TODO
  };
}
