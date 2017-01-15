import { action, observable, Lambda, autorun, runInAction } from "mobx";
import { BoxedValue } from "boxm";
import { Rule } from "./rules"

export type ParseResult<T> = { error: string | string[] } | { value: T };

export function isParseError<T>(result: ParseResult<T>): result is { error: string | string[] } {
    return result && "error" in result;
}

export interface Field<View, Model> extends BoxedValue<View>, Rule { 
    model: Model;
    running: PromiseLike<void> | undefined;
}

function isPromiseLike<T>(val: T | PromiseLike<T>): val is PromiseLike<T> {
    return val && typeof (val as any).then === "function";
}

/**
 * Minimal conversion optional promise into definite promise. Except we
 * release Zalgo! If nothing asynchronous is involved then we want true
 * synchronous (nested stack traces etc.) - see unpromise.
 */
function asPromiseLike<T>(val: T | PromiseLike<T>): PromiseLike<T> {
    if (isPromiseLike(val)) {
        return val;
    }

    const pl = {
        then(callback: (val: T) => T | PromiseLike<T>): PromiseLike<T> {
            return asPromiseLike(callback(val));
        },
        $promiseImmediateValue: val
    };

    return pl;
}

/**
 * Turns a definite promise into an optional promise; if it's a plain
 * value previously wrapped by asPromiseLike then it can become that
 * plain value.
 */
function unpromise<T>(val: PromiseLike<T>) {
    if ("$promiseImmediateValue" in val) {
        return (val as any).$promiseImmediateValue as T;
    }
    return val;
}

function getErrorMessage(e: any) { 
    if (e && e.message) {
        return e.message as string;
    }
    try {
        return JSON.stringify(e);
    } catch (x) {
        return x.message as string || "Unknown error";
    }
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
        private parse: (str: View) => ParseResult<Model> | PromiseLike<ParseResult<Model>>
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
    private updateFromView(newRendered: View) {        
        this.continue(this.parse(newRendered), parsed => {
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
        });        
    }

    @action
    private updateFromModel(newParsed: Model) {
        const newRendered = this.render(newParsed);

        // Round-trip to get a canonical value for comparison
        this.continue(this.parse(this.view), model => {
            if (isParseError(model)) {
                // Not currently valid, so just accept better replacement
                this.view = newRendered;
                this.model = newParsed;
            } else {
                const roundTripped = this.render(model.value);
                // Only if the canonical representation has changed
                if (newRendered !== roundTripped) {
                    this.view = newRendered;
                }
            }
        });
    }

    // Tracks changes made to this.value
    private watchView = () => this.updateFromView(this.view);
    
    // Track changes made to this.model.value
    private watchModel = () => this.updateFromModel(this.model);

    private continuationVersion: number | undefined;

    private continue<T>(
        promiseOrResult: ParseResult<T> | PromiseLike<ParseResult<T>>, 
        continuation: (result: ParseResult<T>) => void
    ) {        
        if (isPromiseLike(promiseOrResult)) {
            if (typeof this.continuationVersion === "undefined") {
                this.continuationVersion = 0;
            } else {
                this.continuationVersion++;
            }
            const version = this.continuationVersion;
            this.running = promiseOrResult
                .then(null, e => ({ error: getErrorMessage(e) }))
                .then(result => {
                    if (this.continuationVersion == version) {
                        runInAction(() => continuation(result));
                    }
                    this.running = undefined;
                });
        } else {
            continuation(promiseOrResult);
        }
    }

    running: PromiseLike<void> | undefined;
}

export interface Adaptor<View, Model> {
    render(model: Model): View;
    parse(view: View): ParseResult<Model> | PromiseLike<ParseResult<Model>>;
}

export function field<View, Model>(inner: Adaptor<View, Model>) {

    function also<View2>(outer: Adaptor<View2, View>) {
    
        function render(m: Model) {
            return outer.render(inner.render(m));
        };

        function parse(v: View2) {
            return unpromise(asPromiseLike(outer.parse(v)).then(result => {

                if (isParseError(result)) {
                    return result;
                }

                return inner.parse(result.value);
            }));
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

