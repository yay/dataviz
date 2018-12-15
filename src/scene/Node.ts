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
}
