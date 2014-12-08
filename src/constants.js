'use strict';
/* exported GAME, MAIN, HEAD, BASE_SIZE, READ_LENGTH, NUM_READS, COLORS, Z,
            GLOSSARY, POPUP */

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

// Text for the UI
var GLOSSARY = {
  'read length': {
    video: 'assets/readlength.mp4',
    text: 'A read is a short sequence of DNA created by a sequencing machine. '+
      'They can differ in length depending on the machine, which can '+
      'complicate genome assembly (try it out by changing read length in the '+
      'game!).',
  },
  'depth': {
    text: 'The average number of reads covering any one base in the genome. '+
      'This should equal: (# of reads) * (read length) / (genome length).',
  },
  'error': {
    video: 'assets/error.mp4',
    text: 'A mistake made by a sequencing machine when sequencing DNA. To a '+
      'person looking at a DNA sequence, a sequencing error will look like a '+
      'SNP, but the two are completely different! To see how sequencing error '+
      'can complicate an assembly, try increasing the error rate before '+
      'playing your next Assemblo game.',
  },
  'SNP': {
    video: 'assets/snp.mp4',
    text: 'Short for single nucleotide polymorphism, which basically means '+
      'that a given DNA sequence differs from an (almost) identical DNA '+
      'sequence at a single position. In sequence data, SNPs can come when a '+
      'population (more than 1 cell type, person, dog, etc)  is sequenced. '+
      'Most reference genomes, such as the human genome, are actually '+
      'assembled from a population. Although some SNPs in certain genes have '+
      'been associated with certain diseases, the majority of SNPs are not '+
      'harmful at all and are just a source of genetic variation.',
  },
  'population size': {
    text: 'The number of people the sequence reads are coming from.',
  },
  'genome length': {
    text: 'A genome is a copy of all the DNA used to make an organism. You, '+
      'if you\'re a human, have two copies of your genome - one from your mom '+
      'and one from your dad. Genomes come in all different sizes (the human '+
      'genome is a whopping 3.3 BILLION base pairs in length!) and longer '+
      'genomes are typically more different to assemble, usually because '+
      'there are more pieces in these puzzles. Try this out by increasing or '+
      'decreasing the size of the genome in Assemblo.',
  },
};
