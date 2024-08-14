import MapArrayObject from "../Traits/MapArrayObject";

export default class Company extends MapArrayObject {
    allowances: {
        BPJSKesehatan: number,
        JKK: number,
        JKM: number,
        JHT: number,
        JIP: number
    };

    constructor(company: Partial<Company> = {}) {
        super();
        this.allowances = {
            BPJSKesehatan: 0,
            JKK: 0,
            JKM: 0,
            JHT: 0,
            JIP: 0
        };
        Object.assign(this, company);
    }
}