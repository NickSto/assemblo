'use strict';
/* exported GAME_WIDTH, GAME_HEIGHT, MAIN, HEAD, BASE_SIZE, READ_LENGTH,
            NUM_READS, COLORS */

var GAME_WIDTH = 1024;
var GAME_HEIGHT = 1024;
// The MAIN panel is the main game area.
// x and y set where the top-left corner of the panel are.
var MAIN = {width: 1024, height: 1024, x: 0, y: 50};
var HEAD = {width: 1024, height: 50, x: 0, y: 0};
// Defines the size of each square in the grid.
var BASE_SIZE = 50;
var READ_LENGTH = 8;
var NUM_READS = 7;
var COLORS = {'A':'#A44', 'C':'#448', 'G':'#484', 'T':'#AA4', 'N':'#DDD'};
