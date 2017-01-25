import * as React from "react";

import { computed } from "mobx";
import { observer } from "mobx-react";

import { rule, rules, TextInput, RuleBullets, field, 
    numberAsString, numberLimits } from "../../index";

@observer
export default class Multiplier extends React.Component<{}, {}> {

    private static factor = field(numberLimits(1, 10)).also(numberAsString(2));

    private a = Multiplier.factor.create(1, "A");
    private b = Multiplier.factor.create(12, "B");

    private limit = rule(() => 
        (this.a.model + this.b.model > 10) ? 
            `Total ${this.a.model} + ${this.b.model} is too big` : []);
    
    private validation = rules([this.a, this.b, this.limit]);
    
    @computed
    get product() { return this.a.model * this.b.model; }

    render() {
        const { a, b, product, validation } = this;

        return (
            <div>
                <div><label>A = <TextInput value={a}/></label></div>
                <div><label>B = <TextInput value={b}/></label></div>
                <div>Product ({a.model} * {b.model}) = { product }</div>
                <hr/>
                <RuleBullets rule={validation} />
            </div>
        );
    }
}
