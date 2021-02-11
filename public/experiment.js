// Lets us save data
function saveToFirebase(code, filedata){
  var ref = firebase.database().ref('users/' + code).set(filedata);
}

// Create our blank timeline
var exp_timeline = [];

// Get subject ID from URL parameters, generate a random number if unavailable
var subID = jsPsych.data.getURLVariable('PROLIFIC_PID');
if (typeof subID == 'undefined'){
  subID = String(Math.floor(Math.random() * 1000))
}
console.log(subID)

// Welcome screen to start
var welcome = {
  type: 'html-keyboard-response',
  stimulus: "<p>Welcome to our experiment! Press any key to continue.</p>",
  response_ends_trial: true
};
exp_timeline.push(welcome)


// // Display consent form held in external_page.html
var check_consent = function(elem) {
  if (document.getElementById('consent_checkbox').checked) {
    return true;
  }
  else {
    alert("If you wish to participate, you must check the box next to the statement 'I agree to participate in this study.'");
    return false;
  }
  return false;
};

// // Create consent trial
var consent = {
  type:'external-html',
  url: "consent_form.html",
  cont_btn: "start",
  check_fn: check_consent
};
exp_timeline.push(consent);

/*
Volume calibration screen
Credit to Hyoung Seok Kwon & Lisa Sullivan
*/
var sound_test = {
  type: 'instructions', 
  pages: [ '<audio id="testAudio"><source src="sound/test_audio.mp3" type="audio/mpeg"></audio><h1>Sound Test</h1><p>Please use headphones and test your sound by clicking the button below. You may click it multiple times to adjust your volume so you can hear it clearly.</p><button onclick="playSound()" type="button" class="snd-btn"><img src="img/sound.jpg" alt="Click to test sound" /></button>' ], 
  show_clickable_nav: true,
  button_label: "Next",
};

// This function plays the sound in the sound check
function playSound(){
	var x = document.getElementById("testAudio");
	x.play();
}

exp_timeline.push(sound_test);

// Answer choices for the demographics survey
var yn_scale = ["Yes","No"]
var gender_scale = ["Male","Female","Other"]

// Multiple Choice questions
var demographics_1 = {
  type: 'survey-multi-choice',
  preamble: '<h1>Pre-experiment survey</h1>\n<p>Please answer the following questions. Your answers are for informational purposes and will not prevent you from participating.</p>',
  questions: [{prompt: 'Gender:', options: gender_scale, required:true, name: 'gender'},
    {prompt: 'Do you have any known hearing problem?', options: yn_scale, required: true, name: 'hearing'},
    {prompt: 'Do you have any known uncorrected vision problem?', options: yn_scale, required: true, name: 'vision'},
    {prompt: 'Do you have any known difficulty in reading?', options: yn_scale, required: true, name: 'reading'},
    {prompt: 'Do you speak any languages other than English?', options: yn_scale, required: true, name: 'other_langs'},
    {prompt: 'Was English the first language you learned?', options: yn_scale, required: true, name: 'eng_first'},
    {prompt: 'Do you have any musical training?', options: yn_scale, required: true, name: 'music'},
    {prompt: 'When you were learning English did you live in the United States?', options: yn_scale, required: true, name: 'america'}],
  button_label: "Next"
}

// Short answer questions
var demographics_2 = {
  type: 'survey-text',
  preamble: '<h1>Pre experiment survey</h1>\n<p>Please answer the following questions. Your answers are for informational purposes and will not prevent you from participating.</p>',
  questions: [{prompt: 'Age:', rows: 1, columns: 80, required:true, name:'age'},
    {prompt: 'If you said YES, you speak other languages, which language(s) and how many years?', rows: 1, columns: 80,name:'otherlangs'},
    {prompt: 'If you said YES, you have musical training, please list instrument(s), including voice, and number of  years of training:', rows:1, columns: 80, name:'instruments'},
    {prompt: 'At what age did you start speaking English?', rows:1, columns: 80, required:true, name:'ageofacquisition'},
    {prompt: 'Which country did you live in before the age of 12?',rows:1, columns: 80, required:true, name:'country'},
    {prompt: 'Please also give the state, region, or province:', rows:1, columns: 80, required:true, name: 'state'}
  ],
  button_label: "Next"
}

exp_timeline.push(demographics_1)
exp_timeline.push(demographics_2)

// Instructions for the experiment
var instructions = {
  type: 'html-button-response',
  stimulus: "<p>You will be listening to a series of conversations between a man and a woman. They have a close relationship with one another and value honesty.</p>" +
  "<p>Each conversation has two different endings. <b>Specifically, the endings will differ in the way the man responds to a question</b>. You will be asked to select which way sounds more appropriate given the context of the conversation.</p>" +
  "<p>On each trial, you will use buttons labeled \"Play Choice A\" and \"Play Choice B\" to hear the two different ways the man responds.</p>"+
  "<p>When you've listened to each of the choices, you will be asked to select the choice that sounds more appropriate using the buttons at the bottom labeled \"Select Choice A\" and \"Select Choice B\".</p>" +
  "<p>Each conversation is to be treated as completely independent from one trial to the next.</p>" +
  "<p>When you are ready to start, you may press the button below.</p>",
  choices: ['Ready to start'],
  on_finish: function(){
    jsPsych.setProgressBar(0);
  }
}

// Multiple choice quiz on the instructions
var inst_quiz = {
  type : 'quiz',
  questions: [
    {prompt: 'Which choice should you listen to on each trial?', options: ['Choice A', 'Choice B', 'Both Choices'], required:true, name: 'quiz1', correct:2},
    {prompt: 'In which way does each choice differ?', options: ['The topic of conversation', 'The word the man uses to respond.','The way the man responds.'], required: true, name: 'quiz2', correct:2},
    {prompt: 'On each trial you should select the option that:', options: ['Sounds more appropriate.','Sounds happier.', 'Sounds less appropriate.'], required:true, name: 'quiz3', correct:0},
    {prompt: 'Each conversation is independent from one trial to the next:', options: ['True','False'], required:true, name: 'quiz4', correct:0}
  ],
  button_label: 'Check Answers',
  preamble: '<h3>Understanding Check</h3>\n<p>This is a short quiz to check your understanding of the instructions. If you do not get all questions correct, you will be redirected back to the instructions to review and try again.</p><p> If all answers are correct you will proceed directly to the experiment questions.</p>',
  alert_incorrect: 2,
}

// Loop between the instructions and the quiz until they get the quiz answer right
// note: adds another row of data for every time they have to take the quiz
var looping_chunk = {
	chunk_type: 'while',
	timeline: [instructions, inst_quiz],
	loop_function: function(data){
    var should_proceed = data.values()[1].all_correct // look up if all answers were correct
    if(should_proceed=='true') { return false; }
		else { return true; }
	}
}
exp_timeline.push(looping_chunk)

// Begin experiment if they've passed the quiz
var lets_begin = {
  type: 'html-keyboard-response',
  stimulus: "<p>Thank you for reading the instructions carefully. Press any key to begin the experiment.</p>",
  response_ends_trial: true
};
exp_timeline.push(lets_begin)

// console.log(exp_timeline);

// Progress bar, increments by 2.5% each trial
var incr_val = 0.025;
var progress_counter = 0.00;

// arugula = {
// 	preamble: "<p><i>guess what i picked up from the farmers market</i></p><p><i>what did you get</i></p><p><i>take a guess</i></p><p><i>well you know i still can't eat leafy greens after i got food poisoning that one time so it can't be lettuce or kale what is it</i></p>",
//   aud_file: "sound/arugula_pre_1.wav",
//   prompt: "Please select the response that you felt was more appropriate given the conversation.",
// 	choices: [{label: "Choice A", aud_file: "sound/arugula_1.wav"}, {label: "Choice B", aud_file: "sound/arugula_2.wav"}],
//   submit_choices: [{label: "Choice A"}, {label: "Choice B"}],
//   word: "arugula",
// 	type: "critical"
// }

/*
This is the general container for each block of trials
will play an audio file and display a likert scale with 1 text box
*/
var trial_1 = {
  type: 'audiobuttons-forcedchoice',
  stimulus: jsPsych.timelineVariable('pre_aud'), //'sound/placeholder.wav', // 
  choices: jsPsych.timelineVariable('choices'),
  prompt: "Please select the response that you felt was more appropriate given the conversation.",
  submit_choices: [{label: "Select Choice A"}, {label: "Select Choice B"}],
  data: {
    block: 1,
    word: jsPsych.timelineVariable('word'),
    itemtype: jsPsych.timelineVariable('type')
  },  
  margin_horizontal: '150px',
  prompt_margin: '175px',
  submit_margin_vertical: '25px',
  preamble: jsPsych.timelineVariable('preamble'),
  on_finish: function(){
    progress_counter += incr_val
    jsPsych.setProgressBar(progress_counter);
    jsPsych.data.addProperties(additional_properties)
    saveToFirebase(subID, jsPsych.data.get().json());
  }
}

var trial_2 = {
  type: 'audiobuttons-forcedchoice',
  stimulus: jsPsych.timelineVariable('pre_aud'),//'sound/placeholder.wav', 
  choices: jsPsych.timelineVariable('choices'),
  prompt: "Please select the response that you felt was more appropriate given the conversation.",
  submit_choices: [{label: "Select Choice A"}, {label: "Select Choice B"}],
  data: {
    block: 2,
    word: jsPsych.timelineVariable('word'),
    itemtype: jsPsych.timelineVariable('type')
  },  
  margin_horizontal: '150px',
  prompt_margin: '175px',
  submit_margin_vertical: '25px',
  preamble: jsPsych.timelineVariable('preamble'),
  on_finish: function(){
    progress_counter += incr_val
    jsPsych.setProgressBar(progress_counter);
  }
}

/*
The stimuli for the different latin square groups are
hardcoded in separate js files. To change the list of
stimuli that participants see, change the LATIN_COND
every 10 participants. The switch statement will read in
the correct sets of stimuli, which will be manually shuffled
and passed to the media preloader later.
*/
var LATIN_COND = 1; // CHANGE THIS ON SUBSEQUENT DEPLOYMENTS
var block_1_stims = []
var block_2_stims = []

switch (LATIN_COND){
  case 1:
  block_1_stims = trial_set_1.concat(trial_set_5);
  block_2_stims = trial_set_3.concat(trial_set_6);
  break;
  case 2:
  block_1_stims = trial_set_2.concat(trial_set_5);
  block_2_stims = trial_set_4.concat(trial_set_6);
  break;
  case 3:
  block_1_stims = trial_set_3.concat(trial_set_6);
  block_2_stims = trial_set_1.concat(trial_set_5);
  break;
  case 4:
  block_1_stims = trial_set_4.concat(trial_set_6);
  block_2_stims = trial_set_2.concat(trial_set_5);
  break;
  default:
  throw "ERROR: INCORRECT LATIN SQUARE GROUP, MUST BE 1, 2, 3, OR 4"
  break;
}

 
// Get all of the audio file names to pass to the preloader
function get_aud_files(block){
  file_strings = []
  var stim;
  for (stim of block){
    file_strings.push(stim.pre_aud)
    stim.choices.forEach(ch => file_strings.push(ch.aud_file))
  }
  return file_strings
}

// // Pass filenames to preloader
var media_to_preload = get_aud_files(block_1_stims).concat('sound/placeholder.wav')
media_to_preload = media_to_preload.concat(get_aud_files(block_2_stims))
console.log(media_to_preload)
/* 
A function to randomize the order of our stimuli,
both blocks will use the same order of trials
so we'll create the order ourselves instead of
using the randomize_order feature.
*/
function randomize(item_num) {
  var ordering = [];
  for(var i = 0; i < item_num; i++){
    ordering.push(i)
  }
  while(ordering[0] < 12){
    ordering = jsPsych.randomization.shuffle(ordering);
  }
  console.log(ordering);
  return(ordering)
};

function manual_shuffle(ordering, stims) {
  var new_stim_list = [];
  for(var i = 0; i < ordering.length; i++){
    new_stim_list.push(stims[ordering[i]]);
  }
  return(new_stim_list);
};

// Shuffle the stimuli
stim_order = randomize(20);
block_1_stims = manual_shuffle(stim_order, block_1_stims);
block_2_stims = manual_shuffle(stim_order, block_2_stims);

// This is a pause between each block
var block_notice = {
  type: 'html-button-response',
  stimulus: '<p>You will now start the second block of trials.</p>'+
  '<p>Some of these might sound familiar, but remember that these are independent of any previous conversations.</p>',
  choices: ['Continue']
};


// //Here's where we link the trials to the stimuli for each block
var trial_loop_1 = {
  timeline : [trial_1],
  timeline_variables : block_1_stims
};

var trial_loop_2 = {
    timeline : [trial_2],
    timeline_variables : block_2_stims
};

exp_timeline.push(trial_loop_1);
exp_timeline.push(block_notice);
exp_timeline.push(trial_loop_2);

// Additional properties to add to every trial
var additional_properties = {
  subid: subID,
  condition: LATIN_COND
}

// Send data to firebase
var submit_block = {
  type: 'html-keyboard-response',
  stimulus: "<p></p>",
  trial_duration: 1,
  response_ends_trial: false,
  timing_post_trial: 0,
  on_finish: function() {
    jsPsych.data.addProperties(additional_properties)
    saveToFirebase(subID, jsPsych.data.get().json());
  }
}
exp_timeline.push(submit_block);

// Send user back to prolific by displaying redirect.html
var send_to_prolific = {
  type: 'external-html',
  url: 'redirect.html'
}
exp_timeline.push(send_to_prolific)
// jsPsych.pluginAPI.preloadAudioFiles(media_to_preload, function () {
//   done({ preload: "success" });
// })

// Run experiment
jsPsych.init({
  timeline: exp_timeline,
  use_webaudio: true, // note: if you set this to false the preloader will fail. idk why
  preload_audio: media_to_preload,
  show_progress_bar: true,
  auto_update_progress_bar: false, // manual progress bar updating
  show_preload_progress_bar: true, 
  on_finish: function() {
    //   saveData("experiment_data.csv", jsPsych.data.get().csv());
    jsPsych.data.displayData();
  },
  default_iti: 250,
  max_load_time: 120000,
  max_preload_attempts: 20,
});
