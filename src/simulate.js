var BASES = ['A', 'C', 'G', 'T'];

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function randSeq(length) {
  var seq = '';
  for (var i = 0; i < length; i++) {
    seq += BASES[randInt(BASES.length)];
  }
  return seq;
}

function wgsim(reference, numReads, readLength, minCoverage) {
  if (minCoverage === undefined) {
    minCoverage = 0;
  }
  var reads = new Array(numReads);
  var starts = new Array(numReads);
  var coverage = new Array(reference.length);
  coverage.fill(0);
  for (var i = 0; i < numReads; i++) {
    [reads[i], starts[i], coverage] = getRandomRead(reference, readLength, coverage);
  }
  return fixCoverage(reads, starts, coverage, minCoverage, reference, readLength);
}

function getRandomRead(reference, readLength, coverage) {
  assert(reference.length === coverage.length);
  var start = randInt(reference.length - readLength);
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
    var peakReads = new Array();
    for (var i = 0; i < reads.length; i++) {
      var start = starts[i];
      var end = start + readLength - 1;
      // Check for any overlap between the read and the peak
      if (start <= peak.end && end >= peak.start) {
        peakReads.push(i);
      }
    }
    // Randomly choose a read to replace and delete it from the coverage array.
    var r = peakReads[randInt(peakReads.length)];
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
    var start = min + randInt(max - min + 1);
    starts[r] = start;
    reads[r] = reference.substring(start, start+readLength);
    for (var i = 0; i < readLength; i++) {
      coverage[start+i]++;
    }
    console.log("subtracted from ["+peak.start+", "+peak.end+"], added to ["
      +gap.start+", "+gap.end+"]: "+coverage);
    tries++;
  }
  console.log(tries);
  return reads;
}

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
