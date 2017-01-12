import * as React from "react";
import { action } from "mobx";
import { observer } from "mobx-react";
import { BoxedValue } from "boxm";
import { FormElementProps, removeProps } from "./FormElementProps";

export interface CheckBoxProps extends FormElementProps {
    value: BoxedValue<boolean | undefined>;
}

@observer
export class CheckBox extends React.Component<CheckBoxProps, {}> {

    indeterminate = (input: HTMLInputElement) => {
        if (input) {
            input.indeterminate = this.props.value.get() === undefined;
        }
    }

    @action.bound
    changed(e: React.FormEvent<HTMLInputElement>) {        
        this.props.value.set(e.currentTarget.checked);
    }

    render() {
        return ( 
            <input type="checkbox" 
                {...removeProps(this.props, "value", "enabled")}
                checked={this.props.value.get() || false}
                disabled={this.props.enabled && !this.props.enabled.get()}
                ref={this.indeterminate}
                onChange={this.changed}/> 
        );
    }
}
