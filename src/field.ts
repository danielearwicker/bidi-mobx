import { action, observable, Lambda, autorun, runInAction } from "mobx";
import { BoxedValue } from "boxm";
import { Rule } from "./rules"

export interface Field<View, Model> extends BoxedValue<View>, Rule { 
    model: Model;
    running: PromiseLike<void> | undefined;
}

function isPromiseLike<T>(val: T | PromiseLike<T>): val is PromiseLike<T> {
    return val && typeof (val as any).then === "function";
}

export class ValidationError {
    message: string;
    errors: string[];
    constructor(errors: string[] | string) {
        this.errors = typeof errors === "string" ? [errors] : errors;
        this.message = this.errors.join("\n");
    }
}

function getErrors(e: any) { 
    if (e instanceof ValidationError) {
        return e.errors;
    }

    if (e && e.message) {
        return [e.message as string];
    }
    try {
        return [JSON.stringify(e)];
    } catch (x) {
        return [x.message as string || "Unknown error"];
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
        private parse: (str: View) => Model | PromiseLike<Model>
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
        this.parseAndContinue(newRendered, 
            model => {
                this.errors = [];
                // Round-trip to get a canonical view for comparison
                const roundTrippedParsed = this.render(model);
                const view = this.render(this.model);
                if (roundTrippedParsed !== view) {
                    this.model = model;
                }
            },
            errors => this.errors = errors
        );
    }

    @action
    private updateFromModel(newParsed: Model) {
        const newRendered = this.render(newParsed);

        // Round-trip to get a canonical value for comparison (can't I eliminate this?)
        this.parseAndContinue(this.view,
            model => {
                const roundTripped = this.render(model);
                // Only if the canonical representation has changed
                if (newRendered !== roundTripped) {
                    this.view = newRendered;
                }
            },
            errors => {
                // Not currently valid, so just accept better replacement
                this.view = newRendered;
                this.model = newParsed;
                errors; // unused
            }
        );
    }

    // Tracks changes made to this.value
    private watchView = () => this.updateFromView(this.view);
    
    // Track changes made to this.model.value
    private watchModel = () => this.updateFromModel(this.model);

    private continuationVersion: number | undefined;

    private parseAndContinue(view: View, 
        good: (result: Model) => void,
        fail: (errors: string[]) => void
    ) {
        let promiseOrResult: PromiseLike<Model> | Model | undefined;
        try {
            promiseOrResult = this.parse(view);
        } catch (x) {
            fail(getErrors(x));
            return;
        }

        if (isPromiseLike(promiseOrResult)) {
            if (typeof this.continuationVersion === "undefined") {
                this.continuationVersion = 0;
            } else {
                this.continuationVersion++;
            }
            const version = this.continuationVersion;
            this.running = promiseOrResult
                .then(result => {
                    if (this.continuationVersion == version) {
                        runInAction(() => good(result));
                    }
                    this.running = undefined;
                }, err => {
                    if (this.continuationVersion == version) {
                        runInAction(() => fail(getErrors(err)));
                    }
                    this.running = undefined;                    
                });
        } else {
            good(promiseOrResult);
        }
    }

    running: PromiseLike<void> | undefined;
}

export interface Adaptor<View, Model> {
    render(model: Model): View;
    parse(view: View): Model | PromiseLike<Model>;
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

export function field<View, Model>(inner: Adaptor<View, Model>) {

    function also<View2>(outer: Adaptor<View2, View>) {
    
        function render(m: Model) {
            return outer.render(inner.render(m));
        };

        function parse(v: View2) {
            return unpromise(asPromiseLike(outer.parse(v)).then(result => inner.parse(result)));
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
            throw new ValidationError("Must be a number");
        }        
        return value;
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
            return value;
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
            if (error) {
                throw new ValidationError(error);
            }
            return value;
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

