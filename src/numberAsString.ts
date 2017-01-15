import { adaptor, AdaptedValue } from "./adaptor"

export interface NumberAsStringOptions {
    decimalPlaces?: number;
    minimum?: number;
    maximum?: number;
}

export default function numberAsString(
    {decimalPlaces, minimum, maximum}: NumberAsStringOptions
) {

    const pattern = /^\s*[\-\+]?\d*[\.\,]?\d*\s*$/;

    function format(value: number) {
        return (decimalPlaces === undefined ? 
            value : value.toFixed(decimalPlaces)) + "";
    }

    return adaptor(format, (str: string) => {
        const value = parseFloat(str);
        if (isNaN(value) || !pattern.test(str)) {
            return { error: "Must be a number" };
        }
        if (minimum !== undefined && value < minimum) {
            return { error: `Minimum ${format(minimum)}` };
        }
        if (maximum !== undefined && value > maximum) {
            return { error: `Maximum ${format(maximum)}` };
        }
        return { value };
    });
}

// Squash error about unused type AdaptedValue:
(_: AdaptedValue<string, number>) => _
