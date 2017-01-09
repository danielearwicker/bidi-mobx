import * as React from "react";
import { Value } from "./value";
import { FormElementProps, removeProps } from "./FormElementProps";

export interface CheckBoxProps extends FormElementProps {
    checked: Value<boolean | undefined>;
}

export class CheckBox extends React.Component<CheckBoxProps, {}> {

    indeterminate = (input: HTMLInputElement) => {
        if (input) {
            input.indeterminate = this.props.checked.value === undefined;
        }
    }

    changed = (e: React.FormEvent<HTMLInputElement>) => {
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
