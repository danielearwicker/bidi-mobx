# bidi-mobx
Two-way binding is back, and this time it's respectable

[![Build Status](https://travis-ci.org/danielearwicker/bidi-mobx.svg?branch=master)](https://travis-ci.org/danielearwicker/bidi-mobx)
[![Coverage Status](https://coveralls.io/repos/danielearwicker/bidi-mobx/badge.svg?branch=master&service=github)](https://coveralls.io/github/danielearwicker/bidi-mobx?branch=master)

# Show me!


# Kitchen sink demo
Gradually growing... [click here](https://danielearwicker.github.io/bidi-mobx/)

# WAT?
There's a UI pattern with a stupid name: MVVM (Model-View-ViewModel), but it's a very cool idea. The takeaway is that a view needs to be supported by state data that is additional to the pure data being edited. [More discussion about this.](https://github.com/danielearwicker/bidi-mobx/blob/master/notes.md)

If you create a data model that reflects the structure of your UI, you can then load your pure model data into it and "bind" to it with a standard vocabulary of visual components. They are linked in both directions. For a lot of apps it's the most simple, easy to maintain, easy to get right and *automatically performant* approach.

The first JS library I know of that implemented this was [Knockout.js](http://knockoutjs.com). It included a pattern for modelling data, with `computed` and automatic observing (brilliant), and also its own quirky way of binding directly to the DOM (this part wasn't so great).

So you could get started building UIs in the DOM, it came with a set of built-in handlers for `<input type="text">`, `<input type="checkbox">`, `<input type="radio">` and `<select>`.

React already provides a beautiful component-based and declarative UI description system. [MobX](https://mobx.js.org/) provides automatic observing and `computed` (on a more sound basis than Knockout). So what else do we need?

A component representing a "control", an editor for a value, needs a way to bind to that control. In React this means creating the relationship twice: you set the `value` of the control and you also provide an `onChange` handler that updates the model.

For super slickness, we start with the `boxm` library, which provides a way to get a `BoxedValue`, a reference to a mutable property. This is a single nugget of goodness through which we can both `get` and `set` the value. We provide a version of the `box` function that is optimized for MobX.

To this we add a small set of core form components, which are extremely thin wrappers around standard DOM form elements, with no added styling and no capability taken away:

* `<CheckBox>` -> `<input type="checkbox">` [source](src/components/CheckBox.tsx)
* `<RadioButton>` -> `<input type="radio">` [source](src/components/RadioButton.tsx)
* `<Select>` -> `<select>` and `<option>` [source](src/components/Select.tsx)
* `<TextInput>` -> `<input type="text">` [source](src/components/TextInput.tsx)

All these do is provide a `value` property that is a `BoxedValue`. A bunch of noise disappears from your JSX and your UI becomes more readable and understandable.

Finally, we provide a simple way to declaratively transform observable values *in both directions*. This enables binding a `TextInput` to a number, or any kind of validation, with very short neat declarations. There's also a very simple component to display gather validation problems.

# Background Notes
[Somewhat rambling](https://github.com/danielearwicker/bidi-mobx/blob/master/notes.md)

# License 
MIT