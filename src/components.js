
Crafty.c('Read', {
  init: function() {
    this.requires('2D, Draggable');
    this.alpha = 0.0; // opacity = transparent
    this.z = 10; // depth = in front of the bases (whose z = 5)
    // need to create during init so it's not shared globally
    this.bases = new Array();
  },
  bases: null,
  addBase: function(base) {
    this.bases.push(base);
    this.attach(base); // makes the base move when the read moves
  },
  getSequence: function() {
    var sequence = '';
    for (var i = 0; i < this.bases.length; i++) {
      sequence += this.bases[i].letter;
    }
    return sequence;
  },
});

Crafty.c('Base', {
  init: function() {
    this.requires('2D, DOM, Color, Text')
      .textFont({size: '43px'})
      .textColor('#FFFFFF')
      .css('text-align', 'center')
      .unselectable();
    this.z = 5; // depth = behind the read (z = 10)
  }
});
