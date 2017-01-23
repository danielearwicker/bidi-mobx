import * as React from "react";

import { observable, computed } from "mobx";
import { observer } from "mobx-react";

import { box } from "../src/box"

import CheckBox from "../src/components/CheckBox";

interface TreeNodeModel {
    readonly label: string;
    state: boolean | undefined;
    readonly children?: TreeNodeModel[];
}

class LeafNode implements TreeNodeModel {    
    constructor(public readonly label: string) {}
    @observable state = false;
}

class ParentNode implements TreeNodeModel {
    
    readonly children: TreeNodeModel[];
    constructor(public readonly label: string, ...children: TreeNodeModel[]) {
        this.children = children;
    }

    @computed get state() {        
        let count = 0;
        for (const child of this.children) {            
            switch (child.state) {
                case undefined:
                    return undefined;
                case true:
                    count++;
                    break;
            }
        }

        return count === this.children.length ? true :
               count === 0 ? false :
               undefined;
    }
    set state(newState: boolean | undefined) {
        for (const child of this.children) {
            child.state = newState;
        }
    }
}

const TreeNode = observer((props: { node: TreeNodeModel }): JSX.Element => {
    return (
        <div className="treeNode">
            <div className="treeNodeHeader">
                <label><CheckBox value={box(props.node).state}/> {props.node.label}</label>
            </div>
            {
                !props.node.children ? undefined : (
                    <div className="treeNodeChildren">
                        { props.node.children.map(child => <TreeNode key={child.label} node={child} />) }
                    </div>
                )
            }
        </div>
    );
});

@observer
export default class MusicLibrary extends React.Component<{}, {}> {

    private root = buildModel();

    render() {
        return <TreeNode node={this.root}/>;
    }
}

function buildModel() {
    return new ParentNode("Music", 
        new ParentNode("The Beatles",
            new ParentNode("Please Please Me",
                new LeafNode("I Saw Her Standing There"),
                new LeafNode("Misery"),
                new LeafNode("Chains"),
                new LeafNode("Anna (Go With Him)"),
                new LeafNode("There's A Place"),
                new LeafNode("From Me To You"),
                new LeafNode("Please Please Me")
            ),
            new ParentNode("Revolver",
                new LeafNode("Taxman"),
                new LeafNode("I'm Only Sleeping"),
                new LeafNode("Yellow Submarine"),
                new LeafNode("Eleanor Rigby"),
                new LeafNode("For No One"),
                new LeafNode("Good Day Sunshine"),
                new LeafNode("And Your Bird Can Sing"),
                new LeafNode("She Said, She Said"),
                new LeafNode("I Want To Tell You"),
                new LeafNode("Got To Get You Into My Life"),
                new LeafNode("Tomorrow Never Knows")
            )
        ),
        new ParentNode("Vanilla Ice",
            new ParentNode("The Best of Vanilla Ice",
                new LeafNode("Ice Ice Baby")
            )
        )
    );
}
