/**
 * An easing is a timing function.
 * Normally, the time is represented by a parameter `t` that changes linearly
 * from 0 (animation start) to 1 (animation end), and the timing function is
 * an identity function, the simply returns the `t` it received.
 * But changing this default and returning different values for `t` allows
 * one to have discrete time, elastic time, accelerating/decelerating time
 * or even bouncing time. Generally, the output should still be within 0 to 1,
 * but can overshoot this rangle sligtly in either direction.
 */

type Easing = (t: number) => number;
type EasingMap = { [name: string]: Easing };

// Mimic these: https://easings.net/
const baseEasings: EasingMap = {
    elastic: t => Math.pow(2, --t * 10) * Math.cos(20 * t * Math.PI / 3),
    sine: t => 1 - Math.sin((1 - t) * Math.PI / 2),
    back: t => t * t * (2.616 * t - 1.616),
    circ: t => 1 - Math.sqrt(1 - t * t),
    expo: t => Math.pow(2, 8 * (t - 1)),
    bounce: t => {
        let a = 0;
        let b = 1;
        while (true) {
            if (t >= (7 - 4 * a) / 11) {
                const c = (11 - 6 * a - 11 * t) / 4;
                return b * b - c * c;
            }
            a += b;
            b /= 2;
        }
    }
};

['quad', 'cube', 'quart', 'quint'].forEach((name, index) => {
    baseEasings[name] = t => Math.pow(t, index + 2);
});

const easings: EasingMap = {
    linear: t => t
};

function generateInOutEasings(name: string, easing: Easing) {
    easings[name + 'In'] = easing;
    easings[name + 'Out'] = t => 1 - easing(1 - t);
    easings[name + 'InOut'] = t => t <= .5
        ? easing(2 * t) / 2
        : ( 2 - easing(2 * (1 - t)) ) / 2;
}

for (const name in baseEasings) {
    generateInOutEasings(name, baseEasings[name]);
}

Object.freeze(easings);

export default easings;