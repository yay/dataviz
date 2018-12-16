import {Shape} from "./Shape";

export class Arc extends Shape {

    constructor() {
        super();
        this.fillStyle = 'red';
        this.strokeStyle = 'black';
    }

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

    private _radius: number = 10;
    set radius(value: number) {
        this._radius = value;
        this.dirty = true;
    }
    get radius(): number {
        return this._radius;
    }

    private _startAngle: number = 0;
    set startAngle(value: number) {
        this._startAngle = value;
        this.dirty = true;
    }
    get startAngle(): number {
        return this._startAngle;
    }

    private _endAngle: number = Math.PI * 2;
    set endAngle(value: number) {
        this._endAngle = value;
        this.dirty = true;
    }
    get endAngle(): number {
        return this._endAngle;
    }

    private _anticlockwise: boolean = false;
    set anticlockwise(value: boolean) {
        this._anticlockwise = value;
        this.dirty = true;
    }
    get anticlockwise(): boolean {
        return this._anticlockwise;
    }

    updatePath(): Path2D {
        const path = this.path = new Path2D();
        path.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle, this.anticlockwise);
        return path;
    }

    isPointInPath(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
        return ctx.isPointInPath(this.path, x, y);
    }

    isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean {
        return ctx.isPointInStroke(this.path, x, y);
    }

    render(ctx: CanvasRenderingContext2D): void {
        // About 15% performance loss for re-creating and retaining a Path2D
        // object for hit testing.
        this.updatePath();
        this.applyContextAttributes(ctx);
        ctx.fill(this.path);
        ctx.stroke(this.path);

        // this.applyContextAttributes(ctx);
        // ctx.beginPath();
        // ctx.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle, this.anticlockwise);
        // ctx.fill();
        // ctx.stroke();

        this.dirty = false;
    }
}
