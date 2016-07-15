class Turker {
    WorkerId: string;
    //conditional
    name: string;
    age: number;
    gender: string;
    email: string;
    address: string;

    constructor(id: string) {
        this.WorkerId = id;
        this.name = name;
    }
}


//test
let turker = new Turker('WorkerId-AD20WXZZP9XXK');
console.log('TEST Model - Turker: ', turker);

