import {Scene} from "./Scene";

export abstract class Node { // window.Node already exists
    _scene?: Scene;
    set scene(value: Scene | undefined) {
        this._scene = value;
    }
    get scene(): Scene | undefined {
        return this._scene;
    }

    _parent?: Node;
    set parent(value: Node | undefined) {
        this._parent = value;
    }
    get parent(): Node | undefined {
        return this._parent;
    }

    _children: Node[] = [];
    get children(): Node[] {
        return this._children;
    }

    // Used to check for duplicate nodes.
    private childSet = new Set<Node>();

    add(node: Node) {
        if (!this.childSet.has(node)) {
            this._children.push(node);
            this.childSet.add(node);
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        // stable sort by the zIndex before we do this
        this._children.forEach(child => {
            child.render(ctx);
        });
    }

    zIndex: number = 0;

    _dirty = false;
    set dirty(dirty: boolean) {
        this._dirty = dirty;
        if (dirty && this.scene) {
            this.scene.dirty = true;
        }
    }
    get dirty(): boolean {
        return this._dirty;
    }

    /*

    DOMMatrix !== SVGMatrix but
    DOMMatrix.constructor === SVGMatrix.constructor

    This works in Chrome and Safari:

    const p1 = new Path2D();
    const p2 = new Path2D();
    const m = new DOMMatrix();
    p1.addPath(p2, m);

    Firefox - TypeError: Argument 2 of Path2D.addPath does not implement interface SVGMatrix.
    Edge - doesn't have DOMMatrix.
    IE11 - game over.

     */

    private static svg: SVGSVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    static createSvgMatrix(): SVGMatrix {
        return Node.svg.createSVGMatrix();
    }

    static createSvgMatrixFrom(a: number, b: number,
                               c: number, d: number,
                               e: number, f: number): SVGMatrix {
        const m = Node.svg.createSVGMatrix();
        m.a = a;
        m.b = b;
        m.c = c;
        m.d = d;
        m.e = e;
        m.f = f;
        return m;
    }

    static createDomMatrix(a: number, b: number,
                           c: number, d: number,
                           e: number, f: number): DOMMatrix {
        const m = new DOMMatrix();
        m.a = a;
        m.b = b;
        m.c = c;
        m.d = d;
        m.e = e;
        m.f = f;
        return m;
    }
}
