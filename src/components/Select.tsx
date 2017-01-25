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

        var selectedValue = this.props.value.get();
        var selectedKey = keys(selectedValue);

        let options = this.props.options.map(option => ({
            key: keys(option),
            label: labels(option)
        }));

        if (!options.some(option => option.key === selectedKey)) {
            options = options.concat({
                key: selectedKey,
                label: labels(selectedValue)
            });
        }

        return ( 
            <select {...removeProps(this.props, "value", "options", "labels", "keys", "size")}
                    value={selectedKey} 
                    onChange={this.updateValue}>
            {
                options.map(option => <option key={option.key} value={option.key}>{option.label}</option>)
            }
            </select>
        );
    }
}

export class Select extends TypedSelect<any> {}
export class SelectString extends TypedSelect<string> {}
export class SelectNumber extends TypedSelect<number> {}
