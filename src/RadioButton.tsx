import * as React from "react";
import { action } from "mobx";
import { observer } from "mobx-react";
import { MetaValue } from "meta-object";
import { FormElementProps, removeProps } from "./FormElementProps";

export interface RadioButtonProps<T> extends FormElementProps {
    selected: MetaValue<T>;
    option: T;
}

@observer
export class TypedRadioButton<T> extends React.Component<RadioButtonProps<T>, {}> {

    @action.bound
    changed(ev: React.FormEvent<HTMLInputElement>) {
        if (ev.currentTarget.checked) {
            this.props.selected.set(this.props.option);
        }
    }

    render() {
        return <input type="radio"
            {...removeProps(this.props, "selected", "option")}
            checked={this.props.selected.get() === this.props.option}
            onChange={this.changed} />;
    }
}

export class RadioButton extends TypedRadioButton<any> {}
export class RadioButtonString extends TypedRadioButton<string> {}
export class RadioButtonNumber extends TypedRadioButton<number> {}
