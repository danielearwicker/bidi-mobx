import * as React from "react";
import { Rule, errors } from "../rules";
import { observer } from "mobx-react";

function RuleBullets_(props: { rule: Rule }) {
    return (
        <ul>
        { errors(props.rule).map(error => <li key={error}>{error}</li>) }
        </ul>
    );
}

export const RuleBullets = observer(RuleBullets_);
