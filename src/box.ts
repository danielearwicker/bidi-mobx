import { boxer, makeBoxedValue, BoxedValue } from "boxm";
import { extras, isObservable, isComputed } from "mobx";

function getAtom(obj: any, key: string) {
    try { 
        return (isObservable(obj, key) || isComputed(obj, key)) 
            && extras.getAtom(obj, key) as any as BoxedValue<any>;
    }
    catch (x) {
        // If ordinary property, isComputed seems to throw!
        return undefined;
    }
}

export const box = boxer((obj, key) => {
    return getAtom(obj, key) || makeBoxedValue(obj, key);
});

export { BoxedValue, BoxedObject } from "boxm";