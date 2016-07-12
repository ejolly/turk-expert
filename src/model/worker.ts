class Turker {
    WorkerId: string;
    name: string;
    //conditional
    age: number;
    gender: string;
    email: string;
    address: string;

    constructor(id: string, name:string) {
        this.WorkerId = id;
        this.name = name;
    }
}


//test
let turker = new Turker('WorkerId-AD20WXZZP9XXK','A Turker');
console.log('TEST Model - Turker: ', turker);

