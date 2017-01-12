import * as React from "react";

import { observer } from "mobx-react";
import { BoxedValue, box } from "boxm";
import { TextInput, StandardTextInputProps } from "./TextInput";
import { ConversionModel, ParseResult } from "./ConversionModel";
import { removeProps } from "./FormElementProps";

export interface TypedInputProps<T> extends StandardTextInputProps {
    value: BoxedValue<T>;
    errorClass?: string;
}

@observer
export class TypedInput<T, P extends TypedInputProps<T>> extends React.Component<P, {}> {

    conversion: ConversionModel<string, T>;

    boundFormat: (value: T) => string;
    boundParse: (str: string) => ParseResult<T>;

    constructor(props: P) {
        super(props);

        this.boundFormat = v => this.format(v);
        this.boundParse = s => this.parse(s);

        this.conversion = new ConversionModel<string, T>(
            props.value, this.boundFormat, this.boundParse);
    }

    componentWillUnmount() {
        this.conversion.dispose();
    }

    componentWillReceiveProps(props: P) {
        this.conversion.parsed = props.value;
    }

    format(value: T): string {
        return JSON.stringify(value);
    }

    parse(str: string) {
        try {
            return { value: JSON.parse(str) };
        } catch (x) {
            return { error: x.message };
        }
    }

    propsToRemove(): (keyof P)[] {
        return ["value", "errorClass", "enabled"];
    }

    render() {
        let className = this.props.className;
        if (this.conversion.error) {
            const prefix = className ? (className + " ") : "",
                  suffix = this.props.errorClass || "validation-error";
            className = `${prefix}${suffix}`;
        }

        return <TextInput 
            {...removeProps(this.props, ...this.propsToRemove())}
            value={box(this.conversion).formatted} 
            className={className}
            enabled={this.props.enabled} />
    }
}
