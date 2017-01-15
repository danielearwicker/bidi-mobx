import * as React from "react"
import { observer } from "mobx-react";

import TextInput from "../../../src/components/TextInput";
import RuleBullets from "../../../src/components/RuleBullets";

import Simpson from "../Simpson";

function SimpsonEditor({ simpson }: { simpson: Simpson }) {

    return (
        <div>
            <div><label>Name <TextInput value={simpson.name} /></label></div>
            <div><label>Age <TextInput value={simpson.age} /></label></div>
            <div><label>Tags <TextInput value={simpson.tags} /></label></div>

            <RuleBullets rule={simpson.rule}/>
        </div>
    );
}

export default observer(SimpsonEditor);
