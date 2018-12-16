import { Node } from "./Node";

export abstract class Shape extends Node {
    private _fillStyle: string = 'none'; //| CanvasGradient | CanvasPattern;
    set fillStyle(value: string) {
        this._fillStyle = value;
        this.dirty = true;
    }
    get fillStyle(): string {
        return this._fillStyle;
    }

    private _strokeStyle: string = 'none';
    set strokeStyle(value: string) {
        this._strokeStyle = value;
        this.dirty = true;
    }
    get strokeStyle(): string {
        return this._strokeStyle;
    }

    private _lineWidth: number = 1;
    set lineWidth(value: number) {
        this._lineWidth = value;
        this.dirty = true;
    }
    get lineWidth(): number {
        return this._lineWidth;
    }

    applyContextAttributes(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.fillStyle;
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
    }

    abstract isPointInPath(ctx: CanvasRenderingContext2D, x: number, y: number): boolean
    abstract isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean
}
