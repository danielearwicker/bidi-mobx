import { observable } from "mobx";
import * as React from "react";

export const validationGroupContext = {
    bidiMobxValidationCreate: React.PropTypes.func
};

export class ValidationItem {
    
    @observable error?: string;

    constructor(private list: ValidationItem[]) {
        list.push(this);
    }

    dispose() {
        var pos = this.list.indexOf(this);
        if (pos !== -1) {
            this.list.splice(pos, 1);
        }
    }    
}

export interface ValidationGroupContext {
    bidiMobxValidationCreate(): ValidationItem;
}
