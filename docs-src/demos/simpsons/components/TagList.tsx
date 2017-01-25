import * as React from "react"
import { observer } from "mobx-react";

import TagState from "../TagState";
import Tag from "./Tag";

function TagList({ tags }: { tags: TagState[] }) {
    
    return (
        <div>
        { tags.map(tag => <div key={tag.name}><Tag tag={tag}/></div>) }
        </div>
    );
}

export default observer(TagList);
