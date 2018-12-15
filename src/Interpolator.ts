import {Path} from "./Path";

// interface Interpolator {
//     /**
//      * Normalizes the `a` and `b` to a common form.
//      * For example, there may be many different representations
//      * of a color, but if we want to animate between two colors,
//      * we want to make sure both are in the same format before
//      * we can {@link compute} their intermediate value (which
//      * in this case could be an array of four color components).
//      * Instead of normalizing a single value, the method takes
//      * two values and returns a tuple of two normalized values,
//      * because the nature of the relationship may be meaningful
//      * for normalization. Some values don't have to be normalized,
//      * so this method is optional.
//      * @param a
//      * @param b
//      */
//     normalize?(a: any, b: any): [any, any];
//
//     /**
//      * Given `a` and `b`, computes their intermediate value based
//      * on `t`, where t is normally in the [0, 1] interval, but
//      * is also allowed to overshoot it.
//      * @param a
//      * @param b
//      * @param t
//      */
//     compute(a: any, b: any, t: number): any;
//
//     /**
//      * If the intermediate value produced by the {@link compute} method
//      * can't be used directly, this method should be defined and will
//      * be used to convert the computed value to a usable form.
//      * @param value
//      */
//     serve?(value: any): any;
// }

function interpolate(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export const array = {
    compute(A: number[], B: number[], t: number): number[] {
        const lastAi = A.length - 1;
        const lastBi = B.length - 1;
        const n = Math.max(lastAi, lastBi) + 1;
        const result = [];

        for (let i = 0; i < n; i++) {
            let a = A[Math.min(i, lastAi)];
            let b = B[Math.min(i, lastBi)];

            if (!isFinite(b)) {
                b = 0;
            }

            if (isFinite(a)) {
                result[i] = a + (b - a) * t;
            } else {
                result[i] = b;
            }
        }

        return result;
    }
};

type ColorComponents = [number, number, number, number];

export const color = {
    compute(a: ColorComponents, b: ColorComponents, t: number): ColorComponents {
        return [
            interpolate(a[0], b[0], t),
            interpolate(a[1], b[1], t),
            interpolate(a[2], b[2], t),
            interpolate(a[3], b[3], t)
        ];
    }
};

export type PathCoords = {x: number[], y: number[]};

function findClosestPoint(x: number, y: number, cubic: number[]): number {
    const n = cubic.length;
    let minDistance = Infinity;
    let index = -1;

    // Only measure distances to the starting points of each Bezier segment.
    // `cubic` contains alternating x/y components and we are skipping 3 points at a time.
    for (let i = 0; i < n; i += 6) {
        const dx = cubic[i    ] - x;
        const dy = cubic[i + 1] - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (minDistance > distance) {
            minDistance = distance;
            index = i;
        }
    }

    return index;
}

export const path = {
    // Handles only simple paths (with one sub-path) at the moment.
    normalize(a: string | Path, b: string | Path): [PathCoords, PathCoords] {
        if (typeof a === 'string') {
            a = Path.fromString(a);
        }
        if (typeof b === 'string') {
            b = Path.fromString(b);
        }
        const aCubic: number[] = a.toCubicPaths()[0];
        const bCubic: number[] = b.toCubicPaths()[0];

        let ax: number[] = [];
        let ay: number[] = [];
        let bx: number[] = [];
        let by: number[] = [];

        aCubic.forEach((value, index) => {
            index % 2 === 0 ? ax.push(value) : ay.push(value);
        });
        bCubic.forEach((value, index) => {
            index % 2 === 0 ? bx.push(value) : by.push(value);
        });

        return [{x: ax, y: ay}, {x: bx, y: by}];
    },
    compute(a: PathCoords, b: PathCoords, t: number): PathCoords {
        const x: number[] = array.compute(a.x, b.x, t);
        const y: number[] = array.compute(a.y, b.y, t);
        return { x, y };
    },
    serve(coords: PathCoords): string {
        const x: number[] = coords.x;
        const y: number[] = coords.y;
        const xy: number[] = [];
        const n = x.length;
        for (let i = 0; i < n; i++) {
            xy.push(x[i], y[i]);
        }
        return Path.cubicPathToString(xy);
    }
};
