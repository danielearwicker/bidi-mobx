import * as React from "react";

import { computed, observable } from "mobx";
import { observer } from "mobx-react";

import { box } from "../src/box";
import { rule, rules, Rule } from "../src/rules";
import { field, Field, numberAsString, numberLimits } from "../src/field"

import TextInput from "../src/components/TextInput";
import RuleBullets from "../src/components/RuleBullets";

// Underlying everything is a very pure unadorned MobX model
class Model {
    @observable a = 1;
    @observable b = 2;

    @computed get product() {
        return this.a * this.b;
    }
}

// This is what the model is wrapped in to support the editing UI
class ViewModel {
    private static factor = field(numberLimits(1, 10)).also(numberAsString(2));

    public model: Model;

    public a: Field<string, number>;
    public b: Field<string, number>;

    public validation: Rule;

    constructor(model: Model) {
        this.model = model;

        const {a, b} = box(model);

        this.a = ViewModel.factor.use(a, "A");
        this.b = ViewModel.factor.use(b, "B");

        const limit = rule(() => 
            (this.a.model + this.b.model > 10) ? 
                `Total ${this.a.model} + ${this.b.model} is too big` : []);
    
        this.validation = rules([this.a, this.b, limit]);
    }
}

interface MultiplierProps {
    model: Model;
}

// given a model in props, wraps it and presents it
@observer
default class Multiplier extends React.Component<MultiplierProps, {}> {

    private viewModel: ViewModel;

    constructor(props: MultiplierProps) {
        super(props);
        this.viewModel = new ViewModel(props.model);
    }

    componentWillReceiveProps(nextProps: MultiplierProps) {
        this.viewModel = new ViewModel(nextProps.model);
    }
   
    render() {
        const {a, b, validation, model: {product}} = this.viewModel;

        return (
            <div>
                <div><label>A = <TextInput value={a}/></label></div>
                <div><label>B = <TextInput value={b}/></label></div>
                <div>Product ({a.model} * {b.model}) = {product}</div>
                <hr/>
                <RuleBullets rule={validation} />
            </div>
        );
    }
}

// As a demo, show two UIs bound to the same model
export default class TwinMultiplier extends React.Component<{}, {}> {

    private readonly model = new Model();

    render() {        
        return (
            <div>
                <div className="leftMultiplier">
                    <Multiplier model={this.model} />
                </div>
                <div className="rightMultiplier">
                    <Multiplier model={this.model} />
                </div>
            </div>
        );
    }
}
