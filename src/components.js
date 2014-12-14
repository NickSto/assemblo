'use strict';
/* global Crafty, Game, Panels, COLORS, Z, readStopDrag, readStartDrag,
          capitalize */


// Create an empty scene to use its function of destroying all entities.
Crafty.scene('destroyAll', function() {});


Crafty.c('Read', {
  init: function() {
    this.requires('2D, Draggable, Collision');
    this.h = Game.cell;
    this.alpha = 0.0; // opacity = transparent
    this.z = Z.read; // depth = in front of the bases
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
    console.assert(false, "Error: 'Read'.setSeq() not yet implemented.");
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
      //   .attr({x: this._x+i*Game.cell, y: this._y, w: Game.cell, h: Game.cell})
      //   .color(COLORS[seq[i]])
      //   .text(seq[i]);
      // base.letter = seq[i];
      this.bases.push(base);
      // this.attach(base);
    }
    console.log('made bases');
    // Resize the read to be the correct length.
    this.w = seq.length * Game.cell;
  },
  // Bring the read to the top of the z-dimension (foreground).
  foreground: function() {
    // The z values are chosen so that the bases' z's are still below all the
    // reads' z's, to make sure you never can click a base instead of a read.
    this.z = Z.readFG;
    for (var i = 0; i < this.borders; i++) {
      this.borders[i].z = Z.borderFG;
    }
    for (var i = 0; i < this.bases.length; i++) {
      this.bases[i].z = Z.baseFG;
    }
  },
  // Reset the z values to the defaults
  defaultDepth: function() {
    this.z = Z.read;
    for (var i = 0; i < this.borders; i++) {
      this.borders[i].z = Z.border;
    }
    for (var i = 0; i < this.bases.length; i++) {
      this.bases[i].z = Z.base;
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
    left.z = Z.border;
    right.z = Z.border;
    top.z = Z.border;
    bottom.z = Z.border;
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
    var textSize = Math.round(Game.cell*0.86);
    this.requires('2D, DOM, Color, Text')
      .textFont({size: textSize+'px'})
      .textColor('#FFFFFF')
      .css('text-align', 'center')
      .css('cursor', 'default')
      .unselectable();
    this.z = Z.base; // depth = behind the read
  }
});

Crafty.c('Consensus', {
  init: function() {
    this.requires('HTML, 2D, Color')
      .color(COLORS['N']);
    this.counts = [];
    this.bases = [];
    this.seq = [];
    Object.defineProperty(this, 'length', {
      get: function() { return this.bases.length; },
      set: function() {
        console.assert(false, "Can't assign to consensus.length.");
      },
    });
  },
  // Make sure the .bases match the letters in .seq
  updateBases: function() {
    console.assert(this.bases.length === this.seq.length,
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
    this.seq[coord] = letter;
    var base = Crafty.e('Base');
    base.letter = letter;
    // If it's an N, leave base as an invisible placeholder object.
    if (letter === 'N') {
      this.bases[coord] = base;
      this.attach(base);
      return;
    }
    base.attr({x: Panels.consensus.x+coord*Game.cell, y: Panels.consensus.y,
             w: Game.cell, h: Game.cell})
      .color(COLORS[letter]);
    base.text(letter);
    this.bases[coord] = base;
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
      .css('cursor', 'pointer')
      .unselectable();
  },
});

Crafty.c('Writing', {
  init: function() {
    this.requires('DOM, Text')
      .attr({h: 15, w:35});
    Object.defineProperty(this, 'string', {
      get: function() { return this.text(); },
      set: function(string) { this.setString(string); },
    });
    Object.defineProperty(this, 'size', {
      get: function() { return this._size; },
      set: function(size) { this.setSize(size); },
    });
    Object.defineProperty(this, 'color', {
      get: function() { return this._color; },
      set: function(color) { this._color = color; this.textColor(color); },
    });
    this.color = '#888';
    this.size = 12;
  },
  setString: function(string) {
    this.text(string);
    this.w = 0.8 * this._size * string.length;
  },
  setSize: function(size) {
    this.textFont({size: size+'px'});
    this._size = size;
    this.h = 1.25 * size;
    this.w = 0.8 * size * this.string.length;
  },
});

Crafty.c('Popup', {
  init: function() {
    this.requires('2D, DOM, Color')
      .attr(Panels.popup);
    this.linesColor = '#424236';
    this.fillColor = '#EEC';
    this.color(this.fillColor);
    this.z = Z.popup;
    this.css('border', '1px solid '+this.linesColor);
    this.margin = 20;
    // Add a close button
    this.closeButton = Crafty.e('Button')
      .textFont({size: '16px'})
      .textColor(this.linesColor)
      .attr({x:this.x+this.w-18-this.margin, y:this.y+this.margin, w:18, h:18})
      .color(this.fillColor)
      .css('border', '1px solid '+this.linesColor)
      .text('X');
    this.closeButton.z = Z.popup;
    // this.closeButton.bind('Click', function() { this._parent.destroy(); });
    this.closeButton._element.addEventListener('click', function(event) {
      if (window.history.state && window.history.state.first) {
        window.location.hash = '';
      } else {
        window.history.back();
      }
    });
    this.attach(this.closeButton);
    // Add the title
    this.title = Crafty.e('Writing')
      .attr({x:this.x+this.margin, y:this.y+this.margin,
             size:22, color:this.linesColor});
    this.title.h = 25;
    this.title.z = Z.popup;
    this.attach(this.title);
    // Add the main text
    this.body = Crafty.e('Writing')
      .attr({x:this.x+this.margin, y:this.y+this.title.h+2*this.margin,
             size:16, color:this.linesColor});
    this.body.z = Z.popup;
    this.attach(this.body);
  },
  // Add an image or video above the popup text.
  addMedia: function(type, url, width, height) {
    console.assert(type === 'video' || type === 'image',
                   'Error: Media type must be "video" or "image".');
    this.media = Crafty.e(capitalize(type))
      .attr({x:this.x+this.margin, y:this.title.y+this.title.h+this.margin});
    // Add the HTML element for the media.
    if (type === 'video') {
      this.media
        .append('<video autoplay controls src="'+url+'"></video>')
        .css('border', '1px solid '+this.linesColor);
    } else if (type === 'image') {
      this.media
        .append('<img src="'+url+'"></img>');
    }
    this.media.z = Z.popup;
    // Set the height and width, either as given in arguments or detected from
    // the media itself.
    var mediaElement = this.media._element.children[0];
    if (width === undefined || height === undefined) {
      mediaElement.addEventListener('load', this._setMediaDimensions);
    } else {
      this.media.w = width;
      mediaElement.width = width;
      this.media.h = height;
      mediaElement.height = height;
      this.body.y = this.media.y + this.media.h + this.margin;
    }
    this.attach(this.media);
  },
  // Once the media has loaded, set the height and width, and adjust the text
  // position. N.B.: In this function, "this" is the image HTMLElement.
  _setMediaDimensions: function() {
    var parentId = +this.parentElement.id.slice(3);
    console.assert(! isNaN(parseFloat(parentId)));
    var popup = Crafty(parentId)._parent;
    popup.media.w = this.width;
    popup.media.h = this.height;
    popup.body.y = popup.media.y + popup.media.h + popup.margin;
  },
});

Crafty.c('Input', {
  init: function() {
    this.requires('HTML');
    this._attrs = ['type', 'id', 'size', 'value'];
    for (var i = 0; i < this._attrs.length; i++) {
      this._makeSetGet(this._attrs[i]);
    }
    this.type = 'text';
    this.size = 1;
    this.value = 0;
    Object.defineProperty(this, 'width', {
      get: function() { return this._width; },
      set: function(width) { this.setWidth(width); },
    });
    Object.defineProperty(this, 'html', {
      get: function() { return this._html; },
      set: function(html) { this.setHtml(html); },
    });
    Object.defineProperty(this, 'tip', {
      get: function() { return this._tip; },
      set: function(tip) { this.setTooltip(tip); },
    });
    this.update();
  },
  // Make setters and getters for the HTML attributes so the HTML is updated
  // whenever an attribute is changed. Technique from:
  // https://stackoverflow.com/questions/17764795/create-getter-and-setter-in-javascript/17765019#17765019
  _makeSetGet: function(attr) {
    Object.defineProperty(this, attr, {
      get: function() {
        return this['_'+attr];
      },
      set: function(value) {
        this['_'+attr] = value;
        this.update();
      },
    });
  },
  setWidth: function(width) {
    this._width = width;
    this.update();
  },
  setHtml: function(html) {
    this._html = html;
    this.replace(this._html);
  },
  // Update the HTML to include the current values of the attributes.
  update: function() {
    // Start building the HTML for the tag as a string.
    this._html = '<input ';
    // Concatenate all attribute/value combinations, e.g. 'attr="value" '.
    for (var i = 0; i < this._attrs.length; i++) {
      var value = this[this._attrs[i]];
      if (value !== undefined) {
        this._html += this._attrs[i]+'="'+value+'" ';
      }
    }
    // Put width into a style attribute, since it doesn't seem to work to set it
    // via this.css().
    if (this._width !== undefined) {
      this._html += 'style="width: '+this._width+'px;"';
    }
    this._html += '>';
    this.replace(this._html);
  },
  setTooltip: function(tip) {
    this.tooltip = Crafty.e('HTML')
      .attr({x:this.x+this.w, y:this.y, h:this.h, w:this.w});
    this.tooltip.visible = false;
    this.tooltip._element.className = this.tooltip._element.className+' tooltip';
    var span = document.createElement('span');
    span.innerHTML = tip;
    span.style.font = '9px sans-serif';
    // This, along with the entry in index.css, vertically centers it.
    span.className = 'vert-center';
    this.tooltip._element.style.lineHeight = this.h+'px';
    this.tooltip._element.appendChild(span);
    // The value of this.h (of the 'Input' entity) is the height of the Crafty
    // entity, not the actual <input> element. So setting later is needed.
    Object.defineProperty(this.tooltip, 'h', {
      get: function() { return this._h; },
      set: function(h) {
        this._h = h;
        this._element.style.lineHeight = h+'px';
      },
    });
    // Show tooltip on mouseover
    this.addComponent('Mouse');
    this.bind('MouseOver', function() { this.tooltip.visible = true; });
    this.bind('MouseOut', function() { this.tooltip.visible = false; });
    this.attach(this.tooltip);
    this._tip = tip;
  },
});

Crafty.c('Media', {
  init: function() {
    this.requires('HTML')
      .attr({x: Panels.main.x, y: Panels.main.y});
  },
  // Center the media along the given dimensions within the given panel.
  center: function(dimensions, panel) {
    if (dimensions === undefined) {
      dimensions = 'x';
    }
    if (panel === undefined) {
      panel = Panels.main;
    }
    var x = this.x;
    var y = this.y;
    if (dimensions.indexOf('x') !== -1) {
      x = Math.max(0, panel.x + (panel.w - this.w)/2);
    }
    if (dimensions.indexOf('y') !== -1) {
      y = Math.max(0, panel.y + (panel.h - this.h)/2);
    }
    this.attr({x: x, y: y});
    return this;
  },
});

Crafty.c('Video', {
  init: function() {
    this.requires('Media');
  }
});

Crafty.c('Image', {
  init: function() {
    this.requires('Media');
  }
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
      console.assert(false, 'Cannot draw a diagonal line.');
    }
    return this;
  },
});

Crafty.c('Grid', {
  init: function() {
    this.requires('Line');
  },
});
