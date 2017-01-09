import * as React from "react";
import { action } from "mobx";
import { observer } from "mobx-react";
import { Value } from "./value";
import { FormElementProps, removeProps } from "./FormElementProps";

export interface CheckBoxProps extends FormElementProps {
    checked: Value<boolean | undefined>;
}

@observer
export class CheckBox extends React.Component<CheckBoxProps, {}> {

    indeterminate = (input: HTMLInputElement) => {
        if (input) {
            input.indeterminate = this.props.checked.value === undefined;
        }
    }

    @action.bound
    changed(e: React.FormEvent<HTMLInputElement>) {        
        this.props.checked.value = e.currentTarget.checked;        
    }

    render() {
        return ( 
            <input type="checkbox" 
                {...removeProps(this.props, "checked")}
                checked={this.props.checked.value || false}
                ref={this.indeterminate}
                onChange={this.changed}/> 
        );
    }
}
