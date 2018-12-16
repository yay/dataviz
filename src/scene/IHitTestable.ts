export interface IHitTestable {
    isPointInPath(ctx: CanvasRenderingContext2D, x: number, y: number): boolean
    isPointInStroke(ctx: CanvasRenderingContext2D, x: number, y: number): boolean
}
