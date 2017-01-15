import * as test from "tape";

import { field, numberLimits, numberAsString, stringLimits, identity, checker } from "../src/field"
import { errors } from "../src/rules";

test("Field identity", t => {

    const age = field(identity<number>()).create(20, "Age");

    t.equal(age.label, "Age");
    t.equal(age.model, 20);
    t.equal(age.get(), 20);
    t.equal(errors(age).length, 0);

    age.set(30);

    t.equal(age.model, 30);
    t.equal(age.get(), 30);
    t.equal(errors(age).length, 0);

    age.model = 2;

    t.equal(age.get(), 2);
    t.equal(errors(age).length, 0);

    t.end();
});

test("Custom checker", t => {

    const age = field(checker(v => v === 25 ? "Not allowed" : undefined)).create(20, "Age");

    t.equal(age.label, "Age");
    t.equal(age.model, 20);
    t.equal(age.get(), 20);
    t.equal(errors(age).length, 0);
    
    age.set(25);

    t.equal(age.model, 20);
    t.equal(age.get(), 25);
    t.equal(errors(age).length, 1);
    t.equal(errors(age)[0], "Not allowed");

    age.set(26);

    t.equal(age.get(), 26);
    t.equal(age.model, 26);
    t.equal(errors(age).length, 0);

    t.end();
});

test("Field chaining with also", t => {

    const age = field(numberLimits(1, 100))
                    .also(numberAsString(2))
                    .also(stringLimits(2, 6))
                    .create(20, "Age");

    t.equal(age.label, "Age");
    t.equal(age.model, 20);
    t.equal(age.get(), "20.00");
    t.equal(errors(age).length, 0);

    age.set("30");

    t.equal(age.model, 30);
    t.equal(age.get(), "30");
    t.equal(errors(age).length, 0);

    age.model = 20;

    t.equal(age.get(), "20.00");
    t.equal(errors(age).length, 0);

    age.set("8");
    t.equal(age.model, 20);
    t.equal(errors(age).length, 1);
    t.equal(errors(age)[0], "Minimum length 2 characters");

    age.set("200");
    t.equal(age.model, 20);
    t.equal(errors(age).length, 1);
    t.equal(errors(age)[0], "Maximum value 100");

    age.set("25");

    t.equal(age.model, 25);
    t.equal(age.get(), "25");
    t.equal(errors(age).length, 0);

    t.end();
});

