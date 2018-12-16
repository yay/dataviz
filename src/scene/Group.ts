import {Node} from "./Node";

export class Group extends Node {
    render(ctx: CanvasRenderingContext2D) {
        // stable sort by the zIndex before we do this
        this.children.forEach(child => {
            child.render(ctx);
        });
    }
}
