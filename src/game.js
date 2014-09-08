var BLOCK_SIZE = 50;

function makeRead() {
  var bases = 10;
  var read = Crafty.e('2D, DOM, Color, Draggable')
    .attr({x: 0, y: 0, w: bases*BLOCK_SIZE, h: BLOCK_SIZE});
  read.alpha = 0.0;
  read.z = 10;
  for (var i = 1; i < bases; i++) {
    var base = Crafty.e('2D, DOM, Color, Draggable')
      .attr({x: i*BLOCK_SIZE, y: 0, w: BLOCK_SIZE, h: BLOCK_SIZE})
      .color('#A48')
    base.z = 5;
    read.attach(base);
  }
}

function Game_start() {
  Crafty.init(1024, 768);
  makeRead();
};
