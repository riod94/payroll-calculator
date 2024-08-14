export default class MapArrayObject {
    [key: string]: any;

    constructor(...args: any[]) {
        if (args.length > 0) {
            Object.assign(this, ...args);
        }

        return this;
    }

    set(name: string, value: any): any {
        this[name] = value;
        return value;
    }

    get(name: string): any {
        return this[name] || null;
    }

    toArray() {
        return Object.values(this);
    }

    keys() {
        return Object.keys(this);
    }

    values() {
        return Object.values(this);
    }

    toString() {
        return this.values().join(' ');
    }

    keyToString() {
        return this.keys().join(' ');
    }

    count() {
        return this.values().length;
    }

    sum() {
        return this.values().reduce((acc: number, curr: number) => acc + curr, 0);
    }
}
