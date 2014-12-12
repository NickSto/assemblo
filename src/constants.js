'use strict';
/* exported GAME_WIDTH, GAME_HEIGHT, PARAMS, PARAMS_ORDER, BASES, COLORS, Z,
            GLOSSARY, ABOUT, APPLICATIONS */

// size of entire Crafty game area
var GAME_WIDTH = 1001;
var GAME_HEIGHT = 751;

// Parameters for sequencing simulation.
var PARAMS = {
  readLength: {
    default:8, type:'int', min:2,
    text:'<a class="term" data-term="read">read</a> length',
  },
  depth: {
    default:2.8, type:'float', min:1.0,
    text:'sequencing', line2: '<a class="term" data-term="depth">depth</a>',
  },
  errorRate: {
    default:0.0, type:'float', min:0.0, max:1.0,
    text:'<a class="term" data-term="error">error</a> rate',
  },
  snpRate: {
    default:0.0, type:'float', min:0.0, max:1.0,
    text:'<a class="term" data-term="snp">SNP</a> rate',
  },
  popSize: {
    default:1, type:'int', min:1,
    text:'<a class="term" data-term="popSize">population</a> size',
  },
  genomeLength: {
    default:20, type:'int', min:10, max: 75,
    text:'<a class="term" data-term="genome">genome</a> length',
  },
};
// This determines which parameters show up in the interface, and in what order.
var PARAMS_ORDER = [
  'readLength', 'depth', 'errorRate', 'genomeLength',
];

// valid bases which can compose a DNA sequence
var BASES = ['A', 'C', 'G', 'T'];
var COLORS = {'A':'#A44', 'C':'#448', 'G':'#484', 'T':'#AA4', 'N':'#DDD'};
var Z = {read:   20, base:   10, border:   15,
         readFG: 30, baseFG: 17, borderFG: 22,
         popup:  50};

/* Text for the UI */

var GLOSSARY = {
  read: {
    title: 'Read',
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
  snp: {
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
    title: 'Population size',
    video: 'assets/population.mp4',
    text: 'The number of people the sequence reads are coming from.',
  },
  genome: {
    title: 'Genome',
    video: 'assets/genomesize.mp4',
    text: 'A genome is a copy of all the DNA used to make an organism. You, '+
      'if you\'re a human, have two copies of your genome - one from your mom '+
      'and one from your dad. Genomes come in all different sizes (the human '+
      'genome is a whopping 3.3 <strong>billion</strong> nucleotides in '+
      'length!) and longer genomes are typically harder to assemble, '+
      'usually because there are more pieces in these puzzles. Try this out '+
      'by increasing or decreasing the size of the genome in Assemblo.',
  },
  denovo: {
    title: '<em>De novo</em> assembly',
    text: 'Sequencing and assembly of a genome without knowing beforehand how '+
      'it goes together. Examples of <em>de novo</em> assemblers (besides '+
      'Assemblo!) include: SSAKE, SHARCGS, VCAKE, Newbler, Celera Assembler, '+
      'Euler, Velvet, ABySS, AllPaths, and SOAPdenovo.',
  },
  reference: {
    title: 'Reference genome',
    text: 'An already assembled genome that is used to represent an '+
      'organism\'s set of genes. An assembled '+
      'reference genome is used as a comparison for other applications of '+
      'genome sequencing. Sometimes these are assembled from a '+
      'population of individuals, in which case there can be differences '+
      'between it and any real genome that exists in nature!',
  },
};

var POPUPS = {
  about: {
    title: 'About Assemblo',
    h: 400,
    media: {
      url: 'assets/logo.png', type: 'image',
      w: 300, h: 133, x: 345, y: 0,
    },
    body: 'Assemblo was created to teach the public about '+
      '<a class="popup" href="#genome">genome</a> '+
      'assembly, a necessary first step for any genomics application. This '+
      'interactive game demonstrates the process of <a class="popup" '+
      'href="#denovo"><em>de novo</em> assembly</a>, '+
      'the most common method to create a <a class="popup" href="#reference">'+
      'reference</a> genome. To play, simply press "New '+
      'Game" and slide the <a class="popup" href="#read">reads</a> in '+
      'the bottom half of the screen to create an '+
      'assembled sequence, shown at the top of the screen. You know you\'ve '+
      'assembled the sequence correctly when you see a green check! If you want '+
      'to increase the difficulty, try changing the parameters on the right side. '+
      'To learn more about the applications of genome assembly, '+
      //TODO: Use better method to set onclick action
      '<a class="popup" href="#applications">click here</a>. If you want '+
      'to give us feedback on Assemblo (please do!) '+
      '<a target="_blank" href="https://docs.google.com/forms/d/1g7CHvc35_7inTc3os'+
      'vIHqtAX6f_AwsWCWQB4QZTf5lI/viewform">click here</a> to take a short survey '+
      'about how we can improve the Assemblo game.',
  },
};

var ABOUT = 'Assemblo was created to teach the public about '+
  '<a class="term" data-term="genome">genome</a> '+
  'assembly, a necessary first step for any genomics application. This '+
  'interactive game demonstrates the process of <a class="term" '+
  'data-term="denovo"><em>de novo</em> assembly</a>, '+
  'the most common method to create a <a class="term" data-term="reference">'+
  'reference</a> genome. To play, simply press "New '+
  'Game" and slide the <a class="term" data-term="read">reads</a> in '+
  'the bottom half of the screen to create an '+
  'assembled sequence, shown at the top of the screen. You know you\'ve '+
  'assembled the sequence correctly when you see a green check! If you want '+
  'to increase the difficulty, try changing the parameters on the right side. '+
  'To learn more about the applications of genome assembly, '+
  //TODO: Use better method to set onclick action
  '<a class="link" onclick="makeApplications()">click here</a>. If you want '+
  'to give us feedback on Assemblo (please do!) '+
  '<a target="_blank" href="https://docs.google.com/forms/d/1g7CHvc35_7inTc3os'+
  'vIHqtAX6f_AwsWCWQB4QZTf5lI/viewform">click here</a> to take a short survey '+
  'about how we can improve the Assemblo game.';

var APPLICATIONS = 'Genome assembly opens up countless possibilities for the '+
  'real-world applications of genomics. With a well-assembled <a class="term"'+
  'data-term="reference">reference genome</a>, we can: <ul>'+
  '<li>sequence microbes (such as bacteria and viruses) to better understand '+
    'drug resistance to create treatments</li>'+
  '<li>map cancer genomes to a reference to try to narrow down a '+
    'cancer-causing mutation in a gene</li>'+
  '<li>improve disease and genetic-disorder screening of newborns in order to '+
    'avoid delaying treatment</li>'+
  '<li>determine a person\'s response to certain drugs (called '+
    'pharmacogenomics)</li>'+
  '<li>use well-studied genetic markers to assess a person\'s risk for '+
    'certain diseases (for a cool story on how a scientist used his genome '+
    'sequence to discover his risk for diabetes and then track the '+
    'development of his disease, read <a target="_blank" href="http://news.'+
    'sciencemag.org/biology/2012/03/examining-his-own-body-stanford-geneticist'+
    '-stops-diabetes-its-tracks">Dr. Michael Snyder\'s story</a>).'+
  '</ul>Genome assembly and sequencing is awesome, right? It can tell us '+
  'everything we want to know about ourselves, right? Wrong (kind of). As '+
  'much as sequencing your genome may be able to tell you if you\'re at a '+
  'higher risk for diabetes, or why your body doesn\'t process a certain '+
  'medicine well, there are plenty of things we don\'t know about the human '+
  'genome. Due to repetitive elements and other hard-to-sequence spots, the '+
  'human reference genome isn\'t complete. Also, scientists currently still '+
  'know very little about how to interpret a lot of genome sequence data. '+
  'James Watson, one of the discoverers of the structure of DNA, had his '+
  'genome sequenced and found nothing more interesting than a gene that makes '+
  'him more sensitive to blood pressure medicine. Although not yet perfect, '+
  'genome sequencing is the future of medicine, and it all begins with a well-'+
  'assembled genome.';

