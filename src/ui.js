// Make buttons, icons, controls, etc.
function makeUI() {
  // The shift buttons
  var shiftLeftButton = Crafty.e('Button')
    .attr({x: HEAD.x, y: HEAD.y+10, w: 50, h: 30})
    .color('#CCC')
    .text('<');
  shiftLeftButton.bind('Click', shiftLeft);
  var shiftRightButton = Crafty.e('Button')
    .attr({x: HEAD.width - 50, y: HEAD.y+10, w: 50, h: 30})
    .color('#CCC')
    .text('>');
  shiftRightButton.bind('Click', shiftRight);
}

// Shift left by one grid increment
function shiftLeft() {
  shift(-BASE_SIZE);
}
// Shift right by one grid increment
function shiftRight() {
  shift(BASE_SIZE);
}
// Shift all reads "shiftDist" pixels
function shift(shiftDist) {
  var reads = Crafty('Read').get();
  // Check if there's room to move everything in that direction.
  //TODO: optimize if necessary by combining this check and the actual move loop
  for (var i = 0; i < reads.length; i++) {
    var new_x = reads[i]._x + shiftDist;
    var snapped_x = snap(new_x, reads[i]._w, MAIN.x, MAIN.x+MAIN.width);
    // If snap() says the new_x must be modified, then we must be butting up
    // against the edge of the game area. Abort shift.
    if (new_x !== snapped_x) {
      return;
    }
  }
  // Now loop again, but actually shift everything.
  for (var i = 0; i < reads.length; i++) {
    reads[i].x = reads[i]._x + shiftDist;
  }
  // And update the consensus sequence.
  calcConsensus(getBaseGrid());
}
