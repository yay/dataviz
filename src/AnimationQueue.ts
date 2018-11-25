/**
 * Runs the added callbacks (with optional scope and arguments)
 * on every frame until they are removed or the whole animation queue is cleared.
 */
const AnimationQueue = {
    frameCallbackId: 0,
    startTime: Date.now(),
    queue: <IArguments[]>[],

    add(fn: {(): void}, scope?: any, args?: any[]) {
        this.queue.push(arguments);

        if (!this.frameCallbackId) {
            this.startTime = Date.now();
            this._frameCallback = this._frameCallback.bind(this);
            this.frameCallbackId = requestAnimationFrame(this._frameCallback);
        }
    },

    remove(fn: {(): void}, scope?: any, args?: any[]) {
        const queue = this.queue;
        const n = queue.length;

        for (let i = n - 1; i >= 0; i--) {
            const item = queue[i];
            if (item[0] === fn && item[1] === scope && item[2] === args) {
                queue.splice(i, 1);
            }
        }

        if (!queue.length) {
            cancelAnimationFrame(this.frameCallbackId);
            this.frameCallbackId = 0;
        }
    },

    clear() {
        cancelAnimationFrame(this.frameCallbackId);
        this.frameCallbackId = 0;
        this.queue.length = 0;
    },

    _frameCallback() {
        const now = Date.now();

        this.queue.slice().forEach(item => this._invoke(item));

        if (this.frameCallbackId) {
            this.frameCallbackId = requestAnimationFrame(this._frameCallback);
        }
    },

    _invoke(item: IArguments) {
        let fn: {(): void} | string = item[0];
        const scope: any = item[1];
        const args: any[] = item[2];

        if (scope && typeof fn === 'string') {
            fn = scope[fn];
        }
        if (typeof fn !== 'function') return;
        fn.apply(scope, args);
    }
};

export default AnimationQueue;