import Controller from '@ember/controller';
import $ from 'jquery';
import RSVP, { Promise as EmberPromise, reject } from 'rsvp';
import { bind } from '@ember/runloop';

var registerGlobalHandler = false;

function evidence(msg) {
  $('body').append("<div>"+msg+"</div>");
}

RSVP.on('error', function(reason) {
  evidence('rsvp error: ' + reason);
});

if (registerGlobalHandler) {
  Ember.onerror = function(err) {
    evidence('global error handler: ' + err);
  };
}

export default Controller.extend({
  failInStep1ErrorHandler: false,
  actions: {
    triggerChain() {
      this.step1()
        .then(bind(this, this.step2), bind(this, this.step1Problem))
        .then(function() {
          evidence("success");
        });
    },
  },
  step1() {
    return new EmberPromise(() => {
      throw new Error("step 1 failed");
    });
  },
  step2() {
    evidence("step 2");
  },
  step1Problem(err) {
    throw new Error("step 1 error handler failed");
  },
});
