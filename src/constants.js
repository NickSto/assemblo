'use strict';
/* exported BASE_SIZE, PARAMS, PARAMS_ORDER, NUM_READS, HEAD, CONSENSUS, MAIN,
            BANK, PARAM, POPUP, GAME, COLORS, Z, GLOSSARY */

// Defines the size of each square in the grid.
var BASE_SIZE = 40;

/* User-adjustable parameters.
 * Includes data to fill the PARAM panel:
 * text1+text2 form the parameter label. "text1" will be highlighted in blue and
 * clickable for a glossary definition. "text2" will be in the default color
 * (black). "default" is the starting value of the parameter. "w1" is the width
 * of "text1", to tell makeParams() where to draw "text2".
 */
var PARAMS = {
  readLength: {
    default:8, type:'int',
    text:'<a class="term" data-term="readLength">read length</a>',
  },
  depth: {
    default:2.8, type:'float',
    text:'sequencing', line2: '<a class="term" data-term="depth">depth</a>',
  },
  errorRate: {
    default:0.0, type:'float',
    text:'<a class="term" data-term="error">error</a> rate',
  },
  snpRate: {
    default:0.0, type:'float',
    text:'<a class="term" data-term="snp">SNP</a> rate',
  },
  popSize: {
    default:1, type:'int',
    text:'<a class="term" data-term="popSize">population</a> size',
  },
  genomeLength: {
    default:20, type:'int',
    text:'<a class="term" data-term="genomeLength">genome length</a>',
  },
};
// This determines which parameters show up in the interface, and in what order.
var PARAMS_ORDER = [
  'readLength', 'depth', 'errorRate', 'snpRate', 'genomeLength',
];

var NUM_READS = 7;
var COLORS = {'A':'#A44', 'C':'#448', 'G':'#484', 'T':'#AA4', 'N':'#DDD'};
var Z = {read:   20, base:   10, border:   15,
         readFG: 30, baseFG: 17, borderFG: 22,
         popup:  50};

// Dimensions of the panels that make up the game area
// x and y set where the top-left corner of the panel are.
var HEAD = {w: 800, h: 50, x: 0, y: 0};
var CONSENSUS = {w: HEAD.w, h: 2*BASE_SIZE, x: 0, y: HEAD.y+HEAD.h};
var MAIN = {w: HEAD.w, h: NUM_READS*BASE_SIZE, x: 0, y: CONSENSUS.y+CONSENSUS.h};
var BANK = {w: HEAD.w, h: NUM_READS*BASE_SIZE, x: 0, y: MAIN.y+MAIN.h+BASE_SIZE};
var PARAM = {w: 115, h: MAIN.y+MAIN.h, x: 10+HEAD.x+HEAD.w, y: 0};
var POPUP = {x: MAIN.x+(100/2), y: 75, w: MAIN.w-100, h: 535};
// Size of entire Crafty game area
var GAME = {w: PARAM.x+PARAM.w+1, h: 1+BANK.y+BANK.h};

/* Text for the UI */

var GLOSSARY = {
  readLength: {
    title: 'Read length',
    video: 'assets/readlength.mp4',
    text: 'A read is a short sequence of DNA created by a sequencing machine. '+
      'They can differ in length depending on the machine, which can '+
      'complicate genome assembly (try it out by changing read length in the '+
      'game!).',
  },
  depth: {
    title: 'Depth',
    video: 'assets/depth.mp4',
    text: 'The average number of reads covering each DNA nucleotide in the '+
      'genome. Increasing the sequencing depth makes it easier to assemble a '+
      'genome and account for errors! You can calculate the number of reads '+
      'your sequencing machine needs to generate to reach a particular depth '+
      'with this formula: Depth = Reads * ReadLength / GenomeLength.',
  },
  error: {
    title: 'Error',
    video: 'assets/error.mp4',
    text: 'A mistake made by a sequencing machine when sequencing DNA. To a '+
      'person looking at a DNA sequence, a sequencing error will look like a '+
      'SNP, but the two are completely different! To see how sequencing error '+
      'can complicate an assembly, try increasing the error rate before '+
      'playing your next Assemblo game.',
  },
  snpRate: {
    title: 'SNP',
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
  popSize: {
    title: 'Poupulation size',
    video: 'assets/population.mp4',
    text: 'The number of people the sequence reads are coming from.',
  },
  genomeLength: {
    title: 'Genome length',
    video: 'assets/genomesize.mp4',
    text: 'A genome is a copy of all the DNA used to make an organism. You, '+
      'if you\'re a human, have two copies of your genome - one from your mom '+
      'and one from your dad. Genomes come in all different sizes (the human '+
      'genome is a whopping 3.3 <strong>billion</strong> base pairs in '+
      'length!) and longer genomes are typically more different to assemble, '+
      'usually because there are more pieces in these puzzles. Try this out '+
      'by increasing or decreasing the size of the genome in Assemblo.',
  },
};

var ABOUT_TEXT = 'Assemblo was created to teach the public about genome '+
  'assembly, a necessary first step for any genomics application. This '+
  'interactive game demonstrates the process of de novo assembly, the most '+
  'common method to create a reference genome. To play, simply press "New '+
  'Game" and slide the <a class="term" data-term="readLength">reads</a> in '+
  'the bottom half of the screen to create an '+
  'assembled sequence, shown at the top of the screen. You know you\'ve '+
  'assembled the sequence correctly when you see a green check! If you want '+
  'to increase the difficulty, try changing the parameters on the right side. '+
  'If you\'re confused about any terms you see, click on the word or click '+
  'the glossary. To learn more about the applications of genome assembly, '+
  'click here. If you want to give us feedback on Assemblo (please do!) '+
  '<a target="_blank" href="https://docs.google.com/forms/d/1g7CHvc35_7inTc3os'+
  'vIHqtAX6f_AwsWCWQB4QZTf5lI/viewform">click here</a> to take a short survey '+
  'about how we can improve the Assemblo game.';


