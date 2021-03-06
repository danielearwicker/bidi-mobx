import { observable, computed } from "mobx";
//import { MappedArray } from "mapped-array-mobx";

import data from "./data";
import TagState from "./TagState";
import Simpson from "./Simpson";

function overlapping<T>(a: T[], b: T[]) {
    return a.some(fromA => b.some(fromB => fromA == fromB));
}

export default class ViewState {
    
    @observable simpsons = data.map((s, i) => new Simpson(i + "", s.name, s.age, s.tags));
    @observable selected = new Simpson("", "(None)", 0, []);

    @computed get allTagNames() {        
        const result: { [name: string]: boolean } = {};
        for (const s of this.simpsons) {
            for (const t of s.tags.model) {
                result[t] = true;
            }
        }
        return Object.keys(result).sort();
    }

    tagCache: { [name: string]: TagState } = {};

    getTagState(name: string) {
        return this.tagCache[name] || (this.tagCache[name] = new TagState(name));
    }

    @computed get allTags() {
        return this.allTagNames.map(name => this.getTagState(name));
    }

    @computed get selectedTags() {
        return this.allTags.filter(t => t.checked).map(t => t.name);
    }

    @computed get filtered() {
        return this.simpsons.filter(s => overlapping(this.selectedTags, s.tags.model));
    }
}
