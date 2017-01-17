# Notes on reactive UI, states and information flow

## UI state

In React much is made of how a view is a pure function of state, so information flows from model to view.

This is all very well for something like an animation that you sit passively and watch. The combination of React and MobX has this problem utterly solved, and made incredibly easy and optimal. Layers of `computed` values that only recompute when there is a change to whatever they are consuming. Like declarative caching.

But in an interactive UI, the user sends signals to the UI, working with the outermost layer that they can see. In other words, if you’ve transformed the data into view state, the user is directly manipulating the view state, which then needs to be translated back into model state.

"Oh no," you cry, instinctively. "I create actions that manipulate the underlying model state directly. It’s fine."

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

## Representing a field

We typically break the view state down into named fields. A field has two representations: model and view. These may be different data types entirely. If the field is a number that we want to tie to a text input, then the model is a number and the view is text.

MobX's low-level pattern for a boxed value, also adopted (for that reason) by the [boxm](https://github.com/danielearwicker/boxm) project, has ordinary `get` and `set` methods. These serve as the external interface to our field, getting/setting the view representation.

A mutable property called `model` holds the model representation. When this is modified, the view representation is regenerated. Similarly when `set` is called to supply a new view representation, the `model` is updated - though only, of course, if it can be mapped to a valid model state.

When the current view state cannot be mapped to a model state, there is a property called `error` that contains an array of strings describing why the view state is not valid.

These things update continuously as values change.

## Field adaptation

An *adaptor* is a pair of operations called `render` and `parse`.

```ts
export interface Adaptor<View, Model> {
    render(model: Model): View;
    parse(view: View): Model;
}
```

As in React, `render` takes model data and produces view data. But this is a bidirectional operator, so it also has `parse`, which does the reverse.

Note that although the return value of `parse` is `Model`, exceptions are expected and these convey a problem in parsing. There is a dedicated exception type `ValidationError` but in fact any exception will do. Conversely, `render` is *not* expected to produce exceptions - it's supposed to just work.

So `parse` can return a value or an error (or multiple errors, which helps with composition). This asymmetry between `parse` and `render` is because there are more view states than model states. `render` must be able to generate a view representation for any model state, but the reverse is not true.

A field definition is built by passing an adaptor to `field`, which returns a builder. It's immutable, so you can stash a definition for reuse. Further adaptors can be composed by calling `also` on the builder. Finally, `create` generates an actual field.

So a number field constrained to the range 1-10:

```ts
const f = field(numberLimits(1, 10)).create();
```

But we also want to view it as a string:

```ts
const f = field(numberLimits(1, 10)).also(numberAsString(2)).create();
```

Adaptors can be chained together indefinitely. The functions `numberLimits` and `numberAsString` are adaptor generators, i.e. functions that return adaptors.

## Error composition

Because `error` is an array of strings, composition is trivial: the error state of a collection of fields is just the concatenation of all their error states.

An error state, or `rule`, can exist independently of any specific field. It's just any object with an `error` array. This supports cross-field validation:

```ts
const limit = rule(() => 
    (a.model + b.model > 10) ? 
        `Total ${a.model} + ${b.model} is too big` : undefined);

// compose the fields and the limit into a single error state
const validation = rules([a, b, limit]);
```

## React components

If a component's props includes:

```ts
value: BoxedValue<T>;
```

then it is well suited to direct two-way binding. `T` is the field's `View` type. For some field editing components (most obviously `TextBox`) it makes sense to define it:

```ts
value: BoxedValue<string> & Rule;
```

This means that `TextBox` can set its `title` and `className` in response to errors originating in the field, and this provides a simple, automatic validation feedback UI.

The `Rule` interface's `error` property is optional, so `TextBox` can bind to an ordinary `BoxedValue<string>` just fine.

The array of error strings can get messy, containing duplicates or `undefined`, so the `errors` helper accepts a `Rule` and returns a cleaned up array of distinct strings. Therefore:

```ts
function ErrorBullets(props: { rule: Rule }) {
    return (
        <ul>
        { errors(props.rule).map(error => <li key={error}>{error}</li>) }
        </ul>
    );
}
```

