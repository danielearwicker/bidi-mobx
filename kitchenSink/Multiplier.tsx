import * as React from "react";

import { computed } from "mobx";
import { observer } from "mobx-react";

import { rule, rules } from "../src/rules";
import numberAsString from "../src/numberAsString"

import TextInput from "../src/components/TextInput";
import RuleBullets from "../src/components/RuleBullets";

const factor = numberAsString({ decimalPlaces: 2, minimum: 1, maximum: 10 });

function makeViewState() {

    const a = factor(1, "A"), b = factor(2, "B");

    const limit = rule(() => (a.model + b.model > 10) ? 
                    `Total ${a.model} + ${b.model} is too big` : []);
    return {
        a,
        b,
        product: computed(() => a.model * b.model),
        validation: rules([a, b, limit], (l, e) => `${l}: ${e}`)
    };
}

@observer
export default class NumberEditor extends React.Component<{}, {}> {

    private viewState = makeViewState();

    render() {
        const { a, b, product, validation } = this.viewState;

        return (
            <div>
                <div><label>A = <TextInput value={a}/></label></div>
                <div><label>B = <TextInput value={b}/></label></div>
                <div>Product (a * b) = { product.get() }</div>
                <hr/>
                <RuleBullets rule={validation} />
            </div>
        );
    }
}
