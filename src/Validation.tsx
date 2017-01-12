import * as React from "react";

import { 
    ValidationGroupContext, 
    validationGroupContext, 
    ValidationItem 
} from "./validationCommon";

export interface ValidationProps {
    test: boolean;
    message?: string;
}

export class Validation extends React.Component<ValidationProps, {}> {

    item?: ValidationItem;

    static contextTypes = validationGroupContext;

    constructor(props: ValidationProps, context: ValidationGroupContext) {
        super(props, context);

        if (context.bidiMobxValidationCreate) {
            this.item = context.bidiMobxValidationCreate();
            this.updateItem(props);
        }
    }

    updateItem(props: ValidationProps) {
        if (this.item) {
            this.item.error = props.test ? undefined : props.message;
        }
    }

    componentWillReceiveProps(props: ValidationProps, context: ValidationGroupContext) {
        if (context.bidiMobxValidationCreate !== this.context.bidiMobxValidationCreate) {
            if (this.item) {
                this.item.dispose();
            }
            this.item = context.bidiMobxValidationCreate();            
        }

        this.updateItem(props);
    }

    componentWillUnmount() {
        if (this.item) {
            this.item.dispose();
        }
    }

    render() {
        return this.props.test && this.props.children ? <div>{this.props.children}</div> : null;
    }
}
