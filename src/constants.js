'use strict';
/* exported GAME, MAIN, HEAD, BASE_SIZE, READ_LENGTH, NUM_READS, COLORS, Z_READ,
            Z_BASE, Z_BORDER, Z_READ_FG, Z_BASE_FG, Z_BORDER_FG */

// Defines the size of each square in the grid.
var BASE_SIZE = 40;
var READ_LENGTH = 8;
var NUM_READS = 7;
// Dimensions of the panels that make up the game area
// x and y set where the top-left corner of the panel are.
var HEAD = {width: 800, height: 50, x: 0, y: 0};
var CONSENSUS = {width: 800, height: 2*BASE_SIZE, x: 0, y: HEAD.y+HEAD.height};
var MAIN = {width: 800, height: (NUM_READS+1)*BASE_SIZE, x: 0, y: CONSENSUS.y+CONSENSUS.height};
var BANK = {width: 800, height: NUM_READS*BASE_SIZE, x: 0, y: MAIN.y+MAIN.height+BASE_SIZE};
// Size of entire Crafty game area
var GAME = {width: 801, height: 1+BANK.y+BANK.height};
var COLORS = {'A':'#A44', 'C':'#448', 'G':'#484', 'T':'#AA4', 'N':'#DDD'};
var Z_READ = 20;
var Z_BASE = 10;
var Z_BORDER = 15;
var Z_READ_FG = 30;
var Z_BASE_FG = 17;
var Z_BORDER_FG = 22;
