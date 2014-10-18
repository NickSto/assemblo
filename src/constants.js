'use strict';
/* exported GAME_WIDTH, GAME_HEIGHT, MAIN, HEAD, BASE_SIZE, READ_LENGTH,
            NUM_READS, COLORS */

// Defines the size of each square in the grid.
var BASE_SIZE = 50;
var READ_LENGTH = 8;
var NUM_READS = 7;
// Dimensions of the panels that make up the game area
// x and y set where the top-left corner of the panel are.
var HEAD = {width: 1000, height: 50, x: 0, y: 0};
var CONSENSUS = {width: 1000, height: 2*BASE_SIZE, x: 0, y: HEAD.y+HEAD.height};
var MAIN = {width: 1000, height: (NUM_READS+1)*BASE_SIZE, x: 0, y: CONSENSUS.y+CONSENSUS.height};
var BANK = {width: 1000, height: NUM_READS*BASE_SIZE, x: 0, y: MAIN.y+MAIN.height+BASE_SIZE};
// Size of entire Crafty game area
var GAME = {width: 1001, height: 1+BANK.y+BANK.height};
var COLORS = {'A':'#A44', 'C':'#448', 'G':'#484', 'T':'#AA4', 'N':'#DDD'};
var Z_READ = 10;
var Z_BASE = 5;
var Z_READ_FG = 15;
var Z_BASE_FG = 7;