import { action, observable, Lambda, autorun } from "mobx";
import { MetaValue } from "meta-object";

export type ParseResult<T> = { error: string } | { value: T };

export function isParseError<T>(result: ParseResult<T>): result is { error: string } {
    return "error" in result;
}

export class ConversionModel<Formatted, Parsed> {

    @observable parsed: MetaValue<Parsed>;
    @observable formatted: Formatted;
    @observable error: string | undefined;

    stopWatchingFormatted: Lambda;
    stopWatchingParsed: Lambda;

    constructor(parsed: MetaValue<Parsed>,
        private format: (value: Parsed) => Formatted,
        private parse: (str: Formatted) => ParseResult<Parsed>
    ) {
        this.parsed = parsed;
        this.formatted = this.format(parsed.get());
        this.stopWatchingFormatted = autorun(this.watchFormatted);
        this.stopWatchingParsed = autorun(this.watchParsed);
    }

    dispose() {
        this.stopWatchingFormatted();
        this.stopWatchingParsed();
    }

    @action
    updateFromFormatted(newFormatted: Formatted) {
        const parsed = this.parse(newFormatted);
        if (isParseError(parsed)) {
            this.error = parsed.error;
        } else {
            this.error = undefined;
            // Round-trip to get a canonical formatted for comparison
            const roundTrippedParsed = this.format(parsed.value);
            const formatted = this.format(this.parsed.get());
            if (roundTrippedParsed !== formatted) {
                this.parsed.set(parsed.value);
            }
        }
    }

    @action
    updateFromParsed(newParsed: Parsed) {
        const newFormatted = this.format(newParsed);

        // Round-trip to get a canonical formatted for comparison
        const parsed = this.parse(this.formatted);
        if (isParseError(parsed)) {
            // Not currently valid, so just accept better replacement
            this.formatted = newFormatted;
            this.parsed.set(newParsed);
        }
        else
        {
            const roundTripped = this.format(parsed.value);
            // Only if the canonical representation has changed
            if (newFormatted !== roundTripped) {
                this.formatted = newFormatted;
            }
        }
    }

    // Tracks changes made to this.formatted
    watchFormatted = () => {
        this.updateFromFormatted(this.formatted);
    }

    // Track changes made to this.parsed.value
    watchParsed = () => {
        this.updateFromParsed(this.parsed.get());
    }
}
