import * as test from "tape";
import { observable, isObservable, isObservableObject, computed, isComputed } from "mobx";
import { box } from "../index"

test(`Boxing plain properties`, t => {

    const o = { str: "hello", num: 5 };

    const str = box(o).str;
    const num = box(o).num;

    t.equal(str.get(), "hello");
    t.equal(num.get(), 5);    

    str.set("goodbye");

    t.equal(str.get(), "goodbye");
    t.equal(num.get(), 5);    

    num.set(22);

    t.equal(str.get(), "goodbye");
    t.equal(num.get(), 22);

    t.end();
});

class TestClass {
    @observable str = "hello";
    @observable num = 5;

    @computed 
    get message() {
        return `${this.str} from the number ${this.num}`;
    }
    set message(val: string) {
        const parts = val.split(" ");
        this.str = parts[0];
        this.num = parseFloat(parts[1]);
    }
}

test(`Boxing mobx`, t => {

    const o = new TestClass();

    const {str, num, message} = box(o);
    
    t.true(isObservable(str));
    t.true(isObservable(num));
    t.true(isComputed(message));

    t.equal(str.get(), "hello");
    t.equal(num.get(), 5);
    t.equal(message.get(), "hello from the number 5");

    str.set("goodbye");

    t.equal(str.get(), "goodbye");
    t.equal(num.get(), 5);
    t.equal(message.get(), "goodbye from the number 5");

    num.set(22);

    t.equal(str.get(), "goodbye");
    t.equal(num.get(), 22);
    t.equal(message.get(), "goodbye from the number 22");

    message.set("hooray 10");
    t.equal(message.get(), "hooray from the number 10");

    t.end();
});
