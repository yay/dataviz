import Path from './Path';
import { timeParse } from 'd3-time-format';
import TimeValueChart from './TimeValueChart';

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

type DatePrice = {date: Date, price: number}[];
const parseTime = timeParse('%Y-%m-%d');

function main() {
    // const p = new Path();
    // p.moveTo(5, 5);
    // p.lineTo(20, 20);
    // console.log(p.toPrettyString());

    // d3.scaleLinear();

    fetch('../data/gold.csv')
        .then(response => response.text())
        .then(text => csvToJson(text))
        .then(json => {
            json.forEach(row => {
                row.date = parseTime(row.date);
                row.price = parseFloat(row.price);
            });
            return <DatePrice>json;
        })
        .then(onDataReady);
}

function onDataReady(rows: DatePrice) {
    // rows.forEach(row => console.log(row.price));

    const chart = new TimeValueChart();
    chart.title = '1 ounce of gold (USD)';
    chart.xField = 'date';
    chart.yField = 'price';
    chart.data = rows;

    const button = document.createElement('button');
    button.innerText = 'Change data set';
    document.body.appendChild(button);
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
            .then(rows => {
                chart.title = "Apple's stock price";
                chart.xField = 'date';
                chart.yField = 'close';
                chart.data = rows;
            });
    };
}
