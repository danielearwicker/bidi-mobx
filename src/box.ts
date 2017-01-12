import { boxer, makeBoxedValue, BoxedValue } from "boxm";
import { extras, isObservable, isComputed } from "mobx";

export const box = boxer((obj, key) => {
    const atom = (isObservable(obj, key) || isComputed(obj, key)) 
        && extras.getAtom(obj, key) as any as BoxedValue<any>;

    return atom || makeBoxedValue(obj, key);
});

