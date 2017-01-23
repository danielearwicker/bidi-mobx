import * as React from "react"

import Multiplier from "./Multiplier"
import Simpsons from "./simpsons/components/Simpsons"
import TwinMultiplier from "./TwinMultiplier"
import MusicLibrary from "./MusicLibrary"

function Source(prop: { path: string }) {
    const url = "https://github.com/danielearwicker/bidi-mobx/blob/master/kitchenSink/" + prop.path;
    return <a href={url}>Source</a>
}

export default function App(props: {}) {
    props; // not used

    return (
        <div>
            <section id="title">
                <h1>Kitchen Sink for bidi-mobx</h1>
                <p>A selection of miscellaneous demos and interactive test beds.</p>
            </section>

            <section id="multiplier">
                <h2>Multiplier</h2>
                <p>A calculator that multiples two numbers. Validation is continuous.</p>
                <p><Source path="Multiplier.tsx"/></p>
                <Multiplier/>
            </section>
            
            <section id="simpsons">
                <h2>Simpsons</h2>
                <p>A silly example that covers a few interesting scenarios.</p>
                <p><Source path="simpsons/components/Simpsons.tsx"/></p>
                <Simpsons/>
            </section>

            <section id="twinmultiplier">
                <h2>Twin Multiplier</h2>
                <p>Two UIs bound to the same underlying data. Note that the inputs are formatted
                   to an adjustable number of decimal places.</p>
                <p><Source path="TwinMultiplier.tsx"/></p>
                <TwinMultiplier/>
            </section>

            <section id="musiclibrary">
                <h2>Music Library</h2>
                <p>Demonstrates the indeterminate checkbox state.</p>
                <p><Source path="MusicLibrary.tsx"/></p>
                <MusicLibrary/>
            </section>
        </div>
    );
}
