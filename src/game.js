var BASE_SIZE = 50;
var COLORS = {'A':'#A44', 'C':'#448', 'G':'#484', 'T':'#AA4'};

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
    read.attach(base); // makes the base move when the read moves
  }
  read.bind('StopDrag', readStopDrag);
  return read;
}

// Make each read snap to the grid when the user stops moving it.
function readStopDrag(event) {
  this.x = snap(this._x);
  this.y = snap(this._y);
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

function Game_start() {
  Crafty.init(1024, 768);
  makeRead('GATTACA', 0, 0);
  makeRead('TACAGAT', 0, 100);
};
