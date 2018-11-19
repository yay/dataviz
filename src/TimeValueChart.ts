import { scaleLinear, scaleTime } from 'd3-scale';
import { extent } from 'd3-array';
import { timeFormat } from 'd3-time-format';
import { format } from 'd3-format';
import { line } from 'd3-shape';
import * as axis from 'd3-axis';
// TODO: be explicit about imports (when done prototyping)
import * as d3 from 'd3';
import {BaseType} from 'd3';
import { runInThisContext } from 'vm';

type Padding = {
    top: number,
    right: number,
    bottom: number,
    left: number
};

// type SvgSelection = d3.Selection<SVGSVGElement, {}, HTMLElement, any>;
type SvgElementSelection = d3.Selection<SVGGElement, {}, null, any>;
type SvgPathSelection = d3.Selection<SVGPathElement, {}, null, any>;

export default class TimeValueChart {
    constructor(parent?: HTMLElement) {
        if (!parent) {
            parent = document.createElement('div');
            document.body.appendChild(parent);
        }

        this.svg = d3.select(parent).append('svg');
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

        this.updateCoreSize();
    }

    private svg: d3.Selection<SVGSVGElement, {}, null, undefined>;
    private group: SvgElementSelection;
    private titleSelection: d3.Selection<SVGTextElement, {}, null, any>;
    private xAxisGroup: SvgElementSelection;
    private yAxisGroup: SvgElementSelection;
    private linePath: d3.Selection<SVGPathElement, {}, null, any>;
    // private bisectDate = d3.bisector((datum: any) => datum[this._xField]).left;

    // crosshairLine(x1: number, y1: number, x2: number, y2: number) {
    //     return `M${x1},${y1}L${x2},${y2}`;
    // }

    set title(value: string) {
        this.titleSelection.text(value);
    }
    get title(): string {
        return this.titleSelection.text();
    }

    _data: any[] = [];
    set data(value: any[]) {
        this._data = value;
        this.coordinate();
        this.render();
    }

    _xField: string = 'time';
    set xField(value: string) {
        this._xField = value;
        // this.coordinate();
    }

    _yField: string = 'value';
    set yField(value: string) {
        this._yField = value;
        // this.coordinate();
    }

    _xFormat = timeFormat('%Y');
    _yFormat = format('.2f');

    private coreWidth: number = 0;
    private coreHeight: number = 0;

    private _width: number = 640;
    set width(value: number) {
        this._width = value;
        this.updateCoreSize();
    }

    private _height: number = 480;
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
            value = <Padding>value;
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
            const xDomain = <[Date, Date]>extent(this._data, d => <Date>d[xField]);
            const yDomain = <[number, number]>extent(this._data, d => <number>d[yField]);

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
        // const transition = d3.transition().duration(500);
        this.xAxisGroup
            .attr('transform', `translate(0,${this.coreHeight})`)
            .call(this._xAxis);
        this.yAxisGroup
            .call(this._yAxis);

        this.linePath
            .datum(this._data)
            .attr('d', this.lineGenerator)
            .call(<any>this.pathTransition);
    }
}