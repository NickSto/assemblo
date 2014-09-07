var BLOCK_SIZE = 50;

function makeRead() {
  var last_block = Crafty.e('2D, DOM, Color, Draggable')
    .attr({x: 0, y: 0, w: BLOCK_SIZE, h: BLOCK_SIZE})
    .color('#8A4');
  for (var i = 1; i < 10; i++) {
    var this_block = Crafty.e('2D, DOM, Color, Draggable')
      .attr({x: i*BLOCK_SIZE, y: 0, w: BLOCK_SIZE, h: BLOCK_SIZE})
      .color('#A48');
    last_block.attach(this_block);
    last_block = this_block;
  }
}

function Game_start() {
  Crafty.init(1024, 768);
  makeRead();
};
