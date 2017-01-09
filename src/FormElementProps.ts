import { CSSProperties } from "react";

export interface FormElementProps {
    autofocus?: boolean;
    className?: string;
    style?: CSSProperties;
    disabled?: boolean;
    form?: string;
    name?: string;
    readonly?: boolean;
    required?: boolean;
    tabindex?: number;
}

export function removeProps<T, K extends keyof T>(props: T, ...names: K[]): any {
    const clone = Object.assign({}, props);
    for (const name of names) {
        delete clone[name];
    }

    return clone;
}
