'use strict';
/* exported GAME, MAIN, HEAD, BASE_SIZE, READ_LENGTH, NUM_READS, COLORS, Z */

// Defines the size of each square in the grid.
var BASE_SIZE = 40;
var READ_LENGTH = 8;
var NUM_READS = 7;
// Dimensions of the panels that make up the game area
// x and y set where the top-left corner of the panel are.
var HEAD = {w: 800, h: 50, x: 0, y: 0};
var CONSENSUS = {w: HEAD.w, h: 2*BASE_SIZE, x: 0, y: HEAD.y+HEAD.h};
var MAIN = {w: HEAD.w, h: NUM_READS*BASE_SIZE, x: 0, y: CONSENSUS.y+CONSENSUS.h};
var BANK = {w: HEAD.w, h: NUM_READS*BASE_SIZE, x: 0, y: MAIN.y+MAIN.h+BASE_SIZE};
var PARAM = {w: 115, h: MAIN.y+MAIN.h, x: 10+HEAD.x+HEAD.w, y: 0};
var POPUP = {x: MAIN.x+(100/2), y: 75, w: MAIN.w-100, h: 500};
// Size of entire Crafty game area
var GAME = {w: PARAM.x+PARAM.w+1, h: 1+BANK.y+BANK.h};
var COLORS = {'A':'#A44', 'C':'#448', 'G':'#484', 'T':'#AA4', 'N':'#DDD'};
var Z = {read:   20, base:   10, border:   15,
         readFG: 30, baseFG: 17, borderFG: 22,
         popup: 50, popupBit: 60};
