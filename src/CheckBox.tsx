import * as React from "react";
import { action } from "mobx";
import { observer } from "mobx-react";
import { MetaValue } from "meta-object";
import { FormElementProps, removeProps } from "./FormElementProps";

export interface CheckBoxProps extends FormElementProps {
    value: MetaValue<boolean | undefined>;
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
                {...removeProps(this.props, "value")}
                checked={this.props.value.get() || false}
                ref={this.indeterminate}
                onChange={this.changed}/> 
        );
    }
}
