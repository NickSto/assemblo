var BASE_SIZE = 50;
var COLORS = {'A':'#A48', 'C':'#8A4', 'G':'#48A', 'T':'#804'};

function makeRead(seq) {
  var read = Crafty.e('2D, DOM, Color, Draggable')
    .attr({x: 0, y: 0, w: seq.length*BASE_SIZE, h: BASE_SIZE});
  read.alpha = 0.0;
  read.z = 10;
  for (var i = 0; i < seq.length; i++) {
    var base = Crafty.e('2D, DOM, Color, Draggable')
      .attr({x: i*BASE_SIZE, y: 0, w: BASE_SIZE, h: BASE_SIZE})
      .color(COLORS[seq[i]])
    base.z = 5;
    read.attach(base);
  }
}

function Game_start() {
  Crafty.init(1024, 768);
  makeRead('GATTACA');
};