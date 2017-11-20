# Ember onerror issue

It seems that when upgrading from 2.13 to 2.16 the effect of registering a global error handler using `Ember.onerror` has changed how promise chains are handled.

I have been using a pattern of handling errors in long promise chains that involves having step-specific reject handlers. Each of these handlers would be responsible for handling any errors in the previous step. Additionally, these handlers would continue rejecting all the way down the chain so that even if an error is handled, none of the rest of the chain is executed, including a `success` callback at the very end.

Unfortunately, this pattern seems not to be possible now when registering an error handler with `Ember.onerror`. The example in the Guides suggests that `Ember.onerror` can be used for logging errors. I would have expected that whether one registeres an error handler with `Ember.onerror` shouldn't affect which methods are called in the promise chain. However, in 2.16 this seems to be the case.

I illustrate this behavior in this repo.

In the file `app/controllers/application.js` there is a boolean variable `registerGlobalHandler` that can be toggled to determine if a global error handler using `Ember.onerror` is registered.

When `registerGlobalHandler` is set to `false`, I get the expected behavior:

    problem in step 2: Error: step 1 error handler failed
    rsvp error: reraise

When `registerGlobalHandler` is set to `true`, the promise chain is continued, despite the error thrown in `step1Problem`, which is a reject handler passed to `then`.

In this case, the output looks like this:

    global error handler: Error: step 1 error handler failed
    step 3
    success

This behavior is quite problematic because it means that the chain will continue if there is an exception thrown in the `reject` handler. Also, it's bizarre that this behavior is contingent on whether a handler was registered with `Ember.onerror`.
