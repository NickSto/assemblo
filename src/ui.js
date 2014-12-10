'use strict';
/* global Crafty, Game, Panels, BASE_SIZE, PARAMS, PARAMS_ORDER, GLOSSARY, snap,
          calcConsensus, restartGame, startVideo, capitalize */
/* exported Panels, makeUI, drawPanel, drawLine */


// Dimensions of the panels that make up the game area
// x and y set where the top-left corner of the panel are.
var Panels = new (function() {
  this.head = {w: 800, h: 50, x: 0, y: 0};
  this.consensus = {w: this.head.w, h: 2*BASE_SIZE,
                    x: 0, y: this.head.y+this.head.h};
  this.main = {w: this.head.w, h: NUM_READS*BASE_SIZE,
               x: 0, y: this.consensus.y+this.consensus.h};
  this.bank = {w: this.head.w, h: NUM_READS*BASE_SIZE,
               x: 0, y: this.main.y+this.main.h+BASE_SIZE};
  this.param = {w: 115, h: this.main.y+this.main.h,
                x: 10+this.head.x+this.head.w, y: 0};
  this.popup = {x: this.main.x+(100/2), y: 75,
                w: this.main.w-100, h: 535};
  // size of entire Crafty game area
  this.game = {w: this.param.x+this.param.w+1, h: this.bank.y+this.bank.h+1};
});


// Make buttons, icons, controls, etc.
function makeUI() {
  // The shift buttons
  Crafty.e('Button')
    .attr({x: Panels.head.x, y: Panels.head.y+10, w: 50, h: 30})
    .color('#CCC')
    .text('<')
    .bind('Click', shiftLeft);
  Crafty.e('Button')
    .attr({x: Panels.head.w - 50, y: Panels.head.y+10, w: 50, h: 30})
    .color('#CCC')
    .text('>')
    .bind('Click', shiftRight);
  // Restart the game
  Crafty.e('Button')
    .attr({x: Panels.head.x + 60, y: Panels.head.y+10, w: 145, h: 30})
    .color('#ACC')
    .text('New Game')
    .bind('Click', restartGame);
  // Run the intro
  Crafty.e('Button')
    .attr({x: Panels.head.x + 215, y: Panels.head.y+10, w: 70, h: 30})
    .color('#CAC')
    .text('Intro')
    .bind('Click', startVideo);
  // Draw panels, plus a box where the consensus sequence will be.
  var consensus = Panels.consensus;
  consensus.h = BASE_SIZE;
  drawPanel(consensus);
  drawPanel(Panels.main);
  drawPanel(Panels.bank);
  makeParamPanel();
}


function drawPanel(panel) {
  Crafty.e('Line') // top
    .place(panel.x, panel.y, panel.x+panel.w, panel.y);
  Crafty.e('Line') // bottom
    .place(panel.x, panel.y+panel.h, panel.x+panel.w, panel.y+panel.h);
  Crafty.e('Line') // left
    .place(panel.x, panel.y, panel.x, panel.y+panel.h);
  Crafty.e('Line') // right
    .place(panel.x+panel.w, panel.y, panel.x+panel.w, panel.y+panel.h);
}


function makeParamPanel() {
  var param = Panels.param;
  drawPanel(param);
  makeParams(PARAMS, PARAMS_ORDER);
  // Title/logo
  Crafty.e('Writing, Mouse')
    .attr({x:param.x+8, y:param.y+13, string:'Assemblo', size:21, color:'#6600CC'})
    .css('cursor', 'pointer')
    .bind('Click', makeAbout);
  // Parameters section header
  Crafty.e('Writing')
    .attr({x:param.x+8, y:param.y+110, string:'Parameters', size:14});
  // Link to about page
  //TODO: Replace with "About" button in top bar.
  Crafty.e('Writing, Mouse')
    .attr({x:param.x+12, y:param.y+param.h-23, string:"What's this?",
           color:'#0000DD'})
    .css('cursor', 'pointer')
    .bind('Click', makeAbout);
}


// Draw each user-adjustable parameter box
function makeParams(params, paramsOrder) {
  var xMargin = 12;
  var ySpace = 35;
  var lineHeight = 15;
  var wBox = 25;
  var y = Panels.main.y+5;
  for (var i = 0; i < paramsOrder.length; i++) {
    var paramId = paramsOrder[i];
    var param = params[paramId];
    if (param.text !== undefined) {
      Crafty.e('Writing')
        .attr({x:Panels.param.x+xMargin, y:y, string:param.text});
    }
    y += lineHeight;
    if (param.line2 !== undefined) {
      Crafty.e('Writing')
        .attr({x:Panels.param.x+xMargin, y:y, string:param.line2});
      y += lineHeight;
    }
    Crafty.e('Input')
      .attr({h: 30, w:40, x:Panels.param.x+10, y:y})
      .attr({id:'param_'+paramId, value:param.default, width:wBox});
    y += ySpace;
  }
  window.setTimeout(highlightTerms, 100);
}


function readParameters(game, params, paramsOrder) {
  for (var i = 0; i < paramsOrder.length; i++) {
    var paramId = paramsOrder[i];
    var param = params[paramId];
    var value = document.getElementById('param_'+paramId).value;
    if (param.type === 'int') {
      // Is value not a number? parseFloat() needed to make isNaN more reliable:
      // https://stackoverflow.com/a/2652335
      if (isNaN(parseFloat(value))) {
        console.log('Error: Invalid parameter "'+paramId+'": "'+value+'"');
      } else {
        value = Math.round(+value);
      }
    } else if (param.type === 'float') {
      // Is value not a number?
      if (isNaN(parseFloat(value))) {
        console.log('Error: Invalid parameter "'+paramId+'": "'+value+'"');
      } else {
        value = parseFloat(value);
      }
    }
    game[paramId] = value;
  }
  return game;
}


// Highlight and link text marked up as glossary terms
function highlightTerms() {
  var terms = document.getElementsByClassName('term');
  for (var i = 0; i < terms.length; i++) {
    if (terms[i].onclick !== undefined) {
      terms[i].style.color = '#00D';
      terms[i].style.cursor = 'pointer';
      terms[i].onclick = define;
    }
  }
  var links = document.getElementsByClassName('link');
  for (var i = 0; i < links.length; i++) {
    links[i].style.color = '#00D';
    links[i].style.cursor = 'pointer';
  }
}


// Create a pop-up box giving a glossary definition for a term.
function define() {
  var term = this.attributes['data-term'].value;
  var termEntry = GLOSSARY[term];
  if (termEntry === undefined) {
    return;
  }
  // var popups = Crafty('Popup').get();
  // for (var i = 0; i < popups.length; i++) {
  //   popups[i].destroy();
  // }
  var popup = Crafty.e('Popup');
  popup.title.string = termEntry.title;
  if (termEntry.video !== undefined) {
    popup.addMedia('video', termEntry.video, 480, 300);
    popup.media.center('x');
  }
  popup.body.string = termEntry.text;
  popup.body.w = popup.w - 2*popup.margin;
}


// Show the About page popup.
function makeAbout() {
  var about = Crafty.e('Popup');
  about.title.string = 'About Assemblo';
  about.addMedia('image', 'assets/logo.png');
  // Place the image in the upper right, adjust body text position to match.
  //TODO: Replace x positioning kludge with one based on detected image size.
  about.media.x = about.x + about.w - 356;
  about.media.y = about.y + about.margin;
  about.body.y = about.media.y + about.media.h + about.margin;
  about.body.string = ABOUT_TEXT;
  about.body.w = about.w - 2*about.margin;
  //TODO: Set highlightTerms to fire when the text is actually loaded, instead
  //      of this kludge.
  window.setTimeout(highlightTerms, 200);
  window.setTimeout(highlightTerms, 1000);
}


function makeApplications() {
  var apps = Crafty.e('Popup');
  apps.title.string = 'Genome Assembly: What is it good for?';
  apps.body.string = APPLICATIONS;
  apps.body.w = apps.w - 2*apps.margin;
  apps.h = apps.y + 530;
  //TODO: Figure out why closeButton's height keeps changing when apps.h does.
  apps.closeButton.h = 18;
  //TODO: Set highlightTerms to fire when the text is actually loaded, instead
  //      of this kludge.
  window.setTimeout(highlightTerms, 200);
  window.setTimeout(highlightTerms, 1000);
}


// Shift all reads "shiftDist" pixels
function shift(shiftDist) {
  var reads = Crafty('Read').get();
  if (reads.length === 0) {
    return;
  }
  // Check if there's room to move everything in that direction.
  //TODO: optimize if necessary by combining this check and the actual move loop
  for (var i = 0; i < reads.length; i++) {
    // Skip if the read is below the main panel.
    if (reads[i]._y >= Panels.main.y+Panels.main.h) {
      continue;
    }
    var new_x = reads[i]._x + shiftDist;
    var snapped_x = snap(new_x, reads[i]._w, Panels.main.x,
                         Panels.main.x+Panels.main.w);
    // If snap() says the new_x must be modified, then we must be butting up
    // against the edge of the game area. Abort shift.
    if (new_x !== snapped_x) {
      return;
    }
  }
  // Now loop again, but actually shift everything.
  for (var i = 0; i < reads.length; i++) {
    // Skip if the read is below the main panel.
    if (reads[i]._y >= Panels.main.y+Panels.main.h) {
      continue;
    }
    reads[i].x = reads[i]._x + shiftDist;
  }
  // And update the consensus sequence.
  Game.baseGrid.fill();
  calcConsensus(Game.baseGrid);
}
// Shift left by one grid increment
function shiftLeft() {
  shift(-BASE_SIZE);
}
// Shift right by one grid increment
function shiftRight() {
  shift(BASE_SIZE);
}
