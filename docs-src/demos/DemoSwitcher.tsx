import * as React from "react";

import { observable, action } from "mobx";
import { observer } from "mobx-react";

import{ SelectNumber, box } from "../../index";

import Multiplier from "./Multiplier";
import TwinMultiplier from "./TwinMultiplier";
import MusicLibrary from "./MusicLibrary";
import Simpsons from "./simpsons/components/Simpsons";

function Source(prop: { path: string }) {
    const url = "https://github.com/danielearwicker/bidi-mobx/blob/master/docs-src/demos/" + prop.path;
    return <a href={url}>Source</a>
}

interface Demo {
    title: string;
    description: string;
    component: () => JSX.Element;
    source: string;
}

@observer
export default class DemoSwitcher extends React.Component<{}, {}> {

    private demos: Demo[] = [{
        title: "Multiplier",
        description: "A calculator that multiples two numbers. Validation is continuous.",
        component: () => <Multiplier/>,
        source: "Multiplier.tsx"
    }, {
        title: "Twin Multiplier",
        description: "Two UIs bound to the same underlying data. Note that the inputs are formatted to an adjustable number of decimal places.",
        component: () => <TwinMultiplier/>,
        source: "TwinMultiplier.tsx"
    }, {
        title: "Simpsons",
        description: "A silly example that covers a few interesting scenarios.",
        component: () => <Simpsons/>,
        source: "simpsons/components/Simpsons.tsx"
    }, {
        title: "Music Library",
        description: "Demonstrates the indeterminate checkbox state.",
        component: () => <MusicLibrary/>,
        source: "MusicLibrary.tsx"
    }];

    @observable index = 0;

    @action
    switch(delta: number) {
        this.index += delta;
        if (this.index < 0) {
            this.index = this.demos.length - 1;
        } else if (this.index >= this.demos.length) {
            this.index = 0;
        }
    }

    render() {
        
        const demo = this.demos[this.index];
        const range = this.demos.map((_, i) => i);

        return (
            <div className="demoSwitcher">
                <div className="demoSwitcherHeader">
                    <button onClick={_ => this.switch(-1)}>Previous</button>
                    <SelectNumber options={range} 
                                  value={box(this).index} 
                                  labels={i => this.demos[i].title}/>
                    <button onClick={_ => this.switch(1)}>Next</button>
                </div>
                <div className="demoSwitcherDescription">
                    <span>{demo.description}</span> <Source path={demo.source}/>
                </div>
                <div className="demoSwitcherComponent">
                    { demo.component() }
                </div>
            </div>
        );
    }
}
