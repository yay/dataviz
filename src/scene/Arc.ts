import {Shape} from "./Shape";
import {chainObjects} from "./Helpers";

export class Arc extends Shape {

    protected static defaults = chainObjects(Shape.defaults, {
        fillStyle: 'red',
        strokeStyle: 'black',
        x: 0,
        y: 0,
        radius: 10,
        startAngle: 0,
        endAngle: Math.PI * 2,
        anticlockwise: false
    });

    constructor() {
        super();
        this.fillStyle = Arc.defaults.fillStyle;
        this.strokeStyle = Arc.defaults.strokeStyle;
    }

    protected path = new Path2D();

    private _x: number = Arc.defaults.x;
    set x(value: number) {
        this._x = value;
        this.dirty = true;
    }
    get x(): number {
        return this._x;
    }

    private _y: number = Arc.defaults.y;
    set y(value: number) {
        this._y = value;
        this.dirty = true;
    }
    get y(): number {
        return this._y;
    }

    private _radius: number = Arc.defaults.radius;
    set radius(value: number) {
        this._radius = value;
        this.dirty = true;
    }
    get radius(): number {
        return this._radius;
    }

    private _startAngle: number = Arc.defaults.startAngle;
    set startAngle(value: number) {
        this._startAngle = value;
        this.dirty = true;
    }
    get startAngle(): number {
        return this._startAngle;
    }

    private _endAngle: number = Arc.defaults.endAngle;
    set endAngle(value: number) {
        this._endAngle = value;
        this.dirty = true;
    }
    get endAngle(): number {
        return this._endAngle;
    }

    private _anticlockwise: boolean = Arc.defaults.anticlockwise;
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
