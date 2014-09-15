function makeUI() {
  // shift buttons
  var shift_left_btn = Crafty.e('Button')
    .attr({x: HEAD.x, y: HEAD.y+10, w: 50, h: 30})
    .color('#CCC')
    .text('<');
  shift_left_btn.bind('Click', shift_left);
  var shift_right_btn = Crafty.e('Button')
    .attr({x: HEAD.width - 50, y: HEAD.y+10, w: 50, h: 30})
    .color('#CCC')
    .text('>');
  shift_right_btn.bind('Click', shift_right);
}

function shift_left() {
  shift(-BASE_SIZE);
}

function shift_right() {
  shift(BASE_SIZE);
}

function shift(shift_dist) {
  var reads = Crafty('Read').get();
  // Check if there's room to move everything in that direction.
  for (var i = 0; i < reads.length; i++) {
    var new_x = reads[i]._x + shift_dist;
    var snapped_x = snap(new_x, reads[i]._w, MAIN.x, MAIN.x+MAIN.width);
    // If snap() says the new_x must be modified, then we must be butting up
    // against the edge of the game area. Abort shift.
    if (new_x !== snapped_x) {
      return;
    }
  }
  // Now loop again, but actually shift everything.
  for (var i = 0; i < reads.length; i++) {
    reads[i].x = reads[i]._x + shift_dist;
  }
  // And update the consensus sequence.
  calcConsensus(getBaseGrid());
}
