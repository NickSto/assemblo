var BASES = ['A', 'C', 'G', 'T'];

function randInt(max) {
  return Math.floor(Math.random() * max);
}

function wgsim(reference, numReads, readLength) {
  var reads = new Array(numReads);
  for (var i = 0; i < numReads; i++) {
    var start = randInt(reference.length - readLength);
    reads[i] = reference.substring(start, start+readLength);
  }
  return reads;
}

function randSeq(length) {
  var seq = '';
  for (var i = 0; i < length; i++) {
    seq += BASES[randInt(BASES.length)];
  }
  return seq;
}
