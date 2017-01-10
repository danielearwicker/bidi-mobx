import { TypedInput, TypedInputProps } from "./TypedInput";

export interface NumberInputProps extends TypedInputProps<number> {
    decimalPlaces?: number;
    minimum?: number;
    maximum?: number;
}

const pattern = /^\s*[\-\+]?\d*[\.\,]?\d*\s*$/;

export class NumberInput extends TypedInput<number, NumberInputProps> {

    format(value: number) {
        return (this.props.decimalPlaces === undefined ? 
            value : value.toFixed(this.props.decimalPlaces)) + "";
    }

    parse(str: string) {
        
        const value = parseFloat(str);
        if (isNaN(value) || !pattern.test(str)) {
            return { error: "Must be a number" };
        }
        if (this.props.minimum !== undefined && value < this.props.minimum) {
            return { error: `Minimum ${this.format(this.props.minimum)}` };
        }
        if (this.props.maximum !== undefined && value > this.props.maximum) {
            return { error: `Maximum ${this.format(this.props.maximum)}` };
        }

        return { value };
    }

    propsToRemove(): (keyof NumberInputProps)[] {
        return super.propsToRemove().concat(["decimalPlaces", "minimum", "maximum"]);
    }
}
