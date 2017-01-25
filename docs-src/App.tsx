import * as React from "react"

import DemoSwitcher from "./demos/DemoSwitcher"

export default function App(props: {}) {
    props; // not used

    return (
        <div>
            <section id="title">
                <h1>bidi-mobx</h1>
                <p>A small library that dreams big</p>
            </section>

            <section id="demos">
                <h2>Demos</h2>                
                <DemoSwitcher/>
            </section>
        </div>
    );
}
