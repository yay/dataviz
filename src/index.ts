import Path from './Path';
import { timeParse } from 'd3-time-format';
import * as d3 from 'd3';
import TimeValueChart from './TimeValueChart';
import { array as arrayInterpolator } from './Interpolator';

document.addEventListener('DOMContentLoaded', main);

function csvToJson(text: string): any[] {
    const rows = [];
    const lines = text.split('\n');
    const columns = lines.shift()!.split(',')
        .map(name => {
            // transform names like 'Adj Close' to 'adjClose'
            name = name.split(' ').join('');
            return name[0].toLowerCase() + name.slice(1);
        });
    const columnCount = columns.length;
    for (const line of lines) {
        const cells = line.split(',');
        const row: any = {};
        for (let i = 0; i < columnCount; i++) {
            row[columns[i]] = cells[i];
        }
        rows.push(row);
    }
    return rows;
}

type DatePrice = {date: Date, price: number};
const parseTime = timeParse('%Y-%m-%d');

function main() {
    fetch('../data/gold.csv')
        .then(response => response.text())
        .then(text => csvToJson(text))
        .then(json => {
            json.forEach(record => {
                record.date = parseTime(record.date);
                record.price = parseFloat(record.price);
            });
            return <DatePrice[]>json;
        })
        .then(onDataReady);
}

function onDataReady(records: DatePrice[]) {
    const chart = new TimeValueChart();
    chart.title = '1 ounce of gold (USD)';
    chart.xField = 'date';
    chart.yField = 'price';
    chart.data = records;

    const button = document.createElement('button');
    button.innerText = 'Change data set';
    document.body.appendChild(button);
    document.body.appendChild(document.createElement('br'));
    button.onclick = () => {
        fetch('../data/AAPL.csv')
            .then(response => response.text())
            .then(text => csvToJson(text))
            .then(json => {
                json.forEach(row => {
                    row.date = parseTime(row.date);
                    row.close = parseFloat(row.close);
                });
                return <{date: Date, close: number}[]>json;
            })
            .then(records => {
                chart.title = "Apple's stock price";
                chart.xField = 'date';
                chart.yField = 'close';
                chart.data = records;
            });
    };

    setupD3Morph();
    setupCustomMorph();
    setupCubicMorph();
    setupCustomCubicMorph();
    setupReverseCustomCubicMorph();
}

const shapes = {
    circle: 'M233.652,44.215c58.786,-0.147 106.513,47.727 106.513,106.512c0,58.786 -47.727,106.513 -106.513,106.513c-58.785,0 -106.512,-47.727 -106.512,-106.513c0,-58.785 47.8,-106.366 106.512,-106.512Z',
    squareStar: 'M262.602,50.377l57.52,41.791l-28.76,39.585l46.535,15.12l-21.971,67.618l-46.535,-15.12l0,48.93l-71.098,0l0,-48.93l-46.535,15.12l-21.971,-67.618l46.535,-15.12l-28.76,-39.585l57.52,-41.791l28.76,39.585l28.76,-39.585Z',
    heart: 'M233.28,102.888c20.1,-38.191 60.301,-38.191 80.401,-19.095c20.101,19.095 20.101,57.286 0,95.476c-14.07,28.643 -50.25,57.286 -80.401,76.381c-30.15,-19.095 -66.331,-47.738 -80.401,-76.381c-20.1,-38.19 -20.1,-76.381 0,-95.476c20.1,-19.096 60.301,-19.096 80.401,19.095Z'
};
const shapeStyle = 'fill:none; stroke:#000; stroke-width:2px;';

// Standard D3 transition.
function setupD3Morph() {
    const svg = d3.select(document.body).append('svg')
        .attr('width', 600)
        .attr('height', 400);
    const g = svg.append('g');
    g.append('path')
        .attr('d', shapes.heart)
        .attr('style', shapeStyle)
        .transition()
        .delay(1000)
        .duration(2000)
        .attr('d', shapes.squareStar);
}

// Convert the path to use only M, L, C, Z commands (no relative commands).
function setupCustomMorph() {
    const heartPath = Path.fromString(shapes.heart);
    const squareStarPath = Path.fromString(shapes.squareStar);

    d3.scaleLinear();

    const svg = d3.select(document.body).append('svg')
        .attr('width', 600)
        .attr('height', 400);
    const g = svg.append('g');
    g.append('path')
        .attr('d', heartPath.toString())
        .attr('style', shapeStyle)
        .transition()
        .delay(1000)
        .duration(2000)
        .attr('d', squareStarPath.toString());
}

// Convert the path to use only (absolute) cubic curves.
function setupCubicMorph() {
    const heartPath = Path.cubicPathToString(
        Path.fromString(shapes.heart).toCubicPaths()[0]
    );
    const squareStarPath = Path.cubicPathToString(
        Path.fromString(shapes.squareStar).toCubicPaths()[0]
    );

    d3.scaleLinear();

    const svg = d3.select(document.body).append('svg')
        .attr('width', 600)
        .attr('height', 400);
    const g = svg.append('g');
    g.append('path')
        .attr('d', heartPath)
        .attr('style', shapeStyle)
        .transition()
        .delay(1000)
        .duration(2000)
        .attr('d', squareStarPath);
}

// As the above example, but with custom path interpolator.
function setupCustomCubicMorph() {
    const cubicHeartPath = Path.fromString(shapes.heart).toCubicPaths()[0];
    const cubicSquareStarPath = Path.fromString(shapes.squareStar).toCubicPaths()[0];

    d3.scaleLinear();

    const svg = d3.select(document.body).append('svg')
        .attr('width', 600)
        .attr('height', 400);
    const g = svg.append('g');
    g.append('path')
        .attr('d', Path.cubicPathToString(cubicHeartPath))
        .attr('style', shapeStyle)
        .transition()
        .delay(1000)
        .duration(7000)
        .attrTween('d', () => {
            let ax: number[] = [];
            let ay: number[] = [];
            let bx: number[] = [];
            let by: number[] = [];
            cubicHeartPath.forEach((value, index) => {
                index % 2 === 0 ? ax.push(value) : ay.push(value);
            });
            cubicSquareStarPath.forEach((value, index) => {
                index % 2 === 0 ? bx.push(value) : by.push(value);
            });
            return (t: number) => {
                const x: number[] = arrayInterpolator.compute(ax, bx, t);
                const y: number[] = arrayInterpolator.compute(ay, by, t);
                const xy: number[] = [];
                x.forEach((value, index) => {
                    xy.push(value, y[index]);
                });
                return Path.cubicPathToString(xy);
            };
        });
}

function setupReverseCustomCubicMorph() {
    const cubicHeartPath = Path.fromString(shapes.heart).toCubicPaths()[0];
    const cubicSquareStarPath = Path.fromString(shapes.squareStar).toCubicPaths()[0];

    d3.scaleLinear();

    const svg = d3.select(document.body).append('svg')
        .attr('width', 600)
        .attr('height', 400);
    const g = svg.append('g');
    g.append('path')
        .attr('d', Path.cubicPathToString(cubicSquareStarPath))
        .attr('style', shapeStyle)
        .transition()
        .delay(1000)
        .duration(7000)
        .attrTween('d', () => {
            let ax: number[] = [];
            let ay: number[] = [];
            let bx: number[] = [];
            let by: number[] = [];
            cubicSquareStarPath.forEach((value, index) => {
                index % 2 === 0 ? ax.push(value) : ay.push(value);
            });
            cubicHeartPath.forEach((value, index) => {
                index % 2 === 0 ? bx.push(value) : by.push(value);
            });
            return (t: number) => {
                const x: number[] = arrayInterpolator.compute(ax, bx, t);
                const y: number[] = arrayInterpolator.compute(ay, by, t);
                const xy: number[] = [];
                x.forEach((value, index) => {
                    xy.push(value, y[index]);
                });
                return Path.cubicPathToString(xy);
            };
        });
}