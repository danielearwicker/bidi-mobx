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
    title?: string;
}

export function removeProps<T, K extends keyof T>(props: T, ...names: K[]): any {
    const clone = Object.assign({}, props);
    for (const name of names) {
        delete clone[name];
    }

    return clone;
}

export type StyleComponent<T> = React.ComponentClass<React.HTMLProps<T>> | 
                            React.StatelessComponent<React.HTMLProps<T>>;
