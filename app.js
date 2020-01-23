'use strict';

const ffmpeg = require('fluent-ffmpeg');

const progressBar = require('./progress-bar.js');

ffmpeg.setFfmpegPath('./ffmpeg/bin/ffmpeg.exe');
ffmpeg.setFfprobePath('./ffmpeg/bin/ffprobe.exe');

const help = "Help:\n\
	-i/-input + input video file name\n\
	-o/-output + output audio file name\n\
	-h/-help to get help";

const args = process.argv.slice(2);
var input, output;

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
		default:
			console.log('Use -h/-help for help');
			return;
			break;
	}
}

console.log('input: ' + input);
console.log('output: ' + output);

if (!input) {
	console.log('You must specify input file!');
	return;
}
if (!output) {
	console.log('You must specify output file!');
	return;
}

ffmpeg(input).format('mp3').audioBitrate('320k').noVideo().output(output)
	.on('error', function(err) {
		console.log('An error occurred: ' + err.message);
	})
	.on('start', function() {
		console.log('Processing started!');
	})
	.on('progress', function(progress) {
		progressBar.draw(progress.percent);
	})
	.on('end', function() {
		console.log('\nProcessing finished!');
		process.exit(0);
	})
	.run();
	
return;