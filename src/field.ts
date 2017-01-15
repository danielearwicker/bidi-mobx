import { action, observable, Lambda, autorun } from "mobx";
import { BoxedValue } from "boxm";
import { Rule } from "./rules"

export type ParseResult<T> = { error: string | string[] } | { value: T };

export function isParseError<T>(result: ParseResult<T>): result is { error: string | string[] } {
    return result && "error" in result;
}

export interface Field<View, Model> extends BoxedValue<View>, Rule { 
    model: Model;
}

class Adaptation<View, Model> implements Field<View, Model> {

    @observable model: Model;
    
    @observable private errors: string[];
    @observable private view: View;

    private stopWatchingView: Lambda;
    private stopWatchingModel: Lambda;

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

    get error() { 
        return this.errors; 
    }

    get() {
        return this.view;
    }

    toJSON() {
        return this.model;
    }

    @action    
    set(v: View) {
        this.view = v;
    }

    @action
    private updateFromRendered(newRendered: View) {
        const parsed = this.parse(newRendered);
        if (isParseError(parsed)) {
            this.errors = typeof parsed.error === "string" ? [parsed.error] : parsed.error;
        } else {
            this.errors = [];
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

export interface Adaptor<View, Model> {
    render(model: Model): View;
    parse(view: View): ParseResult<Model>;
}

export function field<View, Model>(inner: Adaptor<View, Model>) {

    function also<View2>(outer: Adaptor<View2, View>) {
    
        function render(m: Model) {
            return outer.render(inner.render(m));
        };

        function parse(v: View2) {
            const result = outer.parse(v);
            if (isParseError(result)) {
                return result;
            }
            return inner.parse(result.value);
        };

        return field({ render, parse });
    };

    function check(check: Check<View>) {
        return also(checker(check));
    }

    function create(value: Model, label?: string): Field<View, Model> {
        return new Adaptation<View, Model>(value, label, inner.render, inner.parse);
    }
    
    return { also, check, create };
}

export function numberAsString(decimalPlaces?: number) {

    const pattern = /^\s*[\-\+]?\d*[\.\,]?\d*\s*$/;

    function render(value: number) {
        return (decimalPlaces === undefined ? 
            value : value.toFixed(decimalPlaces)) + "";
    }

    function parse(str: string) {
        const value = parseFloat(str);
        if (isNaN(value) || !pattern.test(str)) {
            return { error: "Must be a number" };
        }        
        return { value };
    }

    return { render, parse };
}

export type Check<T> = (val: T) => string | string[] | undefined;

export function identity<T>() {
    return {
        render(value: T) {
            return value;
        },
        parse(value: T) {
            return { value };
        }
    };    
}

export function checker<T>(check: Check<T>) {
    return {
        render(value: T) {
            return value;
        },
        parse(value: T) {
            const error = check(value);
            return error ? { error } : { value };
        }
    };
}

export function numberLimits(min: number, max: number) {
    return checker((val: number) => 
        (val < min) ? `Minimum value ${min}` :
        (val > max) ? `Maximum value ${max}` :
        undefined);
}

export function stringLimits(minLength: number, maxLength: number) {
    return checker((str: string) =>    
        (str.length < minLength) ? `Minimum length ${minLength} characters` :            
        (str.length > maxLength) ? `Maximum length ${maxLength} characters` :
        undefined);
}

