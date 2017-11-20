import Controller from '@ember/controller';
import $ from 'jquery';
import RSVP, { Promise as EmberPromise, reject } from 'rsvp';
import { bind } from '@ember/runloop';

var registerGlobalHandler = true;

function evidence(msg) {
  $('body').append("<div>"+msg+"</div>");
}

RSVP.on('error', function(reason) {
  evidence('rsvp error: ' + reason);
});
if (registerGlobalHandler) {
  Ember.onerror = (err) => {
    evidence('global error handler: ' + err);
  };
}

export default Controller.extend({
  failInStep1ErrorHandler: false,
  actions: {
    triggerChain() {
      this.step1()
        .then(() => this.step2(), this.wrapErrorHandler(this.step1Problem))
        .then(() => this.step3(), this.wrapErrorHandler(this.step2Problem))
        .then(function() {
          evidence("success");
        });
    },
  },
  wrapErrorHandler(handler) {
    let wrappedHandler = function(err) {
      if (!err || !err.toString().match(/reraise/i)) {
        handler.apply(this, arguments);
      }
      return reject("reraise");
    };
    return bind(this, wrappedHandler);
  },
  step1() {
    return new EmberPromise(() => {
      throw new Error("step 1 failed");
    });
  },
  step2() {
    evidence("step 2");
  },
  step3() {
    evidence("step 3");
  },
  step1Problem(err) {
    throw new Error("step 1 error handler failed");
  },
  step2Problem(err) {
    evidence("problem in step 2: " + err);
  },
});
