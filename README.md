# bidi-mobx
Two-way binding is back, and this time it's respectable

[![Build Status](https://travis-ci.org/danielearwicker/bidi-mobx.svg?branch=master)](https://travis-ci.org/danielearwicker/bidi-mobx)
[![Coverage Status](https://coveralls.io/repos/danielearwicker/bidi-mobx/badge.svg?branch=master&service=github)](https://coveralls.io/github/danielearwicker/bidi-mobx?branch=master)

Declare your view model:

```ts
export default class Person {

    name = field(stringLimits(1, 20)).create("", "Name")
    age = field(numberLimits(0, 120)).also(numberAsString(0)).create(0, "Age");
    tags = field(tagsAsString).create([], "Tags");

    rule = rules([this.name, this.age, this.tags]);
}
```

Bind your view to it:

```tsx
function PersonEditor({ person }: { person: Person }) {

    return (
        <div>
            <div><label>Name <TextInput value={person.name} /></label></div>
            <div><label>Age <TextInput value={person.age} /></label></div>
            <div><label>Tags <TextInput value={person.tags} /></label></div>

            <RuleBullets rule={person.rule}/>
        </div>
    );
}
```

Use binding-ready simple form components:

* `<CheckBox>`
* `<RadioButton>` 
* `<Select>` 
* `<TextInput>`

Create your own two-way value adaptors:

```ts
const tagsAsString = {
    render(value: string[]) { 
        return value.slice(0).sort().join(" "); 
    },
    parse(str: string) { 
        return str.split(/\s+/).filter(s => s).sort();
    }
};
```

And then chain them together to create fields that automatically convert both directions, applying validations and converting between *model* and *view* representations.

## Kitchen sink demo
Gradually growing... [click here](https://danielearwicker.github.io/bidi-mobx/)

## Install

    npm install bidi-mobx

You may need to define mobx as an external in your Webpack config [to avoid it being duplicated](https://github.com/danielearwicker/bidi-mobx/issues/4)

## WAT?
There's a UI pattern with a stupid name: MVVM (Model-View-ViewModel), but it's a very cool idea. The takeaway is that a view needs to be supported by state data that is additional to the pure data being edited. [More discussion about this.](https://github.com/danielearwicker/bidi-mobx/blob/master/notes.md)

If you create a data model that reflects the structure of your UI, you can then load your pure model data into it and "bind" to it with a standard vocabulary of visual components. They are linked in both directions. Being declarative is beneficial for describing the flow of information from model to view, and it turns out to be just as beneficial in the opposite direction too. It's especially easy if you can use the same declarations for both. For a lot of apps it's the most simple, easy to maintain, easy to get right and *automatically performant* approach.

The first JS library I know of that implemented this was [Knockout.js](http://knockoutjs.com). It included a pattern for modelling data, with `computed` and automatic observing (brilliant), and also its own quirky way of binding directly to the DOM (this part wasn't so great).

So you could get started building UIs in the DOM, it came with a set of built-in handlers for `<input type="text">`, `<input type="checkbox">`, `<input type="radio">` and `<select>`.

React already provides a beautiful component-based and declarative UI description system. [MobX](https://mobx.js.org/) provides automatic observing and `computed` (on a more sound basis than Knockout). So what else do we need?

A component representing a "control", an editor for a value, needs a way to bind to that control. In React this means creating the relationship twice: you set the `value` of the control and you also provide an `onChange` handler that updates the model.

For super slickness, we start with the `boxm` library, which provides a way to get a `BoxedValue`, a reference to a mutable property. This is a single nugget of goodness through which we can both `get` and `set` the value. We provide a version of the `box` function that is optimized for MobX.

To this we add a small set of core form components, which are extremely thin wrappers around standard DOM form elements, ready to use, with no added styling and no capability taken away:

* `<CheckBox>` -> `<input type="checkbox">` [source](src/components/CheckBox.tsx)
* `<RadioButton>` -> `<input type="radio">` [source](src/components/RadioButton.tsx)
* `<Select>` -> `<select>` and `<option>` [source](src/components/Select.tsx)
* `<TextInput>` -> `<input type="text">` [source](src/components/TextInput.tsx)

All these require a `value` prop that is a `BoxedValue`. A bunch of noise disappears from your JSX and your UI becomes more readable and understandable.

Finally, we provide a simple way to declaratively transform observable values *in both directions*. This enables binding a `TextInput` to a number, or any kind of validation, with very short neat declarations. There's also a [ridiculously simple component](src/components/RuleBullets.tsx) to display validation problems (so simple that you could easily cook up your own variant if you want a different structure).

## Validation
The initial use case for this is using a `<TextInput>` for data that can be represented as a string but only a subset of all possible strings are valid: numbers being the classic example.

To support this, instead of declaring an observable property of type `number`:

```ts`
@observable orderQuantity = 5
```

(which you'd then need to bind to with `box`), declare it like this:

```ts
orderQuantity = field(numberAsString()).create(5)
```

Now `orderQuantity` is "pre-boxed". It has `get`/`set` methods for the string version of the value, so it can be directly passed to `<TextInput>` to bind it:

```tsx
<label>Quantity to order: <TextInput value={orderQuantity}/></label>
```

It also has a sub-property (observable) called `model` that contains the number value which you can read/write freely.

In addition, it has an observable property called `errors` that contains an array of strings; if all is well, this array is empty. If the current text input is not valid, `errors` will contain one or more messages complaining to the user.

Whenever the text or the `model` value changes, everything updates automatically. It updates *synchronously*, like MobX itself, so call-stack debugging is manageable.

There is some built-in magic in `<TextInput>` so it recognises when an `errors` property is available and can add a class (by default `has-errors`) and append to the `title` to get a tooltip, so this may be enough by itself.

Anything that has an `errors` string array is a `Rule`. You can use `<RuleBullets rule={myRule}>` display all errors in a bullet list. Of course you may have multiple fields and want to display all their current errors in one place. You can create a combined rule with the `rules` function:

```ts
allRules = rules([orderQuantity, customerName, customerAddress])
```

This is still one rule, but it's `errors` property lists the concatenation of all the errors from the rules you pass to it.

## Chaining adaptors
The initial object returned from `field` supports a very simple "fluent" API. The `create` method is the terminal call that actual creates the field object. But before that, you can call `also` to compose another "adaptor" (a conversion or a validation) around the existing one(s):

```ts
price = field(numberLimits(0, 1000)).also(numberAsString(2));
```

We start the field with `numberLimits` which means that our base (model) value will be a number, and we say it must be positive and no more than 1000. We then use `also` to further say that it should be wrapped in a string, and we specify it should display only 2 decimal places.

The argument to `field` and `also` is an adaptor:

```ts
export interface Adaptor<View, Model> {
    render(model: Model): View;
    parse(view: View): Model;
}
```

It specifies data transformation in two directions. The `parse` method is expected to throw an exception if it doesn't like the value it receives.

You can cook up a pure validation adaptor (which doesn't change the value) with the `checker` function:

```ts
export function numberLimits(min: number, max: number) {
    return checker((val: number) => 
        (val < min) ? `Minimum value ${min}` :
        (val > max) ? `Maximum value ${max}` :
        undefined);
}
```

## Asynchronicity
The approach taken here is in line with MobX's general approach: synchronous updating and no staleness. If asynchronous validation rules are required, this can be achieved quite easily by defining a `rule` based off the value of a `computedAsync` - see [computed-async-mobx](https://github.com/danielearwicker/computed-async-mobx).

# Prior Art
From [Knockout.js](http://knockoutjs.com) comes the idea of including a minimal set of primitives for handling the DOM's form fields, but making them so simple that they also work as examples for user-written controls (e.g. integrating with your favourite date picker).

I looked properly at [FormState](https://formstate.github.io) :rose: as I was thinking through the validation/conversion approach. Main similarities:

* Representing each field's view state with an object containing model and view as separate values (equivalent of `model` is called `$`)
* Validation rules can added to a field
* Fields can be aggregated into one object to check validation of all

Main differences:
* Model and view state are the same type (validation only, no conversion or adaptor chaining)
* Has separate `value` and `onChange` features instead of a single `BoxedValue`
* Validation is an explicitly requested command, not continuously reevaluated

# Background Notes
[Click here](https://github.com/danielearwicker/bidi-mobx/blob/master/notes.md)

# License 
MIT
