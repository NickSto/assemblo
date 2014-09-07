var BLOCK_SIZE = 50;

function Game_start() {
  Crafty.init(1024, 768);
  var parent = Crafty.e('2D, DOM, Color, Draggable')
    .attr({x: 0, y: 0, w: BLOCK_SIZE, h: BLOCK_SIZE})
    .color('#A48');
  var child = Crafty.e('2D, DOM, Color, Draggable')
    .attr({x: 50, y: 0, w: BLOCK_SIZE, h: BLOCK_SIZE})
    .color('#8A4');
  parent.attach(child);
};
