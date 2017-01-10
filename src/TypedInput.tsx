import * as React from "react";

import { observer } from "mobx-react";
import { Value } from "./Value";
import { TextInput, StandardTextInputProps } from "./TextInput";
import { ConversionModel, ParseResult } from "./ConversionModel";
import { from } from "meta-object";
import { removeProps } from "./FormElementProps";

export interface TypedInputProps<T> extends StandardTextInputProps {
    state: Value<T>;
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
            props.state, this.boundFormat, this.boundParse);
    }

    componentWillUnmount() {
        this.conversion.dispose();
    }

    componentWillReceiveProps(props: P) {
        this.conversion.parsed = props.state;
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
        return ["state", "errorClass"];
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
            text={from(this.conversion)("formatted")} 
            className={className}
            title={this.conversion.error} />
    }
}
