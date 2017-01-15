import * as test from "blue-tape";

import { field, numberLimits, numberAsString, stringLimits, identity, checker, ParseResult } from "../src/field"
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

const delay = {
    render(str: string) {
        return str;
    },
    parse(value: string) {
        return new Promise<ParseResult<string>>(
            (resolve, reject) => setTimeout(() => {
                if (value === "error1") {
                    reject(new Error("errmsg"));
                } else if (value === "error2") {
                    reject({ badError: true });
                } else {
                    resolve({ value });
                }
            }, 100)
        );
    }
};

test("Field adaptor returning promise", async t => {

    const age = field(numberLimits(1, 100))
                    .also(numberAsString(2))
                    .also(delay)
                    .also(stringLimits(2, 6))
                    .create(20, "Age");

    t.equal(age.label, "Age");
    t.equal(age.model, 20);
    t.equal(age.get(), "20.00");
    t.equal(errors(age).length, 0);

    age.set("30");

    await age.running;

    t.equal(age.model, 30);
    t.equal(age.get(), "30");
    t.equal(errors(age).length, 0);

    age.model = 20;

    await age.running;

    t.equal(age.get(), "20.00");
    t.equal(errors(age).length, 0);

    age.set("8");

    await age.running;

    t.equal(age.model, 20);
    t.equal(errors(age).length, 1);
    t.equal(errors(age)[0], "Minimum length 2 characters");

    age.set("200");

    await age.running;

    t.equal(age.model, 20);
    t.equal(errors(age).length, 1);
    t.equal(errors(age)[0], "Maximum value 100");

    age.set("25");

    await age.running;

    t.equal(age.model, 25);
    t.equal(age.get(), "25");
    t.equal(errors(age).length, 0);

    age.set("error1");

    await age.running;

    t.equal(age.model, 25);
    t.equal(age.get(), "error1");
    t.equal(errors(age).length, 1);
    t.equal(errors(age)[0], "errmsg");

    age.set("error2");

    await age.running;
    
    t.equal(age.model, 25);
    t.equal(age.get(), "error2");
    t.equal(errors(age).length, 1);
    t.equal(errors(age)[0], JSON.stringify({ badError: true }));

    age.set("25");

    await age.running;

    t.equal(age.model, 25);
    t.equal(age.get(), "25");
    t.equal(errors(age).length, 0);
});

