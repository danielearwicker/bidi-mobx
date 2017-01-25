import { rules, Rule, field, numberAsString, 
    stringLimits, numberLimits, Field } from "../../../index";

import tagsAsString from "./tagsAsString";

export default class Simpson {

    name = field(stringLimits(1, 20))
                .create("", "Name")

    age = field(numberLimits(0, 120))
                .also(numberAsString(0))
                .create(0, "Age");

    tags = field(tagsAsString)
                .create([], "Tags");

    rule = rules([this.name, this.age, this.tags]);

    constructor(public id: string, name: string, age: number, tags: string[]) {
        this.name.model = name;
        this.age.model = age; 
        this.tags.model = tags;
    }
}

((_: Field<void, void>) => _);
((_: Rule) => _);
