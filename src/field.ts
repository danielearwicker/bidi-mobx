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

class Adaptation<View, Model> implements Field<View, Model> {

    @observable modelStore: Model;
   
    @observable viewStore: View;
    @observable errorStore: string[];
    
    constructor(init: Model,
        private modelBox: BoxedValue<Model> | undefined,
        public label: string | undefined,        
        private render: (view: Model) => View,
        private parse: (str: View) => Model
    ) {
        this.modelStore = init;
        this.view = render(init);
    }

    @computed
    get view() {
        return !this.modelBox || this.modelBox.get() === this.modelStore 
            ? this.viewStore
            : this.render(this.modelBox.get())
    }
    set view(value: View) {
        this.viewStore = value;
        try {
            this.modelStore = this.parse(value);            
            this.errorStore = [];
            if (this.modelBox) {
                this.modelBox.set(this.modelStore);
            }
        } catch (error) {
            if (error instanceof ValidationError) {
                this.errorStore = getErrors(error);
            } else {
                throw error;
            }            
        }
    }

    @computed
    get model() {
        return this.modelBox ? this.modelBox.get() : this.modelStore;
    }
    set model(value: Model) {
        if (this.modelBox) {
            this.modelBox.set(value);
        }
        this.modelStore = value;
        this.viewStore = this.render(value);
        this.errorStore = [];
    }

    @computed
    get error(): string[] {
        return !this.modelBox || this.modelBox.get() === this.modelStore ?
            this.errorStore : [];
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
    create(value: Model, label?: string): Field<View, Model>;
    use(box: BoxedValue<Model>, label?: string): Field<View, Model>;
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
        return new Adaptation<View, Model>(value, undefined, label, inner.render, inner.parse);
    }
    
    function use(box: BoxedValue<Model>, label?: string): Field<View, Model> {
        return new Adaptation<View, Model>(box.get(), box, label, inner.render, inner.parse);
    }

    return { also, check, create, use };
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

