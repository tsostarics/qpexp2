# QP Experiment 2: Forced Choice Task

Change the condition by changing tthe `LATIN_COND` variable in `experiment.js`

## Custom jsPsych plugins

The `jspsych-audiobuttons-forcedchoice.js` file is a custom plugin I've written. It provides buttons to click on that play two different audio options, and then provides submit buttons at the bottom for users to select an option that they feel is most appropriate. There are safeguards in place that prevent users from playing multiple audio files at once, and users must listen to all options before submitting an answer. Audio files are preloaded at the beginning of the experiment for use with the WebAudio API. For some reason trying to use the HTML5 audio API (ie setting use webaudio to false) prevents the preloader from loading all the audio files.

Thanks to Hyoung Seok Kwon and Lisa Sullivan for their sound test.
