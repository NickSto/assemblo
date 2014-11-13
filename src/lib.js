'use strict';
/* global Crafty */
/* exported assert, destroyAll */


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


// Assert condition, or throw an Error with the given message.
function assert(condition, message) {
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
}
