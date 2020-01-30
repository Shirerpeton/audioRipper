'use strict';

const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const progressBar = require('./progress-bar.js');

ffmpeg.setFfmpegPath('./ffmpeg/bin/ffmpeg.exe');
ffmpeg.setFfprobePath('./ffmpeg/bin/ffprobe.exe');

const help = "Help:\n\
	-i/-input + input video file name\n\
	-o/-output + output audio file name\n\
	-h/-help to get help\n\
	-b/-batch batch mode (process all the files in input directory)";

const args = process.argv.slice(2);
var input, output, auto = false;

for (let i=0; i < args.length; i++) {
	switch(args[i]) {
		case '-h':
		case '-help':
			console.log(help);
			return;
			break;
		case '-i':
		case '-input':
			i++;
			input = args[i]
			break;
		case '-o':
		case '-output':
			i++;
			output = args[i]
			break;
		case '-b':
		case '-batch':
			auto = true
			break;
		default:
			console.log('Use -h/-help for help');
			return;
			break;
	}
}

var files = [];

if (auto) {
	input = null;
	output = null;
	fs.readdirSync('./input/').forEach(file => {
		files.push(file);
	});
} else {
	files.push(input);
}

console.log('files: ');
console.log(files);
console.log(files[0]);
for (let i = 0; i < files.length; i++) {
	input = files[i];
	if (!input) {
		console.log('You must specify input file!');
	} else {
		if (!output) {
			output = input.split('.').slice(0, -1).join() + '.mp3';
		}
	}

	console.log('input: ' + input);
	console.log('output: ' + output);

	ffmpeg('./input/' + input).format('mp3').audioBitrate('320k').noVideo().output('./output/' + output)
		.on('error', function(err) {
			console.log('An error occurred: ' + err.message);
		})
		.on('start', function() {
			console.log('Processing started!');
		})
		.on('progress', function(progress) {
			if (!auto)
				progressBar.draw(progress.percent);
		})
		.on('end', function() {
			console.log('\nProcessing finished!');
		})
		.run();
	output = null;
}
return;