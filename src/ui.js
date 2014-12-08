'use strict';
/* global Crafty, Game, HEAD, CONSENSUS, MAIN, BANK, PARAM, POPUP, BASE_SIZE,
          PARAMS, PARAMS_ORDER, GLOSSARY, snap, calcConsensus, restartGame,
          startVideo, capitalize */
/* exported makeUI, drawPanel, drawLine */


// Make buttons, icons, controls, etc.
function makeUI() {
  // The shift buttons
  Crafty.e('Button')
    .attr({x: HEAD.x, y: HEAD.y+10, w: 50, h: 30})
    .color('#CCC')
    .text('<')
    .bind('Click', shiftLeft);
  Crafty.e('Button')
    .attr({x: HEAD.w - 50, y: HEAD.y+10, w: 50, h: 30})
    .color('#CCC')
    .text('>')
    .bind('Click', shiftRight);
  // Restart the game
  Crafty.e('Button')
    .attr({x: HEAD.x + 60, y: HEAD.y+10, w: 145, h: 30})
    .color('#ACC')
    .text('New Game')
    .bind('Click', restartGame);
  // Run the intro
  Crafty.e('Button')
    .attr({x: HEAD.x + 215, y: HEAD.y+10, w: 70, h: 30})
    .color('#CAC')
    .text('Intro')
    .bind('Click', startVideo);
  // Draw panels, plus a box where the consensus display will be.
  drawPanel({x: CONSENSUS.x, y: CONSENSUS.y, h: BASE_SIZE, w: CONSENSUS.w});
  drawPanel(MAIN);
  drawPanel(BANK);
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
  drawPanel(PARAM);
  makeParams(PARAMS, PARAMS_ORDER);
  // Title/logo
  Crafty.e('Writing')
    .attr({x:PARAM.x+8, y:PARAM.y+13, string:'Assemblo', size:21, color:'#6600CC'});
  // Parameters section header
  Crafty.e('Writing')
    .attr({x:PARAM.x+8, y:PARAM.y+110, string:'Parameters', size:14});
}


// Draw each user-adjustable parameter box
function makeParams(params, paramsOrder) {
  var xMargin = 12;
  var ySpace = 35;
  var lineHeight = 15;
  var wBox = 25;
  var y = MAIN.y+5;
  for (var i = 0; i < paramsOrder.length; i++) {
    var paramId = paramsOrder[i];
    var param = params[paramId];
    if (param.text1 !== undefined) {
      Crafty.e('Writing, Mouse')
        .attr({x:PARAM.x+xMargin, y:y, string:param.text1, color:'#0000DD'})
        .css('cursor', 'pointer')
        .bind('Click', function() { define(this.string); });
    }
    if (param.text2 !== undefined) {
      Crafty.e('Writing')
        .attr({x:PARAM.x+xMargin+param.w1, y:y, string:param.text2});
    }
    y += lineHeight;
    if (param.line2 !== undefined) {
      Crafty.e('Writing')
        .attr({x:PARAM.x+xMargin, y:y, string:param.line2});
      y += lineHeight;
    }
    Crafty.e('Input')
      .attr({h: 30, w:40, x:PARAM.x+10, y:y})
      .attr({id:'param_'+paramId, value:param.default, width:wBox});
    y += ySpace;
  }
}


// Create a pop-up box giving a glossary definition for a term.
function define(term) {
  var popups = Crafty('Popup').get();
  for (var i = 0; i < popups.length; i++) {
    popups[i].destroy();
  }
  var popup = Crafty.e('Popup');
  popup.title.string = capitalize(term);
  if (GLOSSARY[term].video !== undefined) {
    popup.addVideo(GLOSSARY[term].video);
  }
  popup.body.string = GLOSSARY[term].text;
  popup.body.w = POPUP.w - popup.margin;
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


// Shift all reads "shiftDist" pixels
function shift(shiftDist) {
  var reads = Crafty('Read').get();
  if (reads.length === 0) {
    return;
  }
  // Check if there's room to move everything in that direction.
  //TODO: optimize if necessary by combining this check and the actual move loop
  for (var i = 0; i < reads.length; i++) {
    // Skip if the read is below the MAIN panel.
    if (reads[i]._y >= MAIN.y+MAIN.h) {
      continue;
    }
    var new_x = reads[i]._x + shiftDist;
    var snapped_x = snap(new_x, reads[i]._w, MAIN.x, MAIN.x+MAIN.w);
    // If snap() says the new_x must be modified, then we must be butting up
    // against the edge of the game area. Abort shift.
    if (new_x !== snapped_x) {
      return;
    }
  }
  // Now loop again, but actually shift everything.
  for (var i = 0; i < reads.length; i++) {
    // Skip if the read is below the MAIN panel.
    if (reads[i]._y >= MAIN.y+MAIN.h) {
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
