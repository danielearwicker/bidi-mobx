# Notes on reactive UI, states and information flow

## UI state

In React much is made of how a view is a pure function of state, so information flows from model to view.

This is all very well for something like an animation that you sit passively and watch. The combination of React and MobX has this problem utterly solved, and made incredibly easy and optimal. Layers of `computed` values that only recompute when there is a change to whatever they are consuming. Like declarative caching.

But in an interactive UI, the user sends signals to the UI, working with the outermost layer that they can see. In other words, if you’ve transformed the data into view state, the user is directly manipulating the view state, which then needs to be translated back into model state.

“Oh no,” you cry, instinctively. “I create actions that manipulate the underlying model state directly. It’s fine.”

No, you don’t - or if you do, it's because you happen to be encountering only easy problems. To make this absolutely clear, let’s consider the actual distinction between model and view.

## Sets of states

A model is a finite set of states, forming a finite state machine. It can transition between states. Ideally it locks itself down and enforces invariants so it cannot get into an invalid state.

A view is also a finite set of states. In a simple example, these states are a bijection, a one-to-one mapping, and there is no need to consider them separately. They are identical. If the model is a single boolean, then the view is a checkbox. Only one state transition is available from current state to next state, and is triggered by the user clicking. Fine, in this the view state *is* the model state.

But often the view states form a larger set. Definitely not a smaller set: that would mean that there are some valid states in the model that the user cannot get to via the view. And also there can't be any view state that maps to multiple model states, unless you want to amuse the user with random interpretation of their intentions.

But every state in the model maps to *at least* one state in the view. It may map to multiple states in the view (more than one way of asking for the same thing). There may also be extra states the view can get into that don’t map to a state in the model, which sounds like a bug, but isn’t.

How can this come about?

If your model is a string, naturally your view is a textbox. But a textbox containing three characters has 10 states it can be in, depending on where the caret is place in the text (4 locations) or what range of characters is selected (6 configurations). That’s usually not a big deal - we trust the textbox to manage that extra state space and we just care about the text. So this is a dead end because it's not our business - the browser/device takes care of it. But I mention it to show how a UI may include statefulness that is purely concerned the *mechanism of editability* and are not part of the value being edited.

Okay, but then what if the model requires the string to be non-empty? This is probably the most common validation. The textbox must allow you delete all the text so you can start again, at which point it's in a state that the model disallows. If there's one character left and I hit backspace it would be very counterintuitive if the character didn't disappear. It turns out the best UI is probably one which can get into the one view state that we've explicitly disallowed in the model.

Another an example is a number. Let’s say we limit it to two decimal places. Ever used a numeric text field that tries to apply such limits to your input as you type? It can be annoying. This is because when you hit a key you expect it to transition to a new state, but if that state is not allowed then there is no single obvious correct answer for what should happen next. The designer of the control has to pick one. It is often better to allow the user to type in a wrong value and display a highlight and explanation of why they need to fix it.

I also mentioned how there may be multiple view states that map to a single model state. Again a simple example is entering a number. These are all the same number:

* 1
* 01
* 1.
* 1.00
* 001.
* 001.00

This means that as I change the state of the view to manipulate it to all those text representations, the model isn’t transitioning between states at all; it stays in the same model state, for which all the above are equally valid representations in text. *View state is changing, model state is not.*

So when we have a model that cannot represent all the states that its view will get into, then we need some more state to support the view. This state is nothing to do with the model itself, but with solving the problem of how to let someone operate conveniently on the model.

There may be more than one way of interacting with a model. Each has a different view design, which requires different view state to support it. So it is clear that view state is a different thing from model state.

## Cross-value validation

In some models the validity of each field cannot be determined independently. They can be entangled. Consider a model with two numbers, `a` and `b`, whose total must be less than 10. If we set them both to `4` all is fine. If we set `a` to `5`, still fine. Then we set `b` to `5` also, and that operation will throw an exception explaining the problem.

The problem with this approach is that we could fix the problem by adjusting `a` down to `4`. If we do that, what clears the error state of `b`?

This kind of entanglement demonstrates that validation error states (i.e. a pending change attempted by the user that has failed to apply) must be re-attempted whenever when the situation changes. This is *non-locality* and requires "spooky action at a distance" in the UI. Editing field `b` must cause field `a` to apply its change.

Another, less spooky, way to describe this, is that fields `a` and `b` are in fact independently modifiable to any value, and a third value is simply a `computed` that says whether they are in a valid state.

The idea of the validity of the whole view state may be crucial. Multiple validation rules may be broken by the current state; when none are, it is valid.

