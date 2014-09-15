function Game_start() {
  Crafty.init(GAME_WIDTH, GAME_HEIGHT);
  makeUI();
  // drawGrid();
  var consensus = makeConsensus();
  var reference = randSeq(consensus.length);
  console.log("Shhh, the answer is "+reference);
  var reads = wgsim(reference, NUM_READS, READ_LENGTH, 1);
  for (var i = 0; i < reads.length; i++) {
    makeRead(reads[i], i*BASE_SIZE, 100+i*BASE_SIZE);
  }
  calcConsensus(getBaseGrid());
};

// Make each read snap to the grid when the user stops moving it.
function readStopDrag(event) {
  //TODO: keep reads from overlapping
  this.x = snap(this._x, this._w, MAIN.x, MAIN.x+MAIN.width);
  this.y = snap(this._y, this._h, MAIN.y, MAIN.y+MAIN.height);
  calcConsensus(getBaseGrid());
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
  } else if (pos + size - min > max - (max % BASE_SIZE)) {
    return max - (max % BASE_SIZE) - size + min;
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
// Conflicts appear as 'N', no data appears as undefined.
function calcConsensus(baseGrid) {
  var consensus = Crafty('Consensus').get()[0];
  consensus.seq = new Array(consensus.length);
  // Visit each read, incorporating it into the consensus sequence.
  for (var i = 0; i < baseGrid.length; i++) {
    var read = baseGrid[i];
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

// Fill a 2D array with all bases on the grid
function getBaseGrid() {
  var baseGrid = new Array();
  var reads = Crafty('Read').get();
  for (var i = 0; i < reads.length; i++) {
    var bases = reads[i].bases;
    var baseRow = new Array();
    for (var j = 0; j < bases.length; j++) {
      var index = (bases[j]._x - MAIN.x) / BASE_SIZE;
      baseRow[index] = bases[j].letter;
    }
    baseGrid.push(baseRow);
  }
  return baseGrid;
}

// Draw guidelines to show where the snap-to grid is
function drawGrid() {
  var grid = Crafty.e('2D, Canvas, Color')
    .attr({x:0, y:0, w:0, h:0})
    .color('#DDD');
  // draw horizontal grid lines
  for (var y = MAIN.y; y < MAIN.height; y += BASE_SIZE) {
    grid.draw(MAIN.x, y, MAIN.x+MAIN.width, 1);
  }
}

// Make a Read entity with sequence "seq" at a position defined by "x" and "y".
// "x" and "y" are the distance of the top-left corner from the origin of the
// MAIN panel.
function makeRead(seq, x, y) {
  // Make an invisible entity the size of the entire read, which will
  // be what the user actually clicks and drags. The bases will be
  // behind it and attached to it.
  var read = Crafty.e('Read')
    .attr({x: MAIN.x+x, y: MAIN.y+y, w: seq.length*BASE_SIZE, h: BASE_SIZE});
  // Make each base in the sequence, attach to the read
  for (var i = 0; i < seq.length; i++) {
    var base = Crafty.e('Base')
      .attr({x: MAIN.x+x+i*BASE_SIZE, y: MAIN.y+y, w: BASE_SIZE, h: BASE_SIZE})
      .color(COLORS[seq[i]])
      .text(seq[i]);
    base.letter = seq[i];
    read.addBase(base);
  }
  read.bind('StopDrag', readStopDrag);
  return read;
}

// Initialize the consensus sequence at the top of the MAIN panel
function makeConsensus() {
  var consensus = Crafty.e('Consensus');
  consensus.length = Math.floor(MAIN.width/BASE_SIZE);
  for (var i = 0; i < consensus.length; i++) {
    var base = Crafty.e('Base')
      .attr({x: MAIN.x+i*BASE_SIZE, y: MAIN.y, w: BASE_SIZE, h: BASE_SIZE})
      .color(COLORS['N']);
    base.letter = 'N';
    consensus.bases[i] = base;
    consensus.seq[i] = 'N';
  }
  return consensus;
}


function assert(condition, message) {
  if (! condition) {
    if (message === undefined) {
      message = "Assertion error";
    }
    if (typeof Error !== "undefined") {
      throw new Error(message);
    } else {
      throw message;
    }
  }
}
