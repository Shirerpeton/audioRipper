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
	-b/-batch batch mode (process all files in the input directory)";

const args = process.argv.slice(2);
var input, output, overallProgress = 0, auto = false;
for (let i = 0; i < args.length; i++) {
	switch (args[i]) {
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
	fs.readdirSync('./input/').forEach(fileName => {
		let file = { name: fileName, progress: 0, done: false };
		files.push(file);
	});
} else {
	let file = { name: input, progress: 0, done: false };
	files.push(file);
}

console.log('Files for processing: ');
for (let i = 0; i < files.length; i++) {
	console.log('#' + (i + 1) + ' ' + files[i].name);
}
console.log();

function ffprobePromise(file) {
	return new Promise((resolve, reject) => {
		ffmpeg.ffprobe(file, (err, metadata) => {
			if (err) reject(err);
			else resolve(metadata);
		});
	});
}

(async () => {
	try {
		for (let i = 0; i < files.length; i++) {
			input = files[i].name;
			if (!input) {
				console.log('You must specify input file!');
			} else {
				if (!output) {
					output = input.split('.').slice(0, -1).join();
				}
			}

			console.log('Input: ' + input);
			console.log('Output: ' + output + '.mp3');
			console.log();

			const metadata = (await ffprobePromise('./input/' + input)).streams;
			const audioStreams = metadata.filter(elem => elem.codec_type === 'audio');
			let query = ffmpeg('./input/' + input).format('mp3').audioBitrate('320k').noVideo();

			if (audioStreams.length === 1)
				query = query.output('./output/' + output + '.mp3');
			else
				for (let i = 0; i < audioStreams.length; i++) {
					query = query.output('./output/' + output + '-track:' + i + '.mp3').outputOptions('-map 0:a:' + i);
				}
			query = query
				.on('error', function (err) {
					console.log('An error occurred: ' + err.message);
				})
				.on('start', function () {
					console.log('Processing of file #' + (i + 1) + ' started!');
				})
				.on('progress', function (progress) {
					if (!auto)
						progressBar.draw(progress.percent);
					else {
						files[i].progress = Math.floor(progress.percent);
						const newProgress = getOverallProgress(files);
						if (overallProgress != newProgress) {
							overallProgress = newProgress;
							progressBar.draw(overallProgress);
						}
					}
				})
				.on('end', function () {
					files[i].done = true;
					let isProcessingFinished = true;
					for (let k = 0; k < files.length; k++) {
						if (files[k].done != true)
							isProcessingFinished = false;
					}
					if (isProcessingFinished)
						console.log('\nAll processing is finished!');
				});

			query.run();
			output = null;
		}
	} catch (err) {
		console.log(err);
	}
})()

function getOverallProgress(files) {
	let result = 0;
	for (let i = 0; i < files.length; i++) {
		result += files[i].progress / files.length;
	}
	return Math.floor(result);
}