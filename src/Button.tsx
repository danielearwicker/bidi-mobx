import * as React from "react";
import { observer } from "mobx-react";
import { FormElementProps, removeProps } from "./FormElementProps";

export interface ButtonProps extends FormElementProps { }

function Button_(props: ButtonProps) {
    return (
        <button disabled={props.enabled && !props.enabled.get()}
            {...removeProps(props, "enabled")} /> 
    );
}

export const Button = observer(Button_);