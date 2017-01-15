import { action, observable, Lambda, autorun } from "mobx";
import { BoxedValue } from "boxm";
import { Rule } from "./rules"

export type ParseResult<T> = { error: string | string[] } | { value: T };

export function isParseError<T>(result: ParseResult<T>): result is { error: string | string[] } {
    return result && "error" in result;
}

export interface AdaptedValue<View, Model> extends BoxedValue<View>, Rule { 
    model: Model;
}

export class Adaptation<View, Model> implements AdaptedValue<View, Model> {

    @observable model: Model;
    
    @observable private errorsInternal: string[];
    @observable private view: View;
    private stopWatchingView: Lambda;
    private stopWatchingModel: Lambda;

    get error() { return this.errorsInternal; }

    constructor(init: Model,
        public label: string | undefined,
        private render: (view: Model) => View,
        private parse: (str: View) => ParseResult<Model>
    ) {
        this.model = init;
        this.view = this.render(this.model);
        this.stopWatchingView = autorun(this.watchView);
        this.stopWatchingModel = autorun(this.watchModel);
    }

    dispose() {
        this.stopWatchingView();
        this.stopWatchingModel();
    }

    get() {
        return this.view;
    }

    @action    
    set(v: View) {
        this.view = v;
    }

    @action
    private updateFromRendered(newRendered: View) {
        const parsed = this.parse(newRendered);
        if (isParseError(parsed)) {
            this.errorsInternal = typeof parsed.error === "string" ? [parsed.error] : parsed.error;
        } else {
            this.errorsInternal = [];
            // Round-trip to get a canonical view for comparison
            const roundTrippedParsed = this.render(parsed.value);
            const view = this.render(this.model);
            if (roundTrippedParsed !== view) {
                this.model = parsed.value;
            }
        }
    }

    @action
    private updateFromParsed(newParsed: Model) {
        const newRendered = this.render(newParsed);

        // Round-trip to get a canonical value for comparison
        const model = this.parse(this.view);
        if (isParseError(model)) {
            // Not currently valid, so just accept better replacement
            this.view = newRendered;
            this.model = newParsed;
        }
        else
        {
            const roundTripped = this.render(model.value);
            // Only if the canonical representation has changed
            if (newRendered !== roundTripped) {
                this.view = newRendered;
            }
        }
    }

    // Tracks changes made to this.value
    private watchView = () => this.updateFromRendered(this.view);
    
    // Track changes made to this.model.value
    private watchModel = () => this.updateFromParsed(this.model);
}

export function adaptor<View, Model>(
    render: (value: Model) => View,
    parse: (str: View) => ParseResult<Model>
) {
    return (init: Model, label?: string): AdaptedValue<View, Model> => 
        new Adaptation<View, Model>(init, label, render, parse);
}

export type Check<T> = (val: T) => string | string[] | undefined;

export type CheckedValue<T> = AdaptedValue<T, T>;

export function checker<T>(checks: Check<T> | Check<T>[]) {

    function validate(value: T): ParseResult<T> {

        const error: string[] = [];

        const ar = checks instanceof Array ? checks : [checks];

        for (const validator of ar) {
            const result = validator(value);
            if (result) {
                if (typeof result === "string") {
                    error.push(result);
                } else {
                    error.concat(...result);
                }
            }
        }

        return error.length ? { error } : { value }; 
    }

    return adaptor(v => v, validate);
}
