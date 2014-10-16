'use strict';
/* global Crafty */
/* exported assert, destroyAll */


function destroyAll(component) {
  var entities = Crafty(component).get();
  for (var i = 0; i < entities.length; i++) {
    entities[i].destroy();
  }
}

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