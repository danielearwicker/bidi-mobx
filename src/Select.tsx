import * as React from "react";
import { action } from "mobx";
import { observer } from "mobx-react";
import { BoxedValue } from "boxm";
import { FormElementProps, removeProps } from "./FormElementProps";

export interface SelectProps<T> extends FormElementProps {
    value: BoxedValue<T>;
    options: T[];
    labels?: (value: T) => string;
    keys?: (value: T) => string; 
    size?: number;
}

@observer
export class TypedSelect<T> extends React.Component<SelectProps<T>, {}> {

    static defaultLabels(value: any) {
        return value + "";
    }

    static defaultKeys(value: any) {
        if (value === undefined) {
            return "undefined";
        }
        value = value.valueOf();
        return JSON.stringify(value);
    }

    @action.bound
    updateValue(ev: React.FormEvent<HTMLSelectElement>) {
        const keys = this.props.keys || TypedSelect.defaultKeys;
        // Find a value in the list that coerces to the new value
        for (const option of this.props.options) {
            if (keys(option) === ev.currentTarget.value) {
                this.props.value.set(option);
                return;
            }
        }
    }

    render() {
        const labels = this.props.labels || TypedSelect.defaultLabels;
        const keys = this.props.keys || TypedSelect.defaultKeys;

        return ( 
            <select {...removeProps(this.props, "value", "options", "labels", "keys", "size")}
                        value={keys(this.props.value.get())} 
                        onChange={this.updateValue}>
            {
                this.props.options.map(option => {
                    const val = keys(option);
                    return <option key={val} value={val}>{labels(option)}</option>
                })
            }
            </select>
        );
    }
}

export class Select extends TypedSelect<any> {}
export class SelectString extends TypedSelect<string> {}
export class SelectNumber extends TypedSelect<number> {}
