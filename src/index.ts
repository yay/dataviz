import Path from './Path';
import { timeParse } from 'd3-time-format';
import * as d3 from 'd3';
import TimeValueChart from './TimeValueChart';
import { path as pathInterpolator } from './Interpolator';
import * as topojson from 'topojson-client';
import topoUSA from '../data/topoUSA';
import topoGlobe from '../data/topoGlobe';
import * as canvas from './Canvas';

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
    // setupChart(records);
    // setupD3Morph();
    // setupCustomMorph();
    // setupCubicMorph();
    // setupCustomCubicMorph();
    // setupReverseCustomCubicMorph();
    // setupSliderMorph();
    setupGeoCanvas();
    setupGlobe();
}

function setupChart(records: DatePrice[]) {
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
}

const shapes = {
    circle: 'M233.652,44.215c58.786,-0.147 106.513,47.727 106.513,106.512c0,58.786 -47.727,106.513 -106.513,106.513c-58.785,0 -106.512,-47.727 -106.512,-106.513c0,-58.785 47.8,-106.366 106.512,-106.512Z',
    squareStar: 'M262.602,50.377l57.52,41.791l-28.76,39.585l46.535,15.12l-21.971,67.618l-46.535,-15.12l0,48.93l-71.098,0l0,-48.93l-46.535,15.12l-21.971,-67.618l46.535,-15.12l-28.76,-39.585l57.52,-41.791l28.76,39.585l28.76,-39.585Z',
    heart: 'M233.28,102.888c20.1,-38.191 60.301,-38.191 80.401,-19.095c20.101,19.095 20.101,57.286 0,95.476c-14.07,28.643 -50.25,57.286 -80.401,76.381c-30.15,-19.095 -66.331,-47.738 -80.401,-76.381c-20.1,-38.19 -20.1,-76.381 0,-95.476c20.1,-19.096 60.301,-19.096 80.401,19.095Z',
    superHeart: 'M233.28,102.888c9.639,-18.313 23.899,-27.845 38.349,-30.7c15.684,-3.1 31.59,1.666 42.052,11.605c11.753,11.164 16.634,28.855 14.644,49.258c-1.414,14.494 -6.295,30.356 -14.644,46.218c-7.1,14.454 -19.831,28.909 -34.576,42.136c-14.475,12.984 -30.89,24.786 -45.825,34.245c-13.898,-8.802 -29.078,-19.633 -42.783,-31.558c-16.025,-13.944 -30.034,-29.383 -37.618,-44.823c-8.146,-15.478 -12.991,-30.955 -14.534,-45.162c-2.265,-20.847 2.58,-38.958 14.534,-50.314c11.619,-11.039 29.955,-15.696 47.242,-10.284c12.619,3.95 24.678,13.265 33.159,29.379Z',
    bat: 'M230.194,246.244c-0.623,-11.287 -23.927,-15.846 -32.852,-37.743c-8.772,-21.521 -43.498,-40.749 -83.313,-35.418c-14.667,-25.533 -23.599,-33.552 -47.627,-34.755c-8.024,-17.207 -20.747,-17.987 -30.763,-24.651c8.273,-8.95 62.929,-25.252 106.876,-20.27c21.086,11.841 41.065,19.078 52.792,20.926c16.299,-15.299 18.298,-18.511 19.366,-25.465c0.896,-5.836 -3.448,-1.438 -6.912,-24.31c11.585,-0.511 24.7,16.885 53.472,-1.729c-1.929,20.845 -7.275,20.315 -7.249,26.738c0.026,6.316 1.275,7.554 17.78,26.124c10.608,-4.72 26.602,-13.533 48.062,-24.431c40.892,0.561 73.05,-3.129 120.443,20.267c-13.757,11.482 -29.796,2.653 -41.482,27.54c-24.415,3.578 -40.659,9.306 -56.675,34.835c-37.735,-6.477 -59.818,8.201 -73.335,34.29c-13.76,26.558 -31.348,27.959 -32.307,38.132c-0.944,10.003 -5.653,11.211 -6.276,-0.08Z',
    fancyBat: 'M329.612,49.325c-7.815,1.07 -15.48,3.908 -21.628,8.039c-10.502,7.018 -16.45,14.858 -25.634,33.723c-10.005,20.582 -12.095,24.315 -17.62,31.134c-2.141,2.638 -6.944,7.466 -9.457,9.507c-2.489,2.041 -7.143,4.928 -7.915,4.928c-0.149,0 -0.622,-0.697 -1.045,-1.568l-0.771,-1.543l0.024,-4.853c0.025,-3.46 -0.074,-5.426 -0.323,-6.82c-0.224,-1.07 -0.423,-2.015 -0.498,-2.065c-0.05,-0.05 -0.647,0.473 -1.294,1.194c-1.244,1.294 -4.206,3.808 -5.824,4.853c-0.896,0.598 -0.896,0.598 -2.862,0.2c-5.774,-1.145 -11.597,1.07 -15.405,5.823l-1.369,1.742l-2.19,0.199c-1.244,0.1 -3.435,0.05 -5.052,-0.099c-1.568,-0.125 -2.912,-0.199 -2.962,-0.149c-0.224,0.224 0.573,2.314 1.469,3.857c0.547,0.921 2.289,3.012 3.932,4.754c2.712,2.862 3.857,4.504 4.081,5.798c0.075,0.424 -0.124,0.523 -1.294,0.672c-2.812,0.423 -12.643,-0.149 -18.665,-1.07c-10.827,-1.667 -20.508,-4.728 -34.569,-10.975c-16.625,-7.367 -22.225,-9.159 -31.06,-9.905c-11.075,-0.946 -25.335,3.335 -34.494,10.378c-6.247,4.803 -8.512,7.64 -18.392,22.846c-5.45,8.388 -6.919,10.827 -8.636,14.286c-1.394,2.762 -3.111,6.968 -2.937,7.167c0.075,0.05 0.573,-0.174 1.095,-0.497c3.186,-2.016 7.691,-3.808 11.847,-4.704c2.091,-0.448 3.31,-0.548 6.894,-0.548c3.882,0.025 4.604,0.1 6.794,0.672c8.462,2.265 15.455,7.964 19.313,15.704c1.17,2.39 2.414,5.675 3.011,8.089l0.274,1.07l0.647,-0.572c0.348,-0.324 1.842,-2.066 3.31,-3.833c4.878,-5.898 7.964,-8.437 12.942,-10.577c5.126,-2.24 9.905,-3.236 15.43,-3.236c8.437,0 14.584,2.29 19.985,7.442c3.334,3.185 5.749,6.943 7.267,11.299c0.373,1.045 0.746,1.916 0.846,1.916c0.075,0 0.597,-0.871 1.12,-1.941c0.771,-1.469 1.543,-2.464 3.36,-4.306c6.595,-6.595 14.658,-9.781 23.668,-9.357c5.699,0.273 9.208,1.642 12.369,4.828c2.14,2.165 3.608,4.878 4.405,8.262l0.547,2.265l1.22,-1.792c2.464,-3.633 6.595,-7.068 10.303,-8.561c0.797,-0.324 2.34,-0.821 3.46,-1.12l1.991,-0.548l1.592,0.747c0.847,0.398 2.589,1.593 3.808,2.638c2.937,2.489 4.306,3.236 5.948,3.236c2.439,0 4.405,-1.369 5.102,-3.559c0.15,-0.473 0.423,-2.116 0.622,-3.609c0.573,-4.306 0.872,-4.928 3.485,-6.894c3.907,-2.937 8.362,-4.878 11.772,-5.102c2.439,-0.174 3.658,0.1 6.595,1.444c2.165,0.995 3.683,1.543 3.683,1.319c0,-0.05 -0.498,-0.996 -1.12,-2.066c-0.647,-1.07 -1.443,-2.762 -1.817,-3.783c-0.572,-1.618 -0.647,-2.215 -0.647,-5.077c-0.025,-2.887 0.05,-3.434 0.647,-5.052c0.896,-2.489 2.016,-4.256 4.007,-6.421c4.107,-4.405 9.93,-7.616 16.6,-9.084c2.165,-0.498 3.335,-0.597 6.72,-0.597c4.355,0 5.649,0.224 8.735,1.468c0.822,0.324 1.469,0.548 1.469,0.498c0,-0.025 -0.374,-0.846 -0.846,-1.767c-2.116,-4.231 -2.962,-8.636 -2.439,-13.041c1.12,-9.408 8.362,-18.691 18.591,-23.743c9.606,-4.754 18.615,-5.6 27.152,-2.514c0.97,0.349 1.842,0.647 1.941,0.647c0.075,0 -0.249,-0.771 -0.722,-1.742c-3.708,-7.341 -4.853,-15.306 -3.235,-22.274c1.867,-8.064 7.939,-15.505 15.978,-19.562c2.837,-1.418 6.794,-2.762 9.93,-3.359c1.219,-0.224 2.29,-0.498 2.389,-0.573c0.1,-0.074 -1.817,-0.97 -4.231,-1.991c-17.844,-7.491 -25.31,-10.005 -34.519,-11.622c-3.136,-0.548 -4.629,-0.672 -9.457,-0.747c-3.136,-0.025 -6.496,0.05 -7.441,0.174Z',
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
    const svg = d3.select(document.body).append('svg')
        .attr('width', 600)
        .attr('height', 400);
    const g = svg.append('g');
    g.append('path')
        .attr('d', shapes.heart)
        .attr('style', shapeStyle)
        .transition()
        .delay(1000)
        .duration(7000)
        .attrTween('d', () => {
            const [a, b] = pathInterpolator.normalize(
                shapes.heart,
                shapes.squareStar
            );
            return (t: number) => {
                const value = pathInterpolator.compute(a, b, t);
                return pathInterpolator.serve(value);
            };
        });
}

function setupReverseCustomCubicMorph() {
    const svg = d3.select(document.body).append('svg')
        .attr('width', 600)
        .attr('height', 400);
    const g = svg.append('g');
    g.append('path')
        .attr('d', shapes.squareStar)
        .attr('style', shapeStyle)
        .transition()
        .delay(1000)
        .duration(7000)
        .attrTween('d', () => {
            const [a, b] = pathInterpolator.normalize(
                shapes.heart,
                shapes.squareStar
            );
            return (t: number) => {
                const value = pathInterpolator.compute(b, a, t);
                return pathInterpolator.serve(value);
            };
        });
}

function setupSliderMorph() {
    const svg = d3.select(document.body).append('svg')
        .attr('width', 600)
        .attr('height', 400);
    d3.select(document.body).append('br');
    const g = svg.append('g');
    const path = g.append('path')
        .attr('d', shapes.heart)
        .attr('style', shapeStyle);

    const [a, b] = pathInterpolator.normalize(shapes.heart, shapes.bat);

    function interpolate(t: number): string {
        const value = pathInterpolator.compute(a, b, t);
        return pathInterpolator.serve(value);
    }

    d3.select(document.body).append('input')
        .attr('type', 'range')
        .attr('value', 0)
        .attr('min', 0)
        .attr('max', 1)
        .attr('step', 0.002)
        .attr('style', 'width: 500px; margin-left: 30px;')
        .on('input', function () {
            path.attr('d', interpolate(+this.value));
        });
}

function setupGeoCanvas() {
    const geoCanvas = d3.select(document.body).append('canvas')
        .attr('width', 960)
        .attr('height', 600);
    canvas.setDevicePixelRatio(geoCanvas.node()!);
    const ctx = geoCanvas.node()!.getContext('2d')!;
    const path = d3.geoPath().context(ctx);

    ctx.beginPath();
    path(topojson.mesh(topoUSA));
    ctx.stroke();
}

function setupGlobe() {
    // Set the dimensions of the map
    let width  = 960,
        height = 480,
        speed = 1e-2;

    let globeCanvas = d3.select(document.body).append('canvas')
            .attr('width', 960)
            .attr('height', 600),
        ctx = globeCanvas.node()!.getContext('2d')!;

    canvas.setDevicePixelRatio(globeCanvas.node()!);

    // Create and configure a geographic projection
    let projection = d3.geoOrthographic()
        .scale(height / 2)
        .clipAngle(90)
        .translate([width / 2, height / 2])
        .precision(0.1);

    // Create and configure a path generator
    let pathGenerator = d3.geoPath()
        .projection(projection)
        .context(ctx);

    // Create and configure the graticule generator (one line every 20 degrees)
    let graticule = d3.geoGraticule();

    // Background
    ctx.fillStyle = '#ddd';
    ctx.fillRect(0, 0, width, height);

    // Rotate the globe
    d3.timer(function(elapsed) {

        projection.rotate([speed * elapsed, 30, 15]);

        // Canvas Drawing
        ctx.clearRect(0, 0, width, height);

        // Sphere
        ctx.beginPath();
        pathGenerator({type: 'Sphere'});
        ctx.strokeStyle = "#666";
        ctx.stroke();
        ctx.fillStyle = '#eee';
        ctx.fill();

        // Graticule
        ctx.beginPath();
        pathGenerator(graticule());
        ctx.strokeStyle = "#666";
        ctx.stroke();

        // Countries
        ctx.beginPath();
        pathGenerator(topoGlobe);
        ctx.fillStyle = "#999";
        ctx.fill();
    });
}