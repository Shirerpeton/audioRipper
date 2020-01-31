# audioRipper
Simple node.js script that uses ffmpeg to extract audio in mp3 format from video files

Input video files should go into the directory named 'input', output audio files would be placed into the 'output' directory

FFmpeg should go into the directory named ffmpeg in the same folder as script.

Example use:
```
node app.js -i input_file.mp4 -o output_file.mp3
```
