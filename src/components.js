'use strict';
/* global Crafty, MAIN, BASE_SIZE, COLORS, assert */

Crafty.c('Read', {
  init: function() {
    this.requires('2D, Draggable');
    this.alpha = 0.0; // opacity = transparent
    this.z = 10; // depth = in front of the bases (whose z = 5)
    // need to create during init so it's not shared globally
    this.bases = [];
  },
  add: function(base) {
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
    this.requires('2D');
    this.bases = [];
    this.seq = [];
    Object.defineProperty(this, 'length', {
      get: function() { return this.bases.length; },
      set: function() { assert(0, "Error: Can't assign to consensus.length.") },
    });
  },
  updateBases: function() {
    assert(this.bases.length === this.seq.length,
      'Error: Consensus lengths disagree! this.bases.length = '+
      this.bases.length+', this.seq.length = '+this.seq.length
    );
    // check each base entity, and if the actual sequence disagrees, replace it
    for (var i = 0; i < this.length; i++) {
      if (this.seq[i] !== this.bases[i].letter) {
        this.bases[i].destroy();
        this.add(this.seq[i], i);
      }
    }
  },
  add: function(letter, coord) {
    var base = Crafty.e('Base')
      .attr({x: CONSENSUS.x+coord*BASE_SIZE, y: CONSENSUS.y, w: BASE_SIZE, h: BASE_SIZE})
      .color(COLORS[letter]);
    if (letter !== 'N') {
      base.text(letter);
    }
    base.letter = letter;
    this.bases[coord] = base;
    this.seq[coord] = letter;
    this.attach(base);
  },
  seqStr: function() {
    return this.seq.join('');
  },
});

Crafty.c('Button', {
  init: function() {
    this.requires('2D, DOM, Color, Text, Mouse')
      .textFont({size: '24px'})
      .textColor('#FFFFFF')
      .css('text-align', 'center')
      .unselectable();
  }
});

Crafty.c('Video', {
  init: function() {
    this.requires('HTML')
      .attr({x: MAIN.x, y: MAIN.y});
  },
  // Center the video along the given dimensions
  center: function(dimensions) {
    if (dimensions === undefined) {
      dimensions = 'x';
    }
    var x = this.x;
    var y = this.y;
    if (dimensions.indexOf('x') !== -1) {
      var x = MAIN.x+(MAIN.width - this.w)/2;
    }
    if (dimensions.indexOf('y') !== -1) {
      var y = MAIN.y+(MAIN.height - this.h)/2;
    }
    this.attr({x: x, y: y});
  }
});

Crafty.c('Grid', {
  init: function() {
    this.requires('2D, Canvas, Color')
      .color('#DDD');
    },
});
