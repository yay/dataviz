function classDecorator<T extends {new(...args:any[]):{}}>(constructor:T) {
    return class extends constructor {
        newProperty = 'new property';
        hello = 'override';
    }
}

// @classDecorator // SyntaxError: Support for the experimental syntax 'decorators-legacy' isn't currently enabled
class Greeter {
    property = 'property';
    hello: string;
    constructor(m: string) {
        this.hello = m;
    }
}

console.log(new Greeter('world'));
console.log(new Greeter('earth'));

// _class2 {property: "property", hello: "override", newProperty: "new property"}
