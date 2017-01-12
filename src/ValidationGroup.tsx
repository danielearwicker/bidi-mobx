import * as React from "react"
import { observable, computed, Lambda, autorun } from "mobx";
import { BoxedValue } from "../index";

import { 
    ValidationGroupContext, 
    validationGroupContext, 
    ValidationItem 
} from "./validationCommon";

export interface ValidationGroupProps {
    validity?: BoxedValue<boolean>;
    errors?: BoxedValue<string[]>;
}

export class ValidationGroup extends React.Component<ValidationGroupProps, {}> {

    @observable 
    private items: ValidationItem[] = [];

    @computed
    private get errors() {
        return this.items.filter(i => i.error).map(i => i.error!);
    }

    @computed
    private get validity() {
        return this.errors.length == 0;
    }

    private quit: Lambda;

    constructor(props: ValidationGroupProps) {
        super(props);

        this.quit = autorun(() => this.publishState);
    }

    publishState() {
        if (this.props.validity) {
            this.props.validity.set(this.validity);
        }

        if (this.props.errors) {
            this.props.errors.set(this.errors);
        }
    }

    static childContextTypes = validationGroupContext;

    getChildContext(): ValidationGroupContext {
        return { 
            bidiMobxValidationCreate: () => new ValidationItem(this.items)            
        };
    }

    render() {
        return <div>{this.props.children}</div>;
    }
}
