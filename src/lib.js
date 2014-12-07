'use strict';
/* global Crafty, console */
/* exported console, destroyAll, replaceChar, capitalize */


// Be extra safe and shim the (non-standardized) console object
if (typeof console !== 'object') {
  console = {};
}
// Make sure console.log can be called as a function
if (typeof console.log !== 'function') {
  console.log = function(message) {return message};
}
// Shim console.assert if it doesn't exist
if (typeof console.assert !== 'function') {
  console.assert = function(condition, message) {
    if (! condition) {
      if (message === undefined) {
        message = "Assertion error";
      }
      if (typeof Error !== "undefined") {
        throw new Error(message);
      } else {
        throw message;
      }
    }
  };
}


// Destroy all entities with a particular component.
function destroyAll(component) {
  var entities = Crafty(component).get();
  for (var i = 0; i < entities.length; i++) {
    entities[i].destroy();
  }
}


// Replace a character at a given index in a string.
function replaceChar(string, index, char) {
  return string.slice(0, index) + char + string.slice(index+char.length);
}


// Capitalize the first character in a string.
function capitalize(string) {
  return string[0].toUpperCase() + string.slice(1);
}
