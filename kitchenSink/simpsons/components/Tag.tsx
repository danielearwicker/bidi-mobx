import * as React from "react"
import { observer } from "mobx-react";

import CheckBox from "../../../src/components/CheckBox";
import { box } from "../../../src/box";

import TagState from "./TagState";

function Tag({ tag }: { tag: TagState }) {
    return <label><CheckBox value={box(tag).checked} />{tag.name}</label>;
}

export default observer(Tag);
