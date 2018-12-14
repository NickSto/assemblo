'use strict';
/* exported GAME_WIDTH, GAME_HEIGHT, PARAMS, PARAMS_ORDER, BASES, COLORS, Z,
            POPUPS */

// size of entire Crafty game area
var GAME_WIDTH = 1001;
var GAME_HEIGHT = 751;

// Parameters for sequencing simulation.
var PARAMS = {
  readLength: {
    default:8, type:'int', min:2,
    text:'<a class="popup term" data-frag="read">read</a> length',
  },
  depth: {
    default:2.8, type:'float', min:1.0,
    text:'sequencing', line2: '<a class="popup term" data-frag="depth">depth</a>',
  },
  errorRate: {
    default:0.0, type:'float', min:0.0, max:1.0,
    text:'<a class="popup term" data-frag="error">error</a> rate',
  },
  snpRate: {
    default:0.0, type:'float', min:0.0, max:1.0,
    text:'<a class="popup term" data-frag="snp">SNP</a> rate',
  },
  popSize: {
    default:1, type:'int', min:1,
    text:'<a class="popup term" data-frag="popSize">population</a> size',
  },
  genomeLength: {
    default:20, type:'int', min:10, max: 75,
    text:'<a class="popup term" data-frag="genome">genome</a> length',
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
var POPUPS = {
  // Glossary definitions
  read: {
    title: 'Read',
    h: 480,
    media: {
      url: 'video/readlength.mp4', type: 'video',
      w: 480, h: 300, align: 'center',
    },
    body: 'A read is a short sequence of DNA created by a sequencing machine. They can differ in '+
      'length depending on the machine, which can complicate <a class="popup term" '+
      'data-frag="genome">genome</a> assembly (try it out by changing read length in the game!).',
  },
  depth: {
    title: 'Depth',
    h: 510,
    media: {
      url: 'video/depth.mp4', type: 'video',
      w: 480, h: 300, align: 'center',
    },
    body: 'The average number of <a class="popup term" data-frag="read">reads</a> covering each '+
      'DNA nucleotide in the <a class="popup term" data-frag="genome">genome</a>. Increasing the '+
      'sequencing depth makes it easier to assemble a genome and account for '+
      '<a class="popup term" data-frag="error">errors</a>! You can calculate the number of reads '+
      'your sequencing machine needs to generate to reach a particular depth with this formula: '+
      'Depth = Reads * ReadLength / GenomeLength.',
  },
  error: {
    title: 'Error',
    h: 490,
    media: {
      url: 'video/error.mp4', type: 'video',
      w: 480, h: 300, align: 'center',
    },
    body: 'A mistake made by a sequencing machine when sequencing DNA. To a person looking at a '+
      'DNA sequence, a sequencing error will look like a <a class="popup term" data-frag="snp">SNP'+
      '</a>, but the two are completely different! To see how sequencing error can complicate an '+
      'assembly, try increasing the error rate before playing your next Assemblo game.',
  },
  snp: {
    title: 'SNP',
    h: 550,
    media: {
      url: 'video/snp.mp4', type: 'video',
      w: 480, h: 300, align: 'center',
    },
    body: 'Short for Single Nucleotide Polymorphism, which means that a given DNA sequence '+
      'differs from an (almost) identical DNA sequence at a single position. In sequence data, '+
      'SNPs can come when a population (more than 1 cell type, person, dog, etc)  is sequenced. '+
      'Most <a class="popup term" data-frag="reference">reference</a> genomes, such as the human '+
      'genome, are actually assembled from a population. Although some SNPs in certain genes have '+
      'been associated with certain diseases, the majority of SNPs are not harmful at all and are '+
      'just a source of genetic variation.',
  },
  popSize: {
    title: 'Population size',
    h: 435,
    media: {
      url: 'video/population.mp4', type: 'video',
      w: 480, h: 300, align: 'center',
    },
    body: 'The number of people the sequence reads are coming from.',
  },
  genome: {
    title: 'Genome',
    h: 530,
    media: {
      url: 'video/genomesize.mp4', type: 'video',
      w: 480, h: 300, align: 'center',
    },
    body: 'A genome is a copy of all the DNA used to make an organism. You, if you\'re a human, '+
      'have two copies of your genome - one from your mom and one from your dad. Genomes come in '+
      'all different sizes (the human genome is a whopping 3.3 <strong>billion</strong> '+
      'nucleotides in length!) and longer genomes are typically harder to assemble, usually '+
      'because there are more pieces in these puzzles. Try this out by increasing or decreasing '+
      'the size of the genome in Assemblo.',
  },
  denovo: {
    title: '<em>De novo</em> assembly',
    h: 175,
    body: 'Sequencing and assembly of a <a class="popup term" data-frag="genome">genome</a> '+
      'without knowing beforehand how it goes together. Examples of <em>de novo</em> assemblers '+
      '(besides Assemblo!) include: SSAKE, SHARCGS, VCAKE, Newbler, Celera Assembler, Euler, '+
      'Velvet, ABySS, AllPaths, and SOAPdenovo.',
  },
  reference: {
    title: 'Reference genome',
    h: 200,
    body: 'An already assembled <a class="popup term" data-frag="genome">genome</a> that is used '+
      'to represent an organism\'s set of genes. An assembled reference genome is used as a '+
      'comparison for other applications of genome sequencing. Sometimes these are assembled from '+
      'a population of individuals, in which case there can be differences between it and any '+
      'real genome that exists in nature!',
  },
  // Special pages
  intro: {
    media: {
      url: 'video/intro.mp4',
      embed: 'GS9z9O8nbC4',
      w: 640, h: 400,
    },
  },
  about: {
    title: 'About Assemblo',
    h: 500,
    media: {
      url: 'img/logo.png', type: 'img',
      w: 300, h: 133, x: 320, y: 0,
    },
    body: '<p>Assemblo was created to teach the public about <a class="popup term" '+
      'data-frag="genome">genome</a> assembly, a necessary first step for any genomics '+
      'application. This interactive game demonstrates the process of <a class="popup term" '+
      'data-frag="denovo"><em>de novo</em> assembly</a>, the most common method to create a '+
      '<a class="popup term" data-frag="reference">reference</a> genome.</p>'+
      '<p>To play, simply press "New Game" and slide the <a class="popup term" data-frag="read">'+
      'reads</a> in the bottom half of the screen to create an assembled sequence, shown at the '+
      'top of the screen. You know you\'ve assembled the sequence correctly when you see a green '+
      'check! If you want to increase the difficulty, try changing the parameters on the right '+
      'side.</p>'+
      '<p>To learn more about the applications of genome assembly, <a class="popup term" '+
      'data-frag="applications">click here</a>. If you want to give us feedback on Assemblo '+
      '(please do!) <a target="_blank" href='+
      '"https://docs.google.com/forms/d/1g7CHvc35_7inTc3osvIHqtAX6f_AwsWCWQB4QZTf5lI/viewform">'+
      'click here</a> to take a short survey about how we can improve the Assemblo game.</p>'+
      '<p>Assemblo was created in 2014 by <a target="_blank" href="https://nstoler.com">'+
      'Nick Stoler</a>, <a target="_blank" href="http://sites.psu.edu/zachfuller/">Zach Fuller</a>'+
      ', and <a target="_blank" href="https://sites.psu.edu/theodoramaravegias/">'+
      'Theodora Maravegias</a>. It\'s open source (GPLv2) and available <a target="_blank" '+
      'href="https://github.com/NickSto/assemblo">here</a>.</p>',
  },
  applications: {
    title: 'Genome Assembly: What is it good for?',
    h: 580,
    body: 'Genome assembly opens up countless possibilities for the real-world applications of '+
      'genomics. With a well-assembled <a class="popup term" data-frag="reference">reference '+
      'genome</a>, we can: <ul>'+
        '<li>sequence microbes (such as bacteria and viruses) to better understand drug '+
        'resistance to create treatments</li>'+
        '<li>map cancer genomes to a reference to try to narrow down a cancer-causing mutation in '+
        'a gene</li>'+
        '<li>improve disease and genetic-disorder screening of newborns in order to avoid '+
        'delaying treatment</li>'+
        '<li>determine a person\'s response to certain drugs (called pharmacogenomics)</li>'+
        '<li>use well-studied genetic markers to assess a person\'s risk for certain diseases '+
        '(for a cool story on how a scientist used his genome sequence to discover his risk for '+
        'diabetes and then track the development of his disease, read <a target="_blank" '+
        'href="http://news.sciencemag.org/biology/2012/03/examining-his-own-body-stanford-'+
        'geneticist-stops-diabetes-its-tracks">Dr. Michael Snyder\'s story</a>).'+
      '</ul>Genome assembly and sequencing is awesome, right? It can tell us everything we want '+
      'to know about ourselves, right? Wrong (kind of). As much as sequencing your genome may be '+
      'able to tell you if you\'re at a higher risk for diabetes, or why your body doesn\'t '+
      'process a certain medicine well, there are plenty of things we don\'t know about the human '+
      'genome. Due to repetitive elements and other hard-to-sequence spots, the human reference '+
      'genome isn\'t complete. Also, scientists currently still know very little about how to '+
      'interpret a lot of genome sequence data. James Watson, one of the discoverers of the '+
      'structure of DNA, had his genome sequenced and found nothing more interesting than a gene '+
      'that makes him more sensitive to blood pressure medicine. Although not yet perfect, genome '+
      'sequencing is the future of medicine, and it all begins with a well-assembled genome.',
  },
  howto: {
    title: 'How To Play',
    h: 660,
    body: '<p>Assemblo was created to teach the public about <a class="popup term" '+
      'data-frag="genome">genome</a> assembly, a necessary first step for any genomics '+
      'application. This interactive game demonstrates the process of <a class="popup term" '+
      'data-frag="denovo">de novo</a> assembly, the most common method to create a '+
      '<a class="popup term" data-frag="reference">reference</a> genome. To play, follow these '+
      'simple steps:<ol>'+
        '<li>Press "New Game." You should now see your playing pieces at the bottom of the '+
        'screen. These are called reads, which are short stretches of a DNA sequence.</li>'+
        '<li>Drag the reads to the grid in the playing screen. There should be one row in the '+
        'grid for each read.</li>'+
        '<li>Rearrange the reads in the grid to create a single consensus sequence, which is '+
        'shown at the top of the screen (you should see it changing as you move the reads '+
        'around). You\'ll need to take advantage of overlaps in the sequence and unique patterns '+
        'in the reads, much like a de novo assembly computer program!</li>'+
        '<li>When the red X on the left of the screen (under the word Assemblo) turns into a '+
        'green checkmark, you\'re done! That means you have correctly de novo assembled your '+
        'first sequence.</li>'+
      '</ol><p>If that was too easy for you and you\'re ready for a real challenge, you can '+
      'increase the difficulty by changing the sequencing parameters on the left side.  This can '+
      'be done by typing a number into the dialog boxes. Try increasing or decreasing the read '+
      'length first and see which one makes the sequence assembly easier! The other parameters '+
      'can also be changed to create an even more challenging game, and to explore some real-'+
      'life difficulties that come with de novo assembly of real DNA sequences.'+
      '<p>If you\'d like to learn more about the applications of genome assembly, '+
      '<a class="popup term" data-frag="applications">click here</a>. If you want to give us '+
      'feedback on Assemblo (please do!) <a target="_blank" href="https://docs.google.com/forms/d/'+
      '1g7CHvc35_7inTc3osvIHqtAX6f_AwsWCWQB4QZTf5lI/viewform">click here</a> to take a short '+
      'survey about how we can improve the Assemblo game.',
  }
};
