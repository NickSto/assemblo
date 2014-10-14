'use strict';
/* exported GAME_WIDTH, GAME_HEIGHT, MAIN, HEAD, BASE_SIZE, READ_LENGTH,
            NUM_READS, COLORS */

// Defines the size of each square in the grid.
var BASE_SIZE = 50;
var READ_LENGTH = 8;
var NUM_READS = 7;
// Dimensions of the panels that make up the game area
// x and y set where the top-left corner of the panel are.
var HEAD = {width: 1024, height: 50, x: 0, y: 0};
var CONSENSUS = {width: 1024, height: 100, x: 0, y: 50};
var MAIN = {width: 1024, height: 800, x: 0, y: 150};
var BANK = {width: 1024, height: NUM_READS*BASE_SIZE};
// Size of entire Crafty game area
var GAME = {width: 1024, height: HEAD.height+CONSENSUS.height+MAIN.height+BANK.height};
var COLORS = {'A':'#A44', 'C':'#448', 'G':'#484', 'T':'#AA4', 'N':'#DDD'};
