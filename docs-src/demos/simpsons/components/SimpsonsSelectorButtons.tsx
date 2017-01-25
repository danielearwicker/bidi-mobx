import * as React from "react"
import { observer } from "mobx-react";

import { TypedRadioButton, BoxedValue } from "../../../../index";

import Simpson from "../Simpson";

class SimpsonRadioButton extends TypedRadioButton<Simpson> {}

function SimpsonsSelectorButtons({ simpsons, selected }: { simpsons: Simpson[], selected: BoxedValue<Simpson> }) {
    
    return (
        <div>
            {
                simpsons.map(item => (
                    <div key={item.id}>
                        <label>
                            <SimpsonRadioButton option={item} value={selected}/>
                            {item.name.model} ({item.age.model}) {item.tags.model.join(", ")}                        
                        </label>
                    </div>
                ))
            }
        </div>
    );
}

export default observer(SimpsonsSelectorButtons);

