'use strict';
/* global Crafty, Panels, GAME_WIDTH, GAME_HEIGHT, COLORS, BASES, PARAMS_ORDER,
          PARAMS, ToyPrng, readParameters, randSeq, wgsim, makeUI, startVideo */
/* exported Game, startGame, newGame, makeConsensus, drawGrid */

// Global game state
// Explicitly enumerating all attributes, even when undefined, for clarity.
var Game = {
  cell: 41, // defines size of squares on the grid
  numReads: 7,
  consensus: undefined,
  reference: undefined,
  success: undefined,
  prng: undefined,
  timeout: undefined,
  baseGrid: undefined,
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
  // Mark the point in the history that the user started at.
  window.history.replaceState({first:true},
                              document.getElementsByTagName('title')[0].text);
  if (window.location.hash === '') {
    startVideo();
  } else {
    makeUI();
    newGame();
  }
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
  // Cancel any videos or animations that are currently scheduled.
  window.clearTimeout(Game.timeout);
  // Read the parameters in from the input panel.
  Game = readParameters(Game);
  /// Calculate number of reads required for the desired depth of coverage.
  Game.numReads = Math.round((Game.genomeLength*Game.depth) / Game.readLength);
  // Determine what size the grid cells need to be to fit the sequence.
  Game.cell = resizeGrid(Game.genomeLength, Game.numReads);
  // Redraw the UI.
  makeUI();
  constructPopup();
  // Generate a PRNG seed if not given.
  if (seed === undefined) {
    seed = Date.now();
  }
  console.log('seed: '+seed);
  Game.prng = new ToyPrng(seed);
  // Generate a reference sequence, if none given.
  if (typeof reference === 'string') {
    Game.reference = reference;
  } else {
    Game.reference = randSeq(Game.genomeLength);
  }
  console.log("Shhh, the answer is "+Game.reference+"!");
  // Generate the reads.
  var reads = wgsim(Game.reference, Game.numReads, Game.readLength, 1,
                    Game.errorRate);
  for (var i = 0; i < reads.length; i++) {
    var read = makeRead(reads[i], Panels.bank.x+i*Game.cell,
                        Panels.bank.y+i*Game.cell);
    // var read = Crafty.e('Read')
    //   .attr({x: Panels.bank.x+i*Game.cell, y: Panels.bank.y+i*Game.cell})
    // read.setSeq(reads[i]);
    read.addBorders('#FFF');
    for (var j = 0; j < read.bases.length; j++) {
      read.bases[j].css('cursor', 'grab');
    }
  }
  Game.baseGrid = new BaseGrid();
  Game.baseGrid.fill();
  calcConsensus(Game.baseGrid);
}


// Determine what size the grid cells need to be to fit the sequence.
function resizeGrid(genomeLength, numReads) {
  // What size should a cell be to fit the genome horizontally?
  /// Determine the desired main panel width.
  var targetWidth = GAME_WIDTH - 1 - Panels.param.x - Panels.param.w - 10;
  var cell1 = Math.floor(targetWidth / genomeLength);
  // What size should a cell be to fit the reads vertically?
  /** The total height of the game area affected by the cell size is 1 row for
    * the consensus + 1 row spacer + numReads rows for the main panel + 1 row
    * spacer + numReads rows for the bank panel = 3 + 2*numReads rows.
   **/
  var targetHeight = GAME_HEIGHT - 1 - Panels.consensus.y;
  var rows = 3 + 2*numReads;
  var cell2 = Math.floor(targetHeight / rows);
  // Take the smaller of the two calculated values to make sure it will fit.
  return Math.min(cell1, cell2);
}


// Everything that needs to happen once the user has moved a read.
// This is bound to each read's 'StopDrag' event.
function readStopDrag(event) {
  /* jshint validthis:true */
  var main = Panels.main;
  var bank = Panels.bank;
  // Make each read snap to the grid when the user stops moving it.
  this.x = snap(this._x, this._w, main.x, main.x+main.w);
  if (this._y < (main.y+main.h+bank.y-Game.cell)/2) {
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
  Game.success = setSuccessIndicator(Game.success, checkAnswer());
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
  } else if (pos + size > max - (max % Game.cell)) {
    return max - ((max-min) % Game.cell) - size;
  // Otherwise, just find the closest grid line and snap to it
  } else {
    var offset = (pos - min) % Game.cell;
    if (offset < Game.cell/2) {
      return pos - offset;
    } else {
      return pos - offset + Game.cell;
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
    if (i >= Panels.main.h/Game.cell) {
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
  for (var x = main.x+Game.cell; x < main.x+main.w; x += Game.cell) {
    Crafty.e('Grid')
      .attr({x: x, y: main.y, w: 1, h: main.h});
  }
  // draw horizontal grid lines
  for (var y = main.y+Game.cell; y < main.y+main.h; y += Game.cell) {
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
    .attr({x: x, y: y, w: seq.length*Game.cell, h: Game.cell});
  // Make each base in the sequence, attach to the read
  for (var i = 0; i < seq.length; i++) {
    var base = Crafty.e('Base')
      .attr({x: x+i*Game.cell, y: y, w: Game.cell, h: Game.cell})
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
           w:length*Game.cell, h:Game.cell});
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
function setSuccessIndicator(indicator, successful) {
  // Create success indicator if it doesn't exist yet.
  if (indicator === undefined) {
    indicator = Crafty.e('Button')
      .attr({x: Panels.param.x+10, y: Panels.consensus.y+5,
             w: Panels.param.w-20, h: 30})
      .css('cursor', 'default');
  }
  // When there is no result, show a neutral indicator.
  if (successful === undefined) {
    indicator.color('#CCC').text('...');
  // On success, show a green checkmark.
  } else if (successful) {
    indicator.color('#1A1').text('\u2713');
  // If incorrect, show a red X.
  } else {
    indicator.color('#F77').text('X');
  }
  return indicator;
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
    var totalRows = Math.floor((Panels.main.h+Panels.bank.h) / Game.cell);
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
        var row = (reads[i]._y-Panels.main.y) / Game.cell;
      } else {
        // It's in the bank panel
        var row = ((reads[i]._y-Panels.bank.y) / Game.cell) +
                  (Panels.main.h/Game.cell);
      }
      for (var j = 0; j < bases.length; j++) {
        var column = (bases[j]._x - Panels.main.x) / Game.cell;
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
