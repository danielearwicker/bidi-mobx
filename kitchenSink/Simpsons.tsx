import * as React from "react"

import { observable, computed } from "mobx";
import { observer } from "mobx-react";
import { MappedArray } from "mapped-array-mobx";
import CheckBox from "../src/components/CheckBox";
import TypedRadioButton from "../src/components/RadioButton";
import TypedSelect from "../src/components/Select";
import TextInput from "../src/components/TextInput";
import RuleBullets from "../src/components/RuleBullets";
import { box, BoxedValue } from "../src/box";
import { adaptor, AdaptedValue, checker, CheckedValue } from "../src/adaptor";
import { Rule, rules } from "../src/rules";
import numberAsString from "../src/numberAsString";

const tagsAsString = adaptor(
    (value: string[]) => value.slice(0).sort().join(" "),
    (str: string) => ({ value: str.split(/\s+/).filter(s => s) })    
)

const simpsonsData = [{
    name: "Homer", 
    age: 37,
    tags: ["male", "adult", "stupid"]
}, {
    name: "Marge",
    age: 37,
    tags: ["female", "adult"]
}, {
    name: "Bart",
    age: 10,
    tags: ["male", "child", "stupid"],
}, {
    name: "Lisa",
    age: 8,
    tags: ["female", "child", "smart"]
}, {
    name: "Maggie",
    age: 2,
    tags: ["female", "baby", "smart"]
}, {
    name: "Grandpa",
    age: 78,
    tags: ["male", "elderly", "stupid"]
}];

class TagState {
    @observable checked = false;
    constructor(public name: string) { }
}

function stringLengthLimits(min: number, max: number) {
    return checker((str: string) => {
        if (str.length < min) {
            return `Minimum length ${min} characters`;
        }
        if (str.length > max) {
            return `Maximum length ${max} characters`;
        }
        return undefined;
    })
}

class Simpson {
    name: CheckedValue<string>;
    age: AdaptedValue<string, number>
    tags: AdaptedValue<string, string[]>

    rule: Rule;

    constructor(public id: string, name: string, age: number, tags: string[]) {
        this.name = stringLengthLimits(1, 20)(name, "Name");
        this.age = numberAsString({ decimalPlaces: 0, minimum: 0, maximum: 120 })(age, "Age")
        this.tags = tagsAsString(tags, "Tags");
        this.rule = rules([this.name, this.age, this.tags])
    }
}

function overlapping<T>(a: T[], b: T[]) {
    return a.some(fromA => b.some(fromB => fromA == fromB));
}

class ViewState {
    
    @observable simpsons = simpsonsData.map((s, i) => new Simpson(i + "", s.name, s.age, s.tags));
    @observable selected: Simpson = this.simpsons[0];

    @computed get allTagNames() {        
        const result: { [name: string]: boolean } = {};
        for (const s of this.simpsons) {
            for (const t of s.tags.model) {
                result[t] = true;
            }
        }
        return Object.keys(result).sort();
    }

    allTags = new MappedArray<string, TagState, string>(
        () => this.allTagNames, t => t, t => new TagState(t));

    @computed get selectedTags() {
        return this.allTags.result.filter(t => t.checked).map(t => t.name);
    }

    @computed get filtered() {
        return this.simpsons.filter(s => overlapping(this.selectedTags, s.tags.model));
    }
}

function Tag_({ tag }: { tag: TagState }) {
    return <label><CheckBox value={box(tag).checked} />{tag.name}</label>;
}
const Tag = observer(Tag_);

function TagList({ tags }: { tags: TagState[] }) {
    return (
        <div>
        { tags.map(tag => <div key={tag.name}><Tag tag={tag}/></div>) }
        </div>
    );
}

function SimpsonEditor_ ({ simpson }: { simpson: Simpson }) {

    return (
        <div>
            <div><label>Name <TextInput value={simpson.name} /></label></div>
            <div><label>Age <TextInput value={simpson.age} /></label></div>
            <div><label>Tags <TextInput value={simpson.tags} /></label></div>

            <RuleBullets rule={simpson.rule}/>
        </div>
    );
}
const SimpsonEditor = observer(SimpsonEditor_);

class SimpsonRadioButton extends TypedRadioButton<Simpson> {}

function SimpsonsSelectorButtons_({ simpsons, selected }: { simpsons: Simpson[], selected: BoxedValue<Simpson> }) {
    return (
        <div>
            {
                simpsons.map(item => (
                    <div key={item.id}>
                        <label><SimpsonRadioButton option={item} value={selected}/>{item.name.model}</label>
                    </div>
                ))
            }
        </div>
    );
}
const SimpsonsSelectorButtons = observer(SimpsonsSelectorButtons_);

class SelectSimpson extends TypedSelect<Simpson> {}

@observer
export default class Simpsons extends React.Component<{}, {}> {

    private viewState = new ViewState();

    render() {

        const state = this.viewState;
        const selected = box(state).selected;

        return (
            <div className="simpsons">
                <fieldset>
                    <legend>Tags</legend>
                    <TagList tags={state.allTags.result} />
                </fieldset>
                {
                    state.filtered.length ? (
                        <fieldset>
                            <legend>Simpsons</legend>
                            <SimpsonsSelectorButtons
                                simpsons={state.filtered}
                                selected={selected} />
                            <SelectSimpson
                                options={state.filtered}
                                value={selected}
                                labels={s => s.name.model}
                                keys={s => s.id} />
                        </fieldset>
                    ) : undefined
                }
                {
                    state.filtered.length && state.selected ? (
                        <fieldset>
                            <legend>Simpson</legend>
                            <SimpsonEditor simpson={state.selected!} />
                        </fieldset>
                    ) : undefined
                }
            </div>
        );
    }
}
