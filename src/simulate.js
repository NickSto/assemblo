'use strict';
/* global console, assert */
/* exported randSeq, wgsim */

var BASES = ['A', 'C', 'G', 'T'];

// A simple, seedable pseudo-random number generator.
// Very easy to reverse engineer. DO NOT USE FOR ANYTHING SECURE!
// Taken from https://stackoverflow.com/a/19303725/726773
function ToyPrng(seed) {
  if (seed === undefined) {
    this._seed = 1;
  } else {
    this._seed = seed;
  }
  // Set the seed.
  // The seed can't be a multiple of pi (including 0).
  this.seed = function(seed) {
    if (seed/Math.PI === Math.floor(seed/Math.PI)) {
      console.log('Error: PRNG seed cannot be 0 or multiple of pi.');
      return false;
    } else {
      this._seed = seed;
    }
  };
  // Return a random float between 0 and 1 (including 0, not including 1).
  this.random = function() {
    this._seed++;
    var x = Math.sin(this._seed) * 10000;
    return x - Math.floor(x);
  };
  // Return a random integer between 0 and max-1 (inclusive).
  this.randInt = function(max) {
    return Math.floor(this.random() * max);
  };
}
var prng = new ToyPrng();

// Generate a random sequence "length" bases long.
function randSeq(length) {
  var seq = '';
  for (var i = 0; i < length; i++) {
    seq += BASES[prng.randInt(BASES.length)];
  }
  return seq;
}

// Generate "numReads" random reads of length "readLength" from a given
// reference sequence. Ensures all bases of the reference are covered by at
// least "minCoverage" reads (omit it to eliminate that constraint).
function wgsim(reference, numReads, readLength, minCoverage) {
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
    var read_data = getRandomRead(reference, readLength, coverage);
    reads[i] = read_data[0];
    starts[i] = read_data[1];
    coverage = read_data[2];
  }
  return fixCoverage(reads, starts, coverage, minCoverage, reference, readLength);
}

// Generate a random read of length "readLength" from the sequence "reference"
// and increment the covered bases in the "coverage" array.
// Returns the read sequence, its starting coordinate, and the coverage array.
function getRandomRead(reference, readLength, coverage) {
  assert(reference.length === coverage.length);
  var start = prng.randInt(reference.length - readLength);
  var read = reference.substring(start, start+readLength);
  // keep track of which bases of the reference are covered by reads
  for (var i = 0; i < readLength; i++) {
    coverage[start+i]++;
  }
  return [read, start, coverage];
}

// Make sure all bases are covered by at least minCoverage reads.
function fixCoverage(reads, starts, coverage, minCoverage, reference, readLength) {
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
    var r = peakReads[prng.randInt(peakReads.length)];
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
    var start = min + prng.randInt(max - min + 1);
    starts[r] = start;
    reads[r] = reference.substring(start, start+readLength);
    for (var i = 0; i < readLength; i++) {
      coverage[start+i]++;
    }
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
