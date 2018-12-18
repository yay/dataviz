export class FpsCounter {
    constructor(parent?: HTMLElement) {
        if (parent) {
            const el = document.createElement('div');
            el.style.position = 'absolute';
            el.style.left = '0px';
            el.style.top = '0px';
            el.style.opacity = '0.8';
            el.style.padding = '5px';
            el.style.color = 'black';
            el.style.backgroundColor = 'white';

            parent.appendChild(el);
            this.fpsElement = el;
        }
    }

    private fps = 0;
    private start = performance.now();
    private minFps = Infinity;
    private maxFps = 0;
    private readonly fpsElement?: HTMLElement;

    countFrame() {
        const now = performance.now();
        const fps = this.fps++;
        if (now - this.start > 1000) {
            if (fps > this.maxFps) {
                this.maxFps = fps;
            }
            if (fps < this.minFps) {
                this.minFps = fps;
            }
            if (this.fpsElement) {
                this.fpsElement.innerText = `FPS: ${fps}\nMin: ${this.minFps}\nMax: ${this.maxFps}`;
            } else {
                console.log(`FPS: ${fps}, Min: ${this.minFps}, Max: ${this.maxFps}`);
            }

            this.fps = 0;
            this.start = now;
        }
    }
}
