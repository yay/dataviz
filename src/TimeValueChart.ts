import {ScaleContinuousNumeric, scaleLinear, scaleTime} from 'd3-scale';
import { extent } from 'd3-array';
import { timeFormat } from 'd3-time-format';
import { format } from 'd3-format';
import { line } from 'd3-shape';
import * as axis from 'd3-axis';
// TODO: be explicit about imports (when done prototyping)
import * as d3 from 'd3';
import {HdpiCanvas} from "./HdpiCanvas";

type Padding = {
    top: number,
    right: number,
    bottom: number,
    left: number
};

interface IRenderable {
    render(ctx: CanvasRenderingContext2D): void
}

abstract class Sprite implements IRenderable {
    // dirty = false;

    canvasAttributes = {
        fillStyle: 'red' as string | CanvasGradient | CanvasPattern,
        strokeStyle: 'black' as string | CanvasGradient | CanvasPattern,
        lineWidth: 2 as number,
        lineDash: [] as number[],
        lineCap: 'butt' as CanvasLineCap
    };

    render(ctx: CanvasRenderingContext2D) {
        for (const name in this.canvasAttributes) {
            (ctx as any)[name] = (this.canvasAttributes as any)[name];
        }
    }
}

class Circle extends Sprite {
    x = 0;
    y = 0;
    r = 5;

    render(ctx: CanvasRenderingContext2D) {
        super.render(ctx);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class Rect extends Sprite {
    // Coordinates of the center of the rectangle.
    x = 0;
    y = 0;
    width = 10;
    height = 10;

    render(ctx: CanvasRenderingContext2D) {
        super.render(ctx);
        const dx = this.width / 2;
        const dy = this.height / 2;
        ctx.beginPath();
        ctx.moveTo(this.x - dx, this.y - dy);
        ctx.lineTo(this.x + dx, this.y - dy);
        ctx.lineTo(this.x + dx, this.y + dy);
        ctx.lineTo(this.x - dx, this.y + dy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

class CartesianSeries implements IRenderable {
    xAxis?: axis.Axis<number | Date | { valueOf(): number }>;
    yAxis?: axis.Axis<number | Date | { valueOf(): number }>;
    xField = 'x';
    yField = 'y';

    data: any[] = [];

    chart?: TimeValueChart;

    constructor(chart: TimeValueChart) {
        this.chart = chart;
    }

    render(ctx: CanvasRenderingContext2D) {}
}

class ScatterSeries extends CartesianSeries {
    private instance = new Rect();

    constructor(chart: TimeValueChart) {
        super(chart);
        // this.instance.r = 3;
    }


    render(ctx: CanvasRenderingContext2D) {
        if (!this.chart) return;
        const data = this.chart.data;
        const x = this.xAxis!.scale();
        const y = this.yAxis!.scale();
        const xField = this.xField;
        const yField = this.yField;

        this.data.forEach(record => {
            let xValue: number = record[xField];
            let yValue: number = record[yField];
            let xCoord = x(xValue) || 0;
            let yCoord = y(yValue) || 0;

            this.instance.x = xCoord;
            this.instance.y = yCoord;
            this.instance.render(ctx);
        });
    }
}

type SvgSelection = d3.Selection<SVGSVGElement, {}, null, undefined>;
type SvgGroupSelection = d3.Selection<SVGGElement, {}, null, any>;
type SvgPathSelection = d3.Selection<SVGPathElement, {}, null, any>;
type SvgTextSelection = d3.Selection<SVGTextElement, {}, null, any>;

export default class TimeValueChart {

    series = new ScatterSeries(this);

    constructor(parent?: HTMLElement) {
        if (!parent) {
            parent = document.createElement('div');
            document.body.appendChild(parent);
        }

        this.svg = d3.select(parent).append('svg')
            .style('position', 'absolute');
        this.group = this.svg.append('g');
        this.titleSelection = this.svg.append('text')
            .attr('class', 'title')
            .style('text-anchor', 'middle')
            .style('dominant-baseline', 'middle');
        this.linePath = this.group.append('path')
            .attr('class', 'line');

        this.xAxisGroup = this.group.append('g')
            .attr('class', 'x axis');
        this.yAxisGroup = this.group.append('g')
            .attr('class', 'y axis');

        this.hdpiCanvas = new HdpiCanvas();
        this.hdpiCanvas.canvas.style.position = 'absolute';
        parent.appendChild(this.hdpiCanvas.canvas);
        this.canvas = d3.select(this.hdpiCanvas.canvas);
        this.ctx = this.hdpiCanvas.canvas.getContext('2d')!;

        this.series.xAxis = this._xAxis;
        this.series.yAxis = this._yAxis;

        this.updateCoreSize();
    }

    private hdpiCanvas: HdpiCanvas;
    private canvas: d3.Selection<HTMLCanvasElement, {}, null, any>;
    private readonly ctx: CanvasRenderingContext2D;

    private svg: SvgSelection;
    private group: SvgGroupSelection;
    private titleSelection: SvgTextSelection;
    private xAxisGroup: SvgGroupSelection;
    private yAxisGroup: SvgGroupSelection;
    private linePath: SvgPathSelection;

    set title(value: string) {
        this.titleSelection.text(value);
    }
    get title(): string {
        return this.titleSelection.text();
    }

    _data: any[] = [];
    set data(value: any[]) {
        this._data = value;
        this.series.data = value;
        this.coordinate();
        this.render();
    }
    get data(): any[] {
        return this._data;
    }

    _xField: string = 'time';
    set xField(value: string) {
        this._xField = value;
        this.series.xField = value;
        // this.coordinate();
    }

    _yField: string = 'value';
    set yField(value: string) {
        this._yField = value;
        this.series.yField = value;
        // this.coordinate();
    }

    _xFormat = timeFormat('%Y');
    _yFormat = format('.2f');

    private coreWidth: number = 0;
    private coreHeight: number = 0;

    private _width: number = 1200;
    set width(value: number) {
        this._width = value;
        this.updateCoreSize();
    }

    private _height: number = 800;
    set height(value: number) {
        this._height = value;
        this.updateCoreSize();
    }

    private _padding: Padding = {
        top: 40,
        right: 20,
        bottom: 40,
        left: 50
    };
    set padding(value: Padding | [number, number, number, number] | number) {
        if (typeof value === 'object') {
            const padding = this._padding;
            value = value as Padding;
            this._padding = {
                top: isFinite(value.top) ? value.top : padding.top,
                right: isFinite(value.right) ? value.right : padding.right,
                bottom: isFinite(value.bottom) ? value.bottom : padding.bottom,
                left: isFinite(value.left) ? value.left : padding.left
            };
        }
        else if (Array.isArray(value)) {
            this._padding = {
                top: value[0],
                right: value[1],
                bottom: value[2],
                left: value[3]
            };
        }
        else if (typeof value === 'number') {
            this._padding = {
                top: value,
                right: value,
                bottom: value,
                left: value
            };
        }
        this.updateCoreSize();
    }

    private updateCoreSize() {
        const padding = this._padding;

        this.coreWidth = this._width - padding.left - padding.right;
        this.coreHeight = this._height - padding.top - padding.bottom;
        this.xScale.range([0, this.coreWidth]);
        this.yScale.range([this.coreHeight, 0]);
        this.svg
            .attr('width', this._width)
            .attr('height', this._height);
        this.group.attr('transform', 'translate(' + this._padding.left + ',' + this._padding.top + ')');
        this.titleSelection
            .attr('x', this.coreWidth / 2)
            .attr('y', this._padding.top / 2);
        this._yAxis.tickSizeInner(-this.coreWidth);

        this.hdpiCanvas.resize(this._width, this._height);
        this.ctx.resetTransform();
        this.ctx.translate(this._padding.left, this._padding.top);

        this.render();
    }

    private xScale = scaleTime();
    private yScale = scaleLinear();

    _xAxis = axis.axisBottom(this.xScale);
    _yAxis = axis.axisLeft(this.yScale)
        .ticks(10, this._yFormat);

    private lineGenerator = line()
        .x((datum: any) => this.xScale(datum[this._xField]))
        .y((datum: any) => this.yScale(datum[this._yField]));

    coordinate() {
        if (this._xField && this._yField) {
            const xField = this._xField;
            const yField = this._yField;
            // TODO: check and throw if invalid
            const xDomain = extent(this._data, d => d[xField] as Date) as [Date, Date];
            const yDomain = extent(this._data, d => d[yField] as number) as [number, number];

            this.xScale.domain(xDomain).nice();
            this.yScale.domain(yDomain).nice();
        }
    }

    private pathTransition(path: SvgPathSelection) {
        path.transition()
            .duration(2000)
            .attrTween('stroke-dasharray', function () {
                const n = this.getTotalLength();
                const i = d3.interpolateString(`0,${n}`, `${n},${n}`);
                return t => i(t);
            });
    }

    render() {
        this.xAxisGroup
            .attr('transform', `translate(0,${this.coreHeight})`)
            .call(this._xAxis);
        this.yAxisGroup
            .call(this._yAxis);

        // this.linePath
        //     .datum(this._data)
        //     .attr('d', this.lineGenerator)
        //     .call(<any>this.pathTransition);

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this._width, this._height);



        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,0,0,0.3)';
        ctx.fillStyle = 'white';
        // ctx.setLineDash([3, 3]);
        const x = this.xScale;
        const y = this.yScale;
        const xField = this._xField;
        const yField = this._yField;
        ctx.beginPath();
        this._data.forEach((datum, index) => {
            ctx[index ? 'lineTo' : 'moveTo'](
                x(datum[xField]),
                y(datum[yField])
            );
        });
        ctx.stroke();

        this.series.render(ctx);
    }
}
