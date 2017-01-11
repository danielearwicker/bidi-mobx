import * as React from "react";
import { action } from "mobx";
import { observer } from "mobx-react";
import { MetaValue } from "meta-object";
import { FormElementProps, removeProps } from "./FormElementProps";

export interface CheckBoxProps extends FormElementProps {
    checked: MetaValue<boolean | undefined>;
}

@observer
export class CheckBox extends React.Component<CheckBoxProps, {}> {

    indeterminate = (input: HTMLInputElement) => {
        if (input) {
            input.indeterminate = this.props.checked.get() === undefined;
        }
    }

    @action.bound
    changed(e: React.FormEvent<HTMLInputElement>) {        
        this.props.checked.set(e.currentTarget.checked);
    }

    render() {
        return ( 
            <input type="checkbox" 
                {...removeProps(this.props, "checked")}
                checked={this.props.checked.get() || false}
                ref={this.indeterminate}
                onChange={this.changed}/> 
        );
    }
}
