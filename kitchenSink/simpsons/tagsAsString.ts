export default {
    render(value: string[]) { 
        return value.slice(0).sort().join(" "); 
    },
    parse(str: string) { 
        return { value: str.split(/\s+/).filter(s => s) }; }  
};

