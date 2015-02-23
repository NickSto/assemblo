'use strict';
/* global Crafty, Game, GAME_WIDTH, GAME_HEIGHT, PARAMS, PARAMS_ORDER, POPUPS,
          drawGrid, calcConsensus, makeConsensus, restartGame, startVideo, snap,
          makeSuccessIndicator */
/* exported Panels, makeUI, drawPanel, drawLine, readParameters */


// Dimensions of the panels that make up the game area.
// These values are only the initial ones. They are recalculated each game.
// x and y set where the top-left corner of the panel are.
var Panels = (function() {
  var width = 820;
  var param = {w: 115, h: 343, x: 0, y: 0};
  var main_x = param.x+param.w+10;
  var head = {w: width, h: 50, x: main_x, y: 0};
  var consensus = {w: width, h: Game.cell, x: main_x, y: head.y+head.h};
  var main = {w: width, h: Game.numReads*Game.cell,
              x: main_x, y: consensus.y+consensus.h+Game.cell};
  var bank = {w: width, h: Game.numReads*Game.cell,
              x: main_x, y: main.y+main.h+Game.cell};
  var popup = {w: width-100, h: 535, x: main.x+50, y: 75};
  return {head: head, consensus: consensus, main: main, bank: bank,
          param: param, popup: popup};
})();


// Make buttons, icons, controls, etc.
function makeUI() {
  // Destroy all existing objects.
  Crafty.scene('destroyAll');
  Panels = resizePanels(Panels, Game);
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
    .bind('Click', function() { window.location.hash = '#about'; });
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
  // Monitor the URL's fragment identifier, launch popups on change
  window.addEventListener('hashchange', constructPopup);
}


function resizePanels(Panels, Game) {
  //TODO: Leave a minimum width so the toolbar buttons don't overlap.
  var width = Game.genomeLength * Game.cell;
  Panels.head.w = width;
  Panels.consensus.w = width;
  Panels.main.w = width;
  Panels.bank.w = width;
  Panels.popup.x = Math.max(0, Panels.main.x +
                            (Panels.main.w - Panels.popup.w)/2);
  Panels.consensus.h = Game.cell;
  Panels.main.y = Panels.consensus.y + Panels.consensus.h + Game.cell;
  Panels.main.h = Game.numReads * Game.cell;
  Panels.bank.y = Panels.main.y + Panels.main.h + Game.cell;
  Panels.bank.h = Game.numReads * Game.cell;
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
    .css('border', '1px solid #DDD')
    .z = -1;
}


function makeParamPanel() {
  var param = Panels.param;
  var y = param.y;
  y += 13;
  // Title/logo
  Crafty.e('Writing, Mouse')
    .attr({string:'Assemblo', x:param.x+8, y:y, size:21, color:'#6600CC'})
    .css('cursor', 'pointer')
    .bind('Click', function() { window.location.hash = '#about'; });
  // Make success indicator
  Game.success = setSuccessIndicator();
  y += 90;
  // Parameters section header
  Crafty.e('Writing')
    .attr({string:'Sequencing Parameters', x:param.x+8, y:y, size:14})
    .w = param.w - 2*12;
  y += 40;
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
  var hBox = 24;
  var newGameOnEnter = function(event) {
    if (isEnterKey(event)) {
      newGame();
    }
  };
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
    var box = Crafty.e('Input')
      .attr({w:40, h:hBox, x:Panels.param.x+10, y:y})
      .attr({id:'param_'+paramId, value:Game[paramId], width:wBox});
    box._element.addEventListener('keyup', newGameOnEnter);
    // Input box tooltip
    if (param.min !== undefined || param.max !== undefined) {
      if (param.min !== undefined && param.max !== undefined) {
        box.tip = param.min+' to '+param.max;
      } else if (param.min !== undefined) {
        box.tip = 'greater than '+param.min;
      } else if (param.max !== undefined) {
        box.tip = 'less than '+param.max;
      }
      box.tooltip.w = Panels.param.x+Panels.param.w-(box.x+box.w)-2*xMargin;
    }
    y += ySpace;
  }
  return y;
}


function readParameters(Game) {
  for (var i = 0; i < PARAMS_ORDER.length; i++) {
    var paramId = PARAMS_ORDER[i];
    var param = PARAMS[paramId];
    var value = document.getElementById('param_'+paramId).value;
    value = parseParameter(param, value);
    // If invalid, skip and stick with the previous value.
    if (value === false) {
      console.log('Error: Invalid parameter "'+paramId+'"');
      continue;
    } else {
      Game[paramId] = value;
    }
  }
  if (Game.readLength > Game.genomeLength) {
    console.log('Error: Read length cannot be greater than genome length.');
    Game.readLength = Game.genomeLength;
  }
  return Game;
}


// Parse the parameter string from the input box into the proper type.
// Also validate it. If valid, return the parsed value. Else, return false.
function parseParameter(param, value) {
  // Check whether the value is of the proper type.
  if (param.type === 'int') {
    // Is value not a number? parseFloat() needed to make isNaN more reliable:
    // https://stackoverflow.com/a/2652335
    if (isNaN(parseFloat(value))) {
      return false;
    } else {
      value = Math.round(+value);
    }
  } else if (param.type === 'float') {
    // Is value not a number?
    if (isNaN(parseFloat(value))) {
      return false;
    } else {
      value = parseFloat(value);
    }
  }
  // Check whether the value is within bounds.
  if (param.min !== undefined && value < param.min) {
    return false;
  }
  if (param.max !== undefined && value > param.max) {
    return false;
  }
  return value;
}


// Determine whether a KeyboardEvent is from the enter key, handling most
// cross-browser quirks (see http://unixpapa.com/js/key.html).
function isEnterKey(keyEvent) {
  var keyCode;
  if (typeof keyEvent.which === 'number') {
    keyCode = keyEvent.which;
  } else {
    keyCode = keyEvent.keyCode;
  }
  if (typeof KeyboardEvent === 'function' && KeyboardEvent.DOM_VK_RETURN) {
    return keyCode === KeyboardEvent.DOM_VK_RETURN;
  } else {
    return keyCode === 13;
  }
}


function constructPopup() {
  var name = window.location.hash.slice(1);
  // Don't have multiple popups on the page at once.
  destroyAll('Popup');
  if (!POPUPS.hasOwnProperty(name)) {
    if (name !== '') {
      console.log('Popup name not found: "'+name+'"');
    }
    return;
  }
  var popupData = POPUPS[name];
  var popup = Crafty.e('Popup');
  popup.title.string = popupData.title;
  popup.body.string = popupData.body;
  // Kludge, because setting body.w in the 'Popup' init doesn't work.
  popup.body.w = popup.w - 2*popup.margin;
  if (popupData.media) {
    var media = popupData.media;
    popup.addMedia(media.type, media.url, media.w, media.h);
    if (media.y !== undefined) {
      popup.media.y = popup.y + popup.margin + media.y;
    } else {
      popup.media.y = popup.title.y + popup.title.h + popup.margin;
    }
    if (media.x !== undefined) {
      popup.media.x = popup.x + popup.margin + media.x;
    } else {
      if (media.align === 'left' || media.align === undefined) {
        popup.media.x = popup.x + popup.margin;
      } else if (media.align === 'right') {
        popup.media.x = popup.x + popup.w - popup.margin - media.w;
      } else if (media.align === 'center') {
        popup.media.x = popup.x + (popup.w - media.w)/2;
      }
    }
    popup.body.y = popup.media.y + popup.media.h + popup.margin;
  }
  //TODO: resize the popup after X milliseconds based on text's actual size.
  //TODO: Figure out why assigning to popup.h messes up things like title.h
  //      and closeButton.h.
  popup._h = popupData.h;
}

// var entity = Crafty.e('HTML').attr({x:300, y:100, w:480, h:360});
// entity.replace('<span id="player"></span>');
// makeYoutubeVideo('GS9z9O8nbC4', 'player');

var onYouTubeIframeAPIReady;
function makeYoutubeVideo(videoId, elementId, width, height, onEnd) {
  var player;
  onYouTubeIframeAPIReady = function() {
    player = new YT.Player(elementId, {
      width: width,
      height: height,
      videoId: videoId,
      playerVars: {autohide: 1, modestbranding: 1, showinfo: 0, theme: 'light'},
      events: {
        onReady: function(event) { event.target.playVideo(); },
        onStateChange: function(event) {
          if (onEnd && event.data === YT.PlayerState.ENDED) {
            onEnd();
          }
        },
      },
    });
  }
  // Load Youtube's API if it hasn't been loaded already
  if (document.getElementById('youtube') === null) {
    var script = document.createElement('script');
    script.src = "https://www.youtube.com/iframe_api";
    script.id = 'youtube';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
  } else {
    onYouTubeIframeAPIReady();
  }
  return player;
}


// Load a Youtube video using the embed API.
// Currently supported eventHandlers are onError and onEnd.
// The API requires onYouTubeIframeAPIReady to be global.
var onYouTubeIframeAPIReady;
function makeYoutubeVideo(videoId, elementId, width, height, eventHandlers) {
  var player;
  // Build object listing event handlers.
  var events = {};
  if (eventHandlers) {
    if (eventHandlers.onError) {
      events.onError = eventHandlers.onError;
    }
    if (eventHandlers.onEnd) {
      events.onStateChange = function(event) {
        if (event.data === YT.PlayerState.ENDED) {
          eventHandlers.onEnd();
        }
      };
    }
  }
  onYouTubeIframeAPIReady = function() {
    player = new YT.Player(elementId, {
      width: width,
      height: height,
      videoId: videoId,
      playerVars: {autoplay: 1, autohide: 1, modestbranding: 1, showinfo: 0,
                   theme: 'light'},
      events: events,
    });
  }
  // Load Youtube's API if it hasn't been loaded already
  if (document.getElementById('youtube') === null) {
    var script = document.createElement('script');
    script.src = "https://www.youtube.com/iframe_api";
    script.id = 'youtube';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(script, firstScriptTag);
  } else {
    onYouTubeIframeAPIReady();
  }
  return player;
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
