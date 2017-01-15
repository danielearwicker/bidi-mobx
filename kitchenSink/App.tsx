import * as React from "react"

import Multiplier from "./Multiplier"
import Simpsons from "./simpsons/components/Simpsons"

function Source(prop: { path: string }) {
    const url = "https://github.com/danielearwicker/bidi-mobx/blob/master/kitchenSink/" + prop.path;
    return <a href={url}>Source</a>
}

export default function App(props: {}) {
    props; // not used

    return (
        <div>
            <section>
                <h1>Kitchen Sink for bidi-mobx</h1>
                <p>A selection of miscellaneous demos and interactive test beds.</p>
            </section>
            <section>
                <h2>Multiplier</h2>
                <p>A calculator that multiples two numbers. Validation is continuous.</p>
                <p><Source path="Multiplier.tsx"/></p>
                <Multiplier/>
            </section>
            <section>
                <h2>Simpsons</h2>
                <p>A silly example that covers a few interesting scenarios.</p>
                <p><Source path="Simpsons"/></p>
                <Simpsons/>
            </section>
        </div>
    );
}