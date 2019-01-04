export function chainObjects<P extends object | null, C extends object>(parent: P, child: C): P & C {
    // The body of this function is equivalent to this ES6 version:
    //
    //     return Object.assign(Object.create(parent), child);
    //
    const obj = Object.create(parent) as P;
    for (const prop in child) {
        if (child.hasOwnProperty(prop)) {
            (obj as any)[prop] = child[prop];
        }
    }
    return obj as P & C;
}
