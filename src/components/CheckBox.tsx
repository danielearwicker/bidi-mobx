import * as React from "react";
import { action, Lambda, autorun } from "mobx";
import { observer } from "mobx-react";
import { BoxedValue } from "boxm";
import { FormElementProps, removeProps } from "./FormElementProps";

export interface CheckBoxProps extends FormElementProps {
    value: BoxedValue<boolean | undefined>;
}

@observer
export default class CheckBox extends React.Component<CheckBoxProps, {}> {

    quit: Lambda;

    indeterminate = (input: HTMLInputElement) => {
        if (input) {
            this.quit = autorun(() => input.indeterminate = this.props.value.get() === undefined);
        } else {
            this.quit();
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
                ref={ this.indeterminate }
                onChange={this.changed}/>
        );
    }
}
