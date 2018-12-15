import {HdpiCanvas} from "../HdpiCanvas";
import {Node} from "./Node";
import {Path} from "../Path";

export class Scene {
    constructor(parent: HTMLElement, width = 800, height = 600) {
        this._width = width;
        this._height = height;
        this.hdpiCanvas = new HdpiCanvas(width, height);
        this.canvas = this.hdpiCanvas.canvas;
        this.ctx = this.canvas.getContext('2d')!;
        parent.appendChild(this.canvas);
    }

    private readonly hdpiCanvas: HdpiCanvas;
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;

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
        this.ctx.clearRect(0, 0, this.width + 1, this.height + 1);
        if (this.root) {
            this.root.render(this.ctx);
        }
    }
}
