import { computed } from "mobx";

export interface Rule {
    readonly error?: string | string[];
    readonly label?: string;
}

export function errors(loose: Rule): string[] {
    const dupes: { [str: string]: boolean } = {}, result = [], list = !loose.error ? [] : 
        typeof loose.error === "string" ? [loose.error] :
        loose.error;
    
    for (const err of list) {
        if (err && !(err in dupes)) {
            dupes[err] = true;
            result.push(err);
        }
    }

    return result;
}

export function rule(test: () => string | string[] | undefined): Rule {
    const error = computed(test);
    return {
        get error() {
            return error.get();
        }
    }
}

export type ErrorFormat = (label: string, error: string) => string;

export function label(label: string, error: string) {
    return `${label} - ${error}`;
}

export function rules(rules: Rule[], optionalFormat?: ErrorFormat) {
    const format = optionalFormat || label;
    
    return rule(() => {
        const result: string[] = [];
        for (const r of rules) {
            for (const e of errors(r)) {
                result.push(r.label ? format(r.label, e) : e);
            }
        }
        return result;
    });
}

export function props(rule: Rule, props: {
    className?: string;
    errorClass?: string;
    title?: string;
}) {
    let className = props.className;
    let title = props.title;
    
    const errs = errors(rule);
    if (errs.length != 0) {
        const prefix = className ? (className + " ") : "",
                suffix = props.errorClass || "has-errors";
        className = `${prefix}${suffix}`;
        title += "\n" + errs.join("\n");
    }

    return { className, title };
}

