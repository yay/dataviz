import AnimationQueue from './AnimationQueue';

type TimingFunction = (t: number) => number;

class Animation {
    _duration = 0;
    set duration(value: number) {
        this._duration = value;
    }
    get duration(): number {
        return this._duration;
    }

    _easing: TimingFunction = (t: number) => t
    set easing(value: TimingFunction) {
        this._easing = value;
    }
    get easing(): TimingFunction {
        return this._easing;
    }
}

export default {
    frameCallback() {

    }
};