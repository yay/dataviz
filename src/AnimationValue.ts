import Path from "./Path";

interface AnimationValue {
    /**
     * Normalizes the `a` and `b` to a common form.
     * For example, there may be many different representations
     * of a color, but if we want to animate between two colors,
     * we want to make sure both are in the same format before
     * we can {@link compute} their intermediate value (which
     * in this case could be an array of four color components).
     * Instead of normalizing a single value, the method takes
     * two values and returns a tuple of two normalized values,
     * because the nature of the relationship may be meaningful
     * for normalization. Some values don't have to be normalized,
     * so this method is optional.
     * @param a
     * @param b
     */
    normalize?(a: any, b: any): [any, any];

    /**
     * Given `a` and `b`, computes their intermediate value based
     * on `t`, where t is normally in the [0, 1] interval, but
     * is also allowed to overshoot it.
     * @param a
     * @param b
     * @param t
     */
    compute(a: any, b: any, t: number): any;

    /**
     * If the intermediate value produced by the {@link compute} method
     * can't be used directly, this method should be defined and will
     * be used to convert the value to a usable form.
     * @param value
     */
    serve?(value: any): any;
}

function interpolate(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export const array: AnimationValue = {
    compute(A: number[], B: number[], t: number): number[] {
        const lastAi = A.length - 1;
        const lastBi = B.length - 1;
        const outLength = Math.max(lastAi, lastBi) + 1;
        const out = [];

        for (let i = 0; i < outLength; i++) {
            let a = A[Math.min(i, lastAi)];
            let b = B[Math.min(i, lastBi)];

            if (!isFinite(b)) {
                b = 0;
            }

            if (isFinite(a)) {
                out[i] = a + (b - a) * t;
            } else {
                out[i] = b;
            }
        }

        return out;
    }
};

type ColorComponents = [number, number, number, number];

export const color: AnimationValue = {
    compute(a: ColorComponents, b: ColorComponents, t: number): ColorComponents {
        return [
            interpolate(a[0], b[0], t),
            interpolate(a[1], b[1], t),
            interpolate(a[2], b[2], t),
            interpolate(a[3], b[3], t)
        ];
    }
};

export const path: AnimationValue = {
    normalize(a: Path, b: Path): [number[][], number[][]] {
        const aCubics: number[][] = a.toCubicPaths();
        const bCubics: number[][] = a.toCubicPaths();
        const aCount = aCubics.length;
        const bCount = bCubics.length;

        return [aCubics, bCubics];
    },
    compute(a: number[][], b: number[][], t: number): number[][] {
        return [];
    }
};

export const values = {
    array,
    color,
    // path
};