import { observable } from "mobx";

export default class TagState {

    @observable checked = false;
    constructor(public name: string) { }
}
