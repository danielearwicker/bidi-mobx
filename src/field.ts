import { action, observable, computed } from "mobx";
import { BoxedValue } from "boxm";
import { Rule } from "./rules";

export interface Field<View, Model> extends BoxedValue<View>, Rule { 
    model: Model;
    error: string[];
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

const enum AdaptationMode { view, model };

function isError<T>(
    val: { value: T } | { error: any }
): val is { error: any } {
    return "error" in val;
}

class Adaptation<View, Model> implements Field<View, Model> {

    @observable modelStore: Model;
    @observable viewStore: View;
    @observable mode = AdaptationMode.model;
    
    constructor(init: Model,
        public label: string | undefined,        
        private render: (view: Model) => View,
        private parse: (str: View) => Model
    ) {
        this.modelStore = init;
        this.viewStore = render(init);
    }

    @computed get viewFromModel(): View {        
        return this.render(this.modelStore);
    }

    @computed get modelFromView(): ({ value: Model } | { error: any }) {
        try {
            return { value: this.parse(this.viewStore) };
        } catch (error) {
            return { error };
        }
    }

    @computed
    get view() {
        return this.mode === AdaptationMode.view
            ? this.viewStore
            : this.viewFromModel;
    }
    set view(value: View) {
        this.viewStore = value;
        this.mode = AdaptationMode.view;
    }

    @computed
    get model() {
        const modelFromView = this.modelFromView;
        return this.mode === AdaptationMode.model || isError(modelFromView) 
            ? this.modelStore 
            : modelFromView.value!;
    }
    set model(value: Model) {
        this.modelStore = value;
        this.mode = AdaptationMode.model;
    }

    @computed
    get error(): string[] {
        const modelFromView = this.modelFromView;
        return modelFromView && isError(modelFromView) ? getErrors(modelFromView.error) : []
    }

    get() {
        return this.view;
    }

    @action    
    set(v: View) {
        this.view = v;
    }

    toJSON() {
        return this.modelStore;
    }
}

export interface Adaptor<View, Model> {
    render(model: Model): View;
    parse(view: View): Model;
}

export interface FieldBuilder<View, Model> {
    also<View2>(outer: Adaptor<View2, View>): FieldBuilder<View2, Model>;
    check(check: Check<View>): FieldBuilder<View, Model>;
    create(value: Model, label?: string, delay?: number): Field<View, Model>;
}

export function field<View, Model>(inner: Adaptor<View, Model>): FieldBuilder<View, Model> {

    function also<View2>(outer: Adaptor<View2, View>) {
    
        function render(m: Model) {
            return outer.render(inner.render(m));
        };

        function parse(v: View2) {
            return inner.parse(outer.parse(v));
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

