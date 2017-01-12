import * as React from "react";
import { action } from "mobx";
import { observer } from "mobx-react";
import { BoxedValue } from "boxm";
import { FormElementProps, removeProps } from "./FormElementProps";

export type AutoComplete = "off"|"on"|"name"|"honorific-prefix"|"given-name"|"additional-name"|
        "family-name"|"honorific-suffix"|"nickname"|"email"|"username"|"new-password"|
        "current-password"|"organization-title"|"organization"|"street-address"|
        "address-line1"|"address-line2"|"address-line3"|"address-level4"|"address-level3"|
        "address-level2"|"address-level1"|"country"|"country-name"|"postal-code"|
        "cc-name"|"cc-given-name"|"cc-additional-name"|"cc-family-name"|"cc-number"|
        "cc-exp"|"cc-exp-month"|"cc-exp-year"|"cc-csc"|"cc-type"|"transaction-currency"|
        "transaction-amount"|"language"|"bday"|"bday-day"|"bday-month"|"bday-year"|"sex"|
        "tel"|"url";

export type InputMode = "verbatim"|"latin"|"latin-name"|"latin-prose"|"full-width-latin"|
        "kana"|"katakana"|"numeric"|"tel"|"email"|"url";

export type SelectionDirection = "forward"|"backward"|"none";

export interface StandardTextInputProps extends FormElementProps {
    autocomplete?: AutoComplete,
    inputmode?: InputMode;
    list?: string;
    maxlength?: number;
    minlength?: number;
    pattern?: string;
    placeholder?: string;
    selectionDirection?: SelectionDirection;
    size?: number;
    spellcheck?: boolean;
}

export interface TextInputProps extends StandardTextInputProps {
    value: BoxedValue<string>;
}

@observer
export class TextInput extends React.Component<TextInputProps, {}> {

    @action.bound
    changed(e: React.FormEvent<HTMLInputElement>) {
        this.props.value.set(e.currentTarget.value);
    }

    render() {
        return (
            <input type="text" 
                {...removeProps(this.props, "value")} 
                value={this.props.value.get()}
                onChange={this.changed} />
        );
    }
}
