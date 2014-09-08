var BASE_SIZE = 50;
var COLORS = {'A':'#A44', 'C':'#448', 'G':'#484', 'T':'#AA4'};

function makeRead(seq) {
  // Make an invisible entity the size of the entire read, which will
  // be what the user actually clicks and drags. The bases will be
  // behind it and attached to it.
  var read = Crafty.e('2D, DOM, Color, Draggable')
    .attr({x: 0, y: 0, w: seq.length*BASE_SIZE, h: BASE_SIZE});
  read.alpha = 0.0; // opacity = transparent
  read.z = 10; // depth = in front of the bases (whose z = 5)
  // Make each base in the sequence, attach to the read
  for (var i = 0; i < seq.length; i++) {
    var base = Crafty.e('2D, DOM, Color, Draggable')
      .attr({x: i*BASE_SIZE, y: 0, w: BASE_SIZE, h: BASE_SIZE})
      .color(COLORS[seq[i]])
    base.z = 5; // depth = behind the read (z = 10)
    read.attach(base); // makes the base move when the read moves
  }
}

function Game_start() {
  Crafty.init(1024, 768);
  makeRead('GATTACA');
};