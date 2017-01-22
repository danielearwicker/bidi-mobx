import * as React from "react";

import { computed, observable } from "mobx";

import { box } from "../src/box";
import { rule, rules } from "../src/rules";
import { field, numberAsString, numberLimits } from "../src/field";
import { project } from "../src/project";

import TextInput from "../src/components/TextInput";
import RuleBullets from "../src/components/RuleBullets";

// Underlying everything is a very pure unadorned MobX model
class Model {
    @observable a = 1;
    @observable b = 2;

    @computed get product() {
        return this.a * this.b;
    }

    @computed get invalid() {
       return (this.a + this.b > 10) ? 
        `Total ${this.a} + ${this.b} is too big` : undefined;
    }
}

// Build a component that renders our model, first by projecting it into a view-model
const Multiplier = project((model: Model) => {

    const factor = field(numberLimits(1, 10)).also(numberAsString(2));

    const a = factor.use(box(model).a, "A"),
          b = factor.use(box(model).b, "B"),
          validation = rules([a, b, rule(() => model.invalid)]);

    return { a, b, validation }; // this is the view-model that will actually be rendered

}).render<{ background: string }>(props => { // Now we pass a plain stateless component
    
    // The model and view props are automatically blended into whatever
    // we require (as specified in the type argument to `render`)
    const { a, b, validation } = props.view;
    const { product } = props.model;

    return (
        <div style={{ background: props.background }}>
            <div><label>A = <TextInput value={a}/></label></div>
            <div><label>B = <TextInput value={b}/></label></div>
            <div>Product ({a.model} * {b.model}) = {product.toFixed(2)}</div>
            <hr/>
            <RuleBullets rule={validation} />
        </div>
    );
});

// As a demo, show two UIs bound to the same model
export default class TwinMultiplier extends React.Component<{}, {}> {

    private readonly model = new Model();

    render() {        
        return (
            <div>
                <div className="multiplier">
                    <Multiplier model={this.model} background="#0FB" />
                </div>
                <div className="multiplier">
                    <Multiplier model={this.model} background="#0BF" />
                </div>
            </div>
        );
    }
}
