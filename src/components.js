
Crafty.c('Read', {
  init: function() {
    this.requires('2D, Draggable');
    this.alpha = 0.0; // opacity = transparent
    this.z = 10; // depth = in front of the bases (whose z = 5)
    // need to create during init so it's not shared globally
    this.bases = new Array();
  },
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
    this.letter = undefined;
  }
});

Crafty.c('Consensus', {
  init: function() {
    this.bases = new Array();
    this.seq = new Array();
    this.length = undefined;
  },
  updateBases: function() {
    // manual assertion
    if (this.length !== this.bases.length || this.length !== this.seq.length) {
      console.log('Error: Consensus lengths disagree!'+
        ' this.length = '+this.length+', this.bases.length = '+this.bases.length
        +', this.seq.length = '+this.seq.length);
      return;
    }
    // check each base entity, and if the actual sequence disagrees, replace it
    for (var i = 0; i < this.length; i++) {
      if (this.seq[i] !== this.bases[i].letter) {
        this.bases[i].destroy();
        this.bases[i] = Crafty.e('Base')
          .attr({x: MAIN.x+i*BASE_SIZE, y: MAIN.y, w: BASE_SIZE, h: BASE_SIZE})
          .color(COLORS[this.seq[i]]);
        if (this.seq[i] !== 'N') {
          this.bases[i].text(this.seq[i]);
        }
      }
    }
  },
});
