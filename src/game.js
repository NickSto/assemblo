Const = {
  BLOCK_SIZE: 50,
}

Game = {
  start: function() {
    Crafty.init(1024, 768);
    var parent = Crafty.e('2D, DOM, Color, Draggable')
      .attr({x: 0, y: 0, w: Const.BLOCK_SIZE, h: Const.BLOCK_SIZE})
      .color('#A48');
    var child = Crafty.e('2D, DOM, Color, Draggable')
      .attr({x: 50, y: 0, w: Const.BLOCK_SIZE, h: Const.BLOCK_SIZE})
      .color('#8A4');
    parent.attach(child);
  },
};
