import Path from './Path';

const p = new Path();
p.moveTo(5, 5);
p.lineTo(20, 20);
console.log(p.toPrettyString());