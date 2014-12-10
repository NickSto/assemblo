'use strict';
/* global Crafty, Game, GAME_WIDTH, GAME_HEIGHT, NUM_READS, PARAMS,
          PARAMS_ORDER, GLOSSARY, ABOUT, APPLICATIONS, drawGrid, calcConsensus,
          makeConsensus, restartGame, startVideo, snap, makeSuccessIndicator */
/* exported Panels, makeUI, drawPanel, drawLine, readParameters */


// Dimensions of the panels that make up the game area
// x and y set where the top-left corner of the panel are.
var Panels = (function() {
  var width = 800;
  var x = 0;
  var y = 0;
  var head = {w: width, h: 50, x: x, y: y};
  var consensus = {w: width, h: Game.cell, x: x, y: head.y+head.h};
  var main = {w: width, h: NUM_READS*Game.cell,
              x: x, y: consensus.y+consensus.h+Game.cell};
  var bank = {w: width, h: NUM_READS*Game.cell,
              x: x, y: main.y+main.h+Game.cell};
  var param = {w: 115, h: main.y+main.h, x: 10+main.x+main.w, y: y};
  var popup = {w: width-100, h: 535, x: main.x+50, y: 75};
  return {head: head, consensus: consensus, main: main, bank: bank,
          param: param, popup: popup};
})();


// Make buttons, icons, controls, etc.
function makeUI() {
  // Destroy all existing objects.
  Crafty.scene('destroyAll');
  // New Game
  Crafty.e('Button')
    .attr({x: Panels.head.x+60, y: Panels.head.y+10, w: 145, h: 30})
    .color('#CAC')
    .text('New Game')
    .bind('Click', newGame);
  // Intro
  Crafty.e('Button')
    .attr({x: Panels.head.x+215, y: Panels.head.y+10, w: 70, h: 30})
    .color('#ACC')
    .text('Intro')
    .bind('Click', startVideo);
  // About
  Crafty.e('Button')
    .attr({x: Panels.head.x+Panels.head.w-150, y: Panels.head.y+10,
           w: 90, h: 30})
    .color('#CCA')
    .text('About')
    .bind('Click', makeAbout);
  // The shift buttons
  Crafty.e('Button')
    .attr({x: Panels.head.x, y: Panels.head.y+10, w: 50, h: 30})
    .color('#CCC')
    .text('<')
    .bind('Click', shiftLeft);
  Crafty.e('Button')
    .attr({x: Panels.head.x+Panels.head.w-50, y: Panels.head.y+10,
           w: 50, h: 30})
    .color('#CCC')
    .text('>')
    .bind('Click', shiftRight);
  // Draw panels.
  drawPanel(Panels.main);
  drawPanel(Panels.bank);
  makeParamPanel();
  drawGrid();
  // Make blank consensus box
  Game.consensus = makeConsensus(Game.genomeLength);
}


function resizePanels(Panels, Game) {
  var width = Game.genomeLength * Game.cell;
  Panels.head.w = width;
  Panels.consensus.w = width;
  Panels.main.w = width;
  Panels.bank.w = width;
  Panels.param.x = Panels.main.x + Panels.main.w + 10;
  Panels.popup.x = Panels.main.x + Panels.popup.w/2;
  if (Panels.popup.x < 0) {
    Panels.popup.x = 0;
  }
  console.assert(Panels.param.x+Panels.param.w < GAME_WIDTH &&
                 Panels.bank.x+Panels.bank.h < GAME_HEIGHT,
                 'Error: Interface dimensions exceed Crafty canvas size.');
  return Panels;
}


function drawPanel(panel) {
  // Subtract 1 from the width/height so the right/bottom lines are placed where
  // you expect.
  var modPanel = {x:panel.x, y:panel.y, w:panel.w-1, h:panel.h-1};
  Crafty.e('HTML, 2D')
    .attr(modPanel)
    .css('border', '1px solid #DDD');
}


function makeParamPanel() {
  var param = Panels.param;
  var y = param.y;
  y += 13;
  // Title/logo
  Crafty.e('Writing, Mouse')
    .attr({x:param.x+8, y:y, string:'Assemblo', size:21, color:'#6600CC'})
    .css('cursor', 'pointer')
    .bind('Click', makeAbout);
  // Make success indicator
  Game.success = setSuccessIndicator();
  y += 90;
  // Parameters section header
  Crafty.e('Writing')
    .attr({x:param.x+8, y:y, string:'Parameters', size:14});
  y += 25;
  y = makeParams(y, PARAMS, PARAMS_ORDER);
  param.h = y - param.y;
  drawPanel(param);
}


// Draw each user-adjustable parameter box
function makeParams(y, params, paramsOrder) {
  var xMargin = 12;
  var ySpace = 35;
  var lineHeight = 15;
  var wBox = 25;
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
  window.setTimeout(activateTerms, 100);
  return y;
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


// Link text marked up as glossary terms
function activateTerms() {
  var terms = document.getElementsByClassName('term');
  for (var i = 0; i < terms.length; i++) {
    if (terms[i].onclick !== undefined) {
      terms[i].onclick = define;
    }
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
  about.body.string = ABOUT;
  about.body.w = about.w - 2*about.margin;
  //TODO: Set activateTerms to fire when the text is actually loaded, instead
  //      of this kludge.
  window.setTimeout(activateTerms, 200);
  window.setTimeout(activateTerms, 1000);
}


function makeApplications() {
  var apps = Crafty.e('Popup');
  apps.title.string = 'Genome Assembly: What is it good for?';
  apps.body.string = APPLICATIONS;
  apps.body.w = apps.w - 2*apps.margin;
  apps.h = apps.y + 530;
  //TODO: Figure out why closeButton's height keeps changing when apps.h does.
  apps.closeButton.h = 18;
  //TODO: Set activateTerms to fire when the text is actually loaded, instead
  //      of this kludge.
  window.setTimeout(activateTerms, 200);
  window.setTimeout(activateTerms, 1000);
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
  shift(-Game.cell);
}
// Shift right by one grid increment
function shiftRight() {
  shift(Game.cell);
}
