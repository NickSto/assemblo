
Crafty.c('Read', {
  init: function() {
    this.requires('2D, Draggable');
    this.alpha = 0.0; // opacity = transparent
    this.z = 10; // depth = in front of the bases (whose z = 5)
  }
});

Crafty.c('Base', {
  init: function() {
    this.requires('2D, DOM, Color, Text')
      .textFont({size: '43px'})
      .textColor('#FFFFFF')
      .css('text-align', 'center');
    this.z = 5; // depth = behind the read (z = 10)
  }
});
