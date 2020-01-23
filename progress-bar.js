'use strict';

const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin, 
	output: process.stdout
});

function progressBar(barLength, percent) {
	let onePart = barLength / 100.0;
	percent = Math.floor(percent);
	let percentStr;
	if (percent < 10)
		percentStr = ' ' + percent;
	else
		percentStr = percent;
	let str = "Current progress: " + percentStr + "%";
	str += '[';
	let progress = '='.repeat((percent)*onePart) + '>';
	progress += '-'.repeat(barLength - (progress.length - 1));
	str += progress + ']';
	return str;
}

function drawProgressBar(percent){
	let barLength = process.stdout.columns - 30;
	
	readline.clearLine(rl, 0);
	readline.cursorTo(rl, 0);
	rl.write(progressBar(barLength, percent));
}

exports.draw = drawProgressBar;