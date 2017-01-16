import * as React from "react";
import { Rule, errors } from "../rules";
import { observer } from "mobx-react";

function ErrorBullets(props: { rule: Rule }) {
    return (
        <ul>
        { errors(props.rule).map(error => <li key={error}>{error}</li>) }
        </ul>
    );
}

export default observer(ErrorBullets);
