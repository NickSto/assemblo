var GAME_WIDTH = 1024;
var GAME_HEIGHT = 768;
var BASE_SIZE = 50;
var COLORS = {'A':'#A44', 'C':'#448', 'G':'#484', 'T':'#AA4', 'N':'#DDD'};

// Make each read snap to the grid when the user stops moving it.
function readStopDrag(event) {
  this.x = snap(this._x);
  this.y = snap(this._y);
  calcConsensus(getBaseGrid());
}

// Calculate the closest grid coordinate to the given one
function snap(coordinate) {
  var offset = coordinate % BASE_SIZE;
  if (offset < BASE_SIZE/2) {
    return coordinate - offset;
  } else {
    return coordinate - offset + BASE_SIZE;
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
      var index = bases[j]._x / BASE_SIZE;
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
  for (var y = 0; y < GAME_HEIGHT; y += BASE_SIZE) {
    grid.draw(0, y, GAME_WIDTH, 1);
    // console.log('drew: 0, '+y+', '+GAME_WIDTH+', 1');
  }
}

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
    read.addBase(base);
  }
  read.bind('StopDrag', readStopDrag);
  return read;
}

// Initialize the consensus sequence at the top
function makeConsensus() {
  var consensus = Crafty.e('Consensus');
  consensus.length = Math.floor(GAME_WIDTH/BASE_SIZE);
  for (var i = 0; i < consensus.length; i++) {
    var base = Crafty.e('Base')
      .attr({x: i*BASE_SIZE, y: 0, w: BASE_SIZE, h: BASE_SIZE})
      .color(COLORS['N']);
    base.letter = 'N';
    consensus.bases[i] = base;
    consensus.seq[i] = 'N';
  }
  return consensus;
}

function Game_start() {
  Crafty.init(GAME_WIDTH, GAME_HEIGHT);
  // drawGrid();
  makeConsensus();
  makeRead('GATTACA', 0, 100);
  makeRead('TACACAG', 50, 150);
  makeRead('ACACAGT', 100, 200);
  makeRead('GTTCCGA', 150, 250);
  calcConsensus(getBaseGrid());
};
