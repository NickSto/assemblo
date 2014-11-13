'use strict';
/* global Crafty, MAIN, CONSENSUS, BASE_SIZE, COLORS, Z_BASE, Z_READ, Z_BORDER,
          Z_BASE_FG, Z_READ_FG, Z_BORDER_FG, assert */

Crafty.c('Read', {
  init: function() {
    this.requires('2D, Draggable, Collision');
    this.h = BASE_SIZE;
    this.alpha = 0.0; // opacity = transparent
    this.z = Z_READ; // depth = in front of the bases
    this.bases = [];
    this.bind('StopDrag', readStopDrag);
    this.bind('StartDrag', readStartDrag);
    Object.defineProperty(this, 'seq', {
      get: this.getSeq,
      set: this.setSeq,
    });
  },
  add: function(base) {
    this.bases.push(base);
    this.attach(base); // makes the base move when the read moves
  },
  getSeq: function() {
    var sequence = '';
    for (var i = 0; i < this.bases.length; i++) {
      sequence += this.bases[i].letter;
    }
    return sequence;
  },
  // Set the read sequence and create all the bases.
  // The x and y must be set first.
  // If any bases are currently present, they will be destroyed.
  //TODO: Finish.
  setSeq: function(seq) {
    assert(0, "Error: 'Read'.setSeq() not yet implemented.");
    // If the sequence is already correct, do nothing.
    if (this.seq === seq) {
      return this;
    }
    // Destroy any bases that are currently present.
    // for (var i = 0; i < this.bases.length; i++) {
    //   if (this.bases[i] !== undefined) {
    //     this.bases[i].destroy();
    //   }
    // }
    // Make each base in the sequence, attach to the read
    console.log('making bases for '+seq);
    for (var i = 0; i < seq.length; i++) {
      var base = Crafty.e('Base');
      console.log('made base '+i+' of '+seq.length+': '+base.getId());
      //   .attr({x: this._x+i*BASE_SIZE, y: this._y, w: BASE_SIZE, h: BASE_SIZE})
      //   .color(COLORS[seq[i]])
      //   .text(seq[i]);
      // base.letter = seq[i];
      this.bases.push(base);
      // this.attach(base);
    }
    console.log('made bases');
    // Resize the read to be the correct length.
    this.w = seq.length * BASE_SIZE;
  },
  // Bring the read to the top of the z-dimension (foreground).
  foreground: function() {
    // The z values are chosen so that the bases' z's are still below all the
    // reads' z's, to make sure you never can click a base instead of a read.
    this.z = Z_READ_FG;
    for (var i = 0; i < this.borders; i++) {
      this.borders[i].z = Z_BORDER_FG;
    }
    for (var i = 0; i < this.bases.length; i++) {
      this.bases[i].z = Z_BASE_FG;
    }
  },
  // Reset the z values to the defaults
  defaultDepth: function() {
    this.z = Z_READ;
    for (var i = 0; i < this.borders; i++) {
      this.borders[i].z = Z_BORDER;
    }
    for (var i = 0; i < this.bases.length; i++) {
      this.bases[i].z = Z_BASE;
    }
  },
  addBorders: function(color, width) {
    if (color === undefined) {
      color = '#DDD';
    }
    if (width === undefined) {
      width = 1;
    }
    var left = Crafty.e('2D, Color, DOM')
      .attr({x: this._x-1, y: this._y, h: this._h, w: width})
      .color(color);
    var right = Crafty.e('2D, Color, DOM')
      .attr({x: this._x+this._w-1, y: this._y, h: this._h, w: width})
      .color(color);
    var top = Crafty.e('2D, Color, DOM')
      .attr({x: this._x, y: this._y-1, h: width, w: this._w})
      .color(color);
    var bottom = Crafty.e('2D, Color, DOM')
      .attr({x: this._x, y: this._y+this._h-1, h: width, w: this._w})
      .color(color);
    left.z = Z_BORDER;
    right.z = Z_BORDER;
    top.z = Z_BORDER;
    bottom.z = Z_BORDER;
    this.attach(left);
    this.attach(right);
    this.attach(top);
    this.attach(bottom);
    this.borders = [left, right, top, bottom];
    return this;
  },
});

Crafty.c('Base', {
  init: function() {
    var textSize = Math.round(BASE_SIZE*0.86);
    this.requires('2D, DOM, Color, Text')
      .textFont({size: textSize+'px'})
      .textColor('#FFFFFF')
      .css('text-align', 'center')
      .unselectable();
    this.z = Z_BASE; // depth = behind the read
  }
});

Crafty.c('Consensus', {
  init: function() {
    this.requires('2D');
    this.bases = [];
    this.seq = [];
    Object.defineProperty(this, 'length', {
      get: function() { return this.bases.length; },
      set: function() { assert(0, "Can't assign to consensus.length."); },
    });
  },
  // Make sure the .bases match the letters in .seq
  updateBases: function() {
    assert(this.bases.length === this.seq.length,
      'Consensus lengths disagree! this.bases.length = '+
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
  // Add a base of "letter" to position "coord".
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
    return this;
  },
  // Draw a bounding box around the video. Must set its height and width first.
  addBorder: function() {
    assert(this._w !== 0 && this._h !== 0,
      "'Video'.addBorder() called before video size set.");
    var top = Crafty.e('Line')
      .place(this._x, this._y-1, this._x+this._w, this._y-1);
    this.attach(top);
    var bottom = Crafty.e('Line')
      .place(this._x, this._y+this._h, this._x+this._w, this._y+this._h);
    this.attach(bottom);
    var left = Crafty.e('Line')
      .place(this._x-1, this._y, this._x-1, this._y+this._h);
    this.attach(left);
    var right = Crafty.e('Line')
      .place(this._x+this._w, this._y, this._x+this._w, this._y+this._h);
    this.attach(right);
    return this;
  },
});

Crafty.c('Line', {
  init: function() {
    this.requires('2D, Canvas, Color')
      .color('#DDD');
  },
  // Draw the line from (x1, y1) to (x2, y2) (sets x, y, w, h).
  // The line must be horizontal or vertical, no diagonals.
  place: function(x1, y1, x2, y2, lineWidth) {
    if (lineWidth === undefined) {
      lineWidth = 1;
    }
    if (x1 === x2) {
      var y = Math.min(y1, y2);
      var height = Math.abs(y1 - y2);
      this.attr({x: x1, y: y, w: lineWidth, h: height});
    } else if (y1 === y2) {
      var x = Math.min(x1, x2);
      var width = Math.abs(x1 - x2);
      this.attr({x: x, y: y1, w: width, h: lineWidth});
    } else {
      assert(false, 'Cannot draw a diagonal line.');
    }
    return this;
  },
});

Crafty.c('Grid', {
  init: function() {
    this.requires('Line');
  },
});
