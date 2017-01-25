import * as React from "react";
import { action } from "mobx";
import { observer } from "mobx-react";
import { BoxedValue } from "boxm";
import { FormElementProps, removeProps } from "./FormElementProps";

export interface RadioButtonProps<T> extends FormElementProps {
    value: BoxedValue<T>;
    option: T;
}

@observer
export class TypedRadioButton<T> extends React.Component<RadioButtonProps<T>, {}> {

    @action.bound
    changed(ev: React.FormEvent<HTMLInputElement>) {
        if (ev.currentTarget.checked) {
            this.props.value.set(this.props.option);
        }
    }

    render() {
        return <input type="radio"
            {...removeProps(this.props, "value", "option")}
            checked={this.props.value.get() === this.props.option}            
            onChange={this.changed} />;
    }
}

export class RadioButton extends TypedRadioButton<any> {}
export class RadioButtonString extends TypedRadioButton<string> {}
export class RadioButtonNumber extends TypedRadioButton<number> {}
