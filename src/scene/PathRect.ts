import {Shape} from "./Shape";

export class PathRect extends Shape {

    protected path = new Path2D();

    private _x: number = 0;
    set x(value: number) {
        this._x = value;
        this.dirty = true;
    }
    get x(): number {
        return this._x;
    }

    private _y: number = 0;
    set y(value: number) {
        this._y = value;
        this.dirty = true;
    }
    get y(): number {
        return this._y;
    }

    private _width: number = 10;
    set width(value: number) {
        this._width = value;
        this.dirty = true;
    }
    get width(): number {
        return this._width;
    }

    private _height: number = 10;
    set height(value: number) {
        this._height = value;
        this.dirty = true;
    }
    get height(): number {
        return this._height;
    }

    updatePath(): Path2D {
        const path = this.path = new Path2D(); // doesn't work in IE11
        path.moveTo(this.x, this.y);
        path.lineTo(this.x + this.width, this.y);
        path.lineTo(this.x + this.width, this.y + this.height);
        path.lineTo(this.x, this.y + this.height);
        path.closePath();
        const matrix = PathRect.createSvgMatrixFrom(2, 0, 0, 1, 20, 20);
        matrix.a = 2;
        matrix.e = 20;
        matrix.f = 20;
        const p2 = new Path2D();
        p2.moveTo(0, 0);
        p2.lineTo(50, 0);
        p2.lineTo(50, 50);
        p2.lineTo(0, 50);
        p2.closePath();
        path.addPath(p2, matrix);
        return path;
    }

    // Also see hit regions:
    // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Hit_regions_and_accessibility

    isPointInPath(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/isPointInPath
        // Hit testing is broken in Firefox 64 - mouse cursor has to be way into the shape
        // for it to detect either stroke or path hit.
        return ctx.isPointInPath(this.path, x, y);
    }

    isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/isPointInStroke
        return ctx.isPointInStroke(this.path, x, y);
    }

    render(ctx: CanvasRenderingContext2D): void {
        this.updatePath();
        this.applyContextAttributes(ctx);
        ctx.fill(this.path);
        ctx.stroke(this.path);

        this.dirty = false;
    }
}
