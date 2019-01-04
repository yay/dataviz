export class ParentClass {
    static defaults = {
        surname: 'Kravchenko'
    } as any;
}

export class ChildClass extends ParentClass {
    static defaults = Object.assign(
        Object.create(ParentClass.defaults),
        {
            name: 'Vitaly'
        }
    );

    static defaults1 = chainObjects(ParentClass.defaults, {
        name: 'Vitaly'
    });

    static defaults2 = chainObjects2(ParentClass.defaults, {
        name: 'Vitaly'
    });
}

export class ChildClass2 extends ParentClass {
    static defaults = {
        name: 'Vitaly',
        ...ParentClass.defaults
    };
}

function chainObjects(parent: any, child: any): any {
    return Object.assign(Object.create(parent), child);
}

function chainObjects2(parent: any, child: any): any {
    // The body of this function is equivalent to this ES6 version:
    //
    //     return Object.assign(Object.create(parent), child);
    //
    const obj = Object.create(parent);
    for (const prop in child) {
        if (child.hasOwnProperty(prop)) {
            obj[prop] = child[prop];
        }
    }
    return obj;
}

console.log(ChildClass.defaults.name);
console.log(ChildClass.defaults.surname);
console.log(ChildClass2.defaults.surname);
console.log(ChildClass.defaults.hasOwnProperty('surname')); // false
console.log(ChildClass2.defaults.hasOwnProperty('surname')); // true
