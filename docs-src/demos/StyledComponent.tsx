import * as React from "react";
import styled from 'styled-components';

// import { observable } from "mobx";

import { observer } from "mobx-react";

import { TextInput, field, identity, TextInputUsing } from "../../index";

export const StyledInput1 = styled.input`
    background: purple;
    color: orange;
`;

const StyledInput2 = TextInputUsing(StyledInput1);

@observer
export default class StyledComponent extends React.Component<{}, {}> {

    private text = field(identity<string>()).create("");

    render() {
        return (
            <div>
                <div>
                    <TextInput component={StyledInput1} value={this.text} />
                </div>
                <div>
                    <StyledInput2 value={this.text} />
                </div>
                <div>
                    {this.text.get()}
                </div>
            </div>
        );
    }
}
