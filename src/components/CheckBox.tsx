import * as React from "react";
import { action, Lambda, autorun } from "mobx";
import { observer } from "mobx-react";
import { FormElementProps, removeProps, StyleComponent } from "./FormElementProps";

export interface CheckBoxProps extends FormElementProps {    
    value: { // https://github.com/danielearwicker/bidi-mobx/issues/14
        get(): boolean | undefined;
        set(value: boolean): void;
    };
    component?: StyleComponent<HTMLInputElement>
}

@observer
export class CheckBox extends React.Component<CheckBoxProps, {}> {

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
        const { component: InputComponent = "input" } = this.props;

        return (
            <InputComponent type="checkbox"
                {...removeProps(this.props, "value")}
                checked={this.props.value.get() || false}
                ref={ this.indeterminate }
                onChange={this.changed}/>
        );
    }
}

export function CheckBoxUsing(component: StyleComponent<HTMLInputElement>) {
    return (props: CheckBoxProps) => <CheckBox component={component} {...props}/>; 
}
