import {HdpiCanvas} from "../HdpiCanvas";
import {Node} from "./Node";
import {Path} from "../Path";
import {PathRect} from "./PathRect";

export class Scene {
    constructor(parent: HTMLElement, width = 800, height = 600) {
        this.hdpiCanvas = new HdpiCanvas(this._width = width, this._height = height);
        const canvas = this.hdpiCanvas.canvas;
        this.ctx = canvas.getContext('2d')!;
        parent.appendChild(canvas);
        this.setupListeners(canvas);
    }

    private readonly hdpiCanvas: HdpiCanvas;
    private readonly ctx: CanvasRenderingContext2D;

    private setupListeners(canvas: HTMLCanvasElement) {
        canvas.addEventListener('mousemove', this.onMouseMove);
    }

    private onMouseMove = (e: MouseEvent) => {
        const x = e.offsetX;
        const y = e.offsetY;

        if (this.root) {
            const rect = this.root as PathRect;
            if (rect.isPointInPath(this.ctx, x, y)) {
                rect.fillStyle = 'yellow';
            }
            else {
                rect.fillStyle = 'green';
            }

            if (rect.isPointInStroke(this.ctx, x, y)) {
                rect.strokeStyle = 'red';
            }
            else {
                rect.strokeStyle = 'blue';
            }
        }
    };

    _width: number;
    get width(): number {
        return this._width;
    }

    _height: number;
    get height(): number {
        return this._height;
    }

    set size(value: [number, number]) {
        this.hdpiCanvas.resize(...value);
        [this._width, this._height] = value;
    }

    _dirty = false;
    set dirty(dirty: boolean) {
        this._dirty = dirty;
        if (dirty) {
            requestAnimationFrame(this.render);
        }
    }
    get dirty(): boolean {
        return this._dirty;
    }

    _root?: Node;
    set root(node: Node | undefined) {
        this._root = node;
        if (node) {
            node.scene = this;
        }
        this.dirty = true;
    }
    get root(): Node | undefined {
        return this._root;
    }

    appendPath(path: Path) {
        const ctx = this.ctx;
        const commands = path.commands;
        const params = path.params;
        const n = commands.length;
        let j = 0;

        ctx.beginPath();
        for (let i = 0; i < n; i++) {
            switch (commands[i]) {
                case 'M':
                    ctx.moveTo(params[j++], params[j++]);
                    break;
                case 'L':
                    ctx.lineTo(params[j++], params[j++]);
                    break;
                case 'C':
                    ctx.bezierCurveTo(
                        params[j++], params[j++],
                        params[j++], params[j++],
                        params[j++], params[j++]
                    );
                    break;
                case 'Z':
                    ctx.closePath();
                    break;
            }
        }
    }

    render = () => {
        this.ctx.clearRect(0, 0, this.width, this.height);
        if (this.root) {
            this.root.render(this.ctx);
        }
        this.dirty = false;
    };

    // // Walk the tree depth first and hit test the leafs?
    // hitTest(x: number, y: number): Node | null {
    //     if (this.root) {
    //         const children = this.root.children;
    //         const n = children.length;
    //         for (let i = 0; i < n; i++) {
    //             const child = children[i];
    //             child.hitTest(x, y);
    //         }
    //     }
    // }
}
