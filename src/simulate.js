'use strict';
/* global Game, replaceChar */
/* exported ToyPrng, randSeq, wgsim */

var BASES = ['A', 'C', 'G', 'T'];


// A simple, seedable pseudo-random number generator.
// Very easy to reverse engineer. DO NOT USE FOR ANYTHING SECURE!
// Taken from https://stackoverflow.com/a/19303725/726773
function ToyPrng(seed) {
  // Seed setter.
  this.setSeed = function(seed) {
    // Convert to number, or NaN if not a number (or undefined)
    seed = +seed;
    // Check for invalid seeds. Includes 0 and multiples of pi.
    if (! seed || seed === Infinity || seed === -Infinity ||
        seed === seed/Math.PI === Math.floor(seed/Math.PI)) {
      console.log('Error: Invalid PRNG seed.');
      return false;
    } else {
      this._seed = seed;
    }
  };
  Object.defineProperty(this, 'seed', {
    set: this.setSeed,
    get: function() { return this._seed; },
  });
  // Set the seed on construction
  this.seed = 1;
  if (seed !== undefined) {
    this.seed = seed;
  }
  // Return a random float between 0 and 1 (including 0, not including 1).
  this.random = function() {
    this.seed++;
    var x = Math.sin(this.seed) * 10000;
    return x - Math.floor(x);
  };
  // Return a random integer between 0 and max-1 (inclusive).
  this.randInt = function(max) {
    return Math.floor(this.random() * max);
  };
  // Shuffle an array
  // From https://stackoverflow.com/a/6274381/726773
  this.shuffle = function(arr) {
    var j, x, i = arr.length;
    while (i) {
      j = this.randInt(i);
      x = arr[--i];
      arr[i] = arr[j];
      arr[j] = x;
    }
    return arr;
  };
}


// Return a random base from BASES, using the global PRNG.
function randBase() {
  return BASES[Game.prng.randInt(BASES.length)];
}


// Generate a random sequence "length" bases long.
function randSeq(length) {
  var seq = '';
  for (var i = 0; i < length; i++) {
    seq += randBase();
  }
  return seq;
}


/* Generate "numReads" random reads of length "readLength" from a given
 * reference sequence. Ensures all bases of the reference are covered by at
 * least "minCoverage" reads (omit it or set it to 0 to eliminate that
 * constraint).
 */
function wgsim(reference, numReads, readLength, minCoverage, snpRate) {
  if (minCoverage === undefined) {
    minCoverage = 0;
  }
  // "reads" is the actual read sequences
  var reads = new Array(numReads);
  // "starts" is the start coordinates of all the reads, using the same indices
  // as "reads"
  var starts = new Array(numReads);
  // "coverage" is an array of coverage values so that coverage[i] is the number
  // of reads covering base "i" of the reference.
  var coverage = new Array(reference.length);
  for (var i = 0; i < coverage.length; i++) {
    coverage[i] = 0;
  }
  for (var i = 0; i < numReads; i++) {
    var start = Game.prng.randInt(reference.length - readLength);
    var readData = getRead(reference, start, readLength, coverage, snpRate);
    starts[i] = start;
    reads[i] = readData.read;
    coverage = readData.coverage;
  }
  return fixCoverage(reads, starts, coverage, minCoverage, reference,
                     readLength, snpRate);
}


/* Generate a read of length "readLength" from the sequence "reference"
 * starting at coordinate "start", with an error rate "snpRate" and increment
 * the covered bases in the "coverage" array.
 * Returns an object with the read sequence ("read") and the coverage array
 * ("coverage").
 */
function getRead(reference, start, readLength, coverage, snpRate, indelRate) {
  console.assert(indelRate === undefined, "Error: indelRate not yet supported "+
         "in getRead().");
  var read = reference.substring(start, start+readLength);
  // actualLength can be different, once indels are implemented.
  var actualLength = readLength;
  // Mutate bases randomly according to snpRate.
  if (snpRate !== undefined && snpRate > 0) {
    for (var i = 0; i < actualLength; i++) {
      if (Game.prng.random() < snpRate) {
        read = replaceChar(read, i, randBase());
      }
    }
  }
  // keep track of which bases of the reference are covered by reads
  for (var i = 0; i < actualLength; i++) {
    coverage[start+i]++;
  }
  return {'read':read, 'coverage':coverage};
}


// Make sure all bases are covered by at least minCoverage reads.
function fixCoverage(reads, starts, coverage, minCoverage, reference,
                     readLength, snpRate) {
  var tries = 0;
  while (tries < 50) {
    var peak = getCoveragePeak(coverage);
    var gap = getCoverageGap(coverage, minCoverage);
    // No gap? We're done.
    if (gap === null) {
      break;
    }
    // Get a list of reads which cover the highest peak.
    var peakReads = [];
    for (var i = 0; i < reads.length; i++) {
      var start = starts[i];
      var end = start + readLength - 1;
      // Check for any overlap between the read and the peak
      if (start <= peak.end && end >= peak.start) {
        peakReads.push(i);
      }
    }
    // Randomly choose a read to replace and delete it from the coverage array.
    var r = peakReads[Game.prng.randInt(peakReads.length)];
    var start = starts[r];
    for (var i = 0; i < readLength; i++) {
      coverage[start+i]--;
    }
    // Generate a new, random read which covers at least one base of the gap.
    var min = gap.start - readLength + 1;
    if (min < 0) {
      min = 0;
    }
    var max = gap.end;
    if (max + readLength - 1 > reference.length) {
      max = reference.length - readLength;
    }
    var start = min + Game.prng.randInt(max - min + 1);
    var readData = getRead(reference, start, readLength, coverage, snpRate);
    starts[r] = start;
    reads[r] = readData.read;
    coverage = readData.coverage;
    console.log("subtracted from ["+peak.start+", "+peak.end+"], added to ["+
      gap.start+", "+gap.end+"]: "+coverage);
    tries++;
  }
  console.log("tries to fix coverage: "+tries);
  return reads;
}


// Find the largest coverage peak: a contiguous set of bases with the maximum
// coverage observed.
// Returns the start and end coordinates of the peak, plus the coverage value.
function getCoveragePeak(coverage) {
  var peak = {cvg:0, start:0, end:0};
  var inPeak = false;
  for (var i = 0; i < coverage.length; i++) {
    // Found a new coverage high?
    if (coverage[i] > peak.cvg) {
      peak.cvg = coverage[i];
      peak.start = i;
      inPeak = true;
    }
    // Exiting the area of peak coverage
    if (inPeak && coverage[i] < peak.cvg) {
      peak.end = i-1;
      inPeak = false;
    }
  }
  return peak;
}


// Return the start and end coordinates of the first region below minCoverage.
// If there is no area below minCoverage, return null.
function getCoverageGap(coverage, minCoverage) {
  var gap = {start:0, end:0};
  var inGap = false;
  for (var i = 0; i < coverage.length; i++) {
    if (coverage[i] < minCoverage) {
      // We're newly in a gap.
      if (! inGap) {
        gap.start = i;
        inGap = true;
      }
    } else {
      // We're newly out of a gap.
      if (inGap) {
        gap.end = i-1;
        inGap = false;
        return gap;
      }
    }
  }
  // If the gap ran until the end.
  if (inGap) {
    gap.end = coverage.length-1;
    return gap;
  } else {
    return null;
  }
}
