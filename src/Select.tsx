import * as React from "react";
import { Value } from "./Value";
import { FormElementProps, removeProps } from "./FormElementProps";

export interface SelectProps<T> extends FormElementProps {
    selected: Value<T>;
    options: T[];
    labels?: (value: T) => string;
    size?: number;
}

function stringify(value: any): string {
    if (value === undefined) {
        return "undefined";
    }
    value = value.valueOf();
    return JSON.stringify(value);
}

export class TypedSelect<T> extends React.Component<SelectProps<T>, {}> {

    static defaultLabels(value: any) {
        return value + "";
    }

    updateValue = (ev: React.FormEvent<HTMLSelectElement>) => {
        // Find a value in the list that coerces to the new value
        for (const option of this.props.options) {
            if (stringify(option) === ev.currentTarget.value) {
                this.props.selected.value = option;
                return;
            }
        }
    }

    render() {
        const labels = this.props.labels || TypedSelect.defaultLabels;

        return ( 
            <select {...removeProps(this.props, "selected", "options")}
                        value={stringify(this.props.selected.value)} 
                        onChange={this.updateValue}>
            {
                this.props.options.map(option => {
                    const val = stringify(option);
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
