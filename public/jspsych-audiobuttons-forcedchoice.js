/**
* jspsych-audiobuttons-forcedchoice
* Thomas Sostarics
*
* plugin for playing an audio file, with buttons to hear followup audio stimuli, then a forced choice between some number of options
*
* documentation: docs.jspsych.org
*
**/

jsPsych.plugins["audiobuttons-forcedchoice"] = (function() {
    var plugin = {};
    
    jsPsych.pluginAPI.registerPreload('audiobuttons-forcedchoice', 'stimulus', 'audio');
    
    plugin.info = {
        name: 'audio-buttons',
        description: '',
        parameters: {
            // The overarching audio stimulus
            stimulus: {
                type: jsPsych.plugins.parameterType.AUDIO,
                pretty_name: 'Stimulus',
                default: undefined,
                description: 'The audio to be played.'
            },
            // The button choices (an array of {label, aud_file})
            choices: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Choices',
                default: undefined,
                array: true,
                description: 'The button labels.',
                nested:{
                    label: {
                        type: jsPsych.plugins.parameterType.STRING,
                        default: undefined,
                        description: 'The text to display on the button'
                    },
                    aud_file: {
                        type: jsPsych.plugins.parameterType.STRING,
                        default: undefined,
                        description: 'The audio file to be played on click'
                    }
                }
            },
            submit_choices: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Choices',
                default: undefined,
                array: true,
                description: 'The button labels.',
                nested:{
                    label: {
                        type: jsPsych.plugins.parameterType.STRING,
                        default: undefined,
                        description: 'The text to display on the button'
                    }
                }
            },
            // The display HTML for the buttons, shouldnt really be changed
            button_html: {
                type: jsPsych.plugins.parameterType.HTML_STRING,
                pretty_name: 'Button HTML',
                default: "<input type=\"button\" class=\"jspsych-btn\" value=\"%choice%\"></input>",
                array: true,
                description: 'Custom button. Can make your own style.'
            },
            // Text box preamble (top of page)
            preamble: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Preamble',
                default: null,
                description: 'HTML formatted string to display at the top of the page above all the questions.'
            },
            // Submit button label
            prompt: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button Instructions',
                default: null,
                description: 'Any content here will be displayed below the buttons.'
            },
            trial_duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Trial duration',
                default: null,
                description: 'The maximum duration to wait for a response.'
            },
            margin_vertical: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Margin vertical',
                default: '0px',
                description: 'Vertical margin of button.'
            },
            // This controls how spaced apart the buttons are
            margin_horizontal: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Margin horizontal',
                default: '200px',
                description: 'Horizontal margin of button.'
            },
            submit_margin_vertical: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Margin vertical',
                default: '0px',
                description: 'Vertical margin of button.'
            },
            // This controls how spaced apart the submit buttons are
            submit_margin_horizontal: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Margin horizontal',
                default: '50px',
                description: 'Horizontal margin of button.'
            },
            // This controls spacing between audio buttons and prompt
            prompt_margin: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Margin horizontal',
                default: '50px',
                description: 'Vertical margin of prompt.'
            },
            response_ends_trial: {
                type: jsPsych.plugins.parameterType.BOOL,
                pretty_name: 'Response ends trial',
                default: true,
                description: 'If true, the trial will end when user makes a response.'
            }
        }
    }
    
    plugin.trial = function(display_element, trial) {
        
        // setup stimulus
        var context = jsPsych.pluginAPI.audioContext();
        var something_playing = true;

        // Callback fx for when stimuli are done playing
        function updateEndStatus() {
            console.log('stim done playing')
            something_playing = false;
        }

        if(context !== null){
            var source = context.createBufferSource();
            source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
            source.connect(context.destination);
            source.onended = updateEndStatus;
        } else {
            var audio = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
            audio.currentTime = 0;
            using_audio = true;
        }

        
        
        // set up buttons
        var buttons = [];
        if (Array.isArray(trial.button_html)) {
            if (trial.button_html.length == trial.choices.length) {
                buttons = trial.button_html;
            } else {
                console.error('Error in image-button-response plugin. The length of the button_html array does not equal the length of the choices array');
            }
        } else {
            for (var i = 0; i < trial.choices.length; i++) {
                buttons.push(trial.button_html);
            }
        }
        var html = '';
        
        // show preamble text
        if(trial.preamble !== null){
            html += '<div id="jspsych-survey-text-preamble" class="jspsych-survey-text-preamble">'+trial.preamble+'</div>';
        }
        
        // Display audio buttons
        html += '<div id="jspsych-audio-button-response-btngroup">';
        for (var i = 0; i < trial.choices.length; i++) {
            var str = buttons[i].replace(/%choice%/g, trial.choices[i]['label']);
            var str = str.replace(/%aud_file%/g, trial.choices[i]['aud_file'])
            html += '<div class="jspsych-audio-button-response-button" style="cursor: pointer; display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-audio-button-response-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
        }
        html += '</div>';
        
        //show prompt if there is one
        
        if (trial.prompt !== null) {
            html += '<div class="forcedchoice-prompt-text" style="display: inline-block; margin-top:' + trial.prompt_margin + '" id = "prompt-text">'+ trial.prompt + '</div>'
        }
        
        //display answer submission buttons
        var submit_buttons = [];
        if (Array.isArray(trial.button_html)) {
            if (trial.button_html.length == trial.submit_choices.length) {
                submit_buttons = trial.button_html;
            } else {
                console.error('Error in image-button-response plugin. The length of the button_html array does not equal the length of the choices array');
            }
        } else {
            for (var i = 0; i < trial.submit_choices.length; i++) {
                submit_buttons.push(trial.button_html);
            }
        }
        html += '<div id="jspsych-image-button-response-btngroup">';
        
        for (var i = 0; i < trial.submit_choices.length; i++) {
            var str = submit_buttons[i].replace(/%choice%/g, trial.submit_choices[i]['label']);
            html += '<div class="jspsych-image-button-response-button" style="display: inline-block; margin:'+trial.submit_margin_vertical+' '+trial.submit_margin_horizontal+'" id="jspsych-image-button-response-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
        }
        html += '</div>';
        
        // display html
        display_element.innerHTML = html;
        
        // start timing
        var start_time = performance.now();
        
        // Link buttons to sound files
        // Set up array to hold sounds
        var button_sounds = [];
        
        // Click event handler helper function
        function playChoice(i){
                // Prevent users from playing audio while something is playing
                if(something_playing){
                    alert("Please wait until the audio has finished playing before playing another option.")
                    return undefined;
                } else{
                // AudioBufferSourceNodes have to be remade each time it plays (start() can only be used once)
                var choice_sound = context.createBufferSource();
                choice_sound.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.choices[i]['aud_file']);
                choice_sound.onended = updateEndStatus; // this will set something_playing to false when this is done playing
                choice_sound.connect(context.destination);
                something_playing = true;
                choice_sound.start(context.currentTime); 
                button_sounds[i]['clicks'] += 1;
            }
        }
        
        // Go through each (button) choice and link the aud_file to the button
        for (var i = 0; i < trial.choices.length; i++) {
            button_sounds.push({name: trial.choices[i]['aud_file'], clicks: 0});
    
            //playchoice.bind is what allows us to use the click handler with a parameter
            document.getElementById('jspsych-audio-button-response-button-'+i).addEventListener("click",playChoice.bind(null, i));
        }
        
        // Set event listeners for submission buttons
        for (var i = 0; i < trial.submit_choices.length; i++) {
            display_element.querySelector('#jspsych-image-button-response-button-' + i).addEventListener('click', function(e){
                if(something_playing){
                    alert("Please wait until the audio is finished to submit your answer.")
                } 
                else if (button_sounds.map(el => {return el.clicks}).includes(0)){
                    alert("You must listen to all options before responding.")
                } else{
                var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
                after_response(choice);
                }
            });
        }
        
        // store response
        var response = {
            rt: null,
            button: null
        };
        
        // function to handle responses by the subject
        function after_response(choice) {
            
            // measure rt
            var end_time = performance.now();
            var rt = end_time - start_time;
            response.button = choice;
            response.rt = rt;
            
            // disable all the buttons after a response
            var btns = document.querySelectorAll('.jspsych-image-button-response-button button');
            for(var i=0; i<btns.length; i++){
                //btns[i].removeEventListener('click');
                btns[i].setAttribute('disabled', 'disabled');
            }
            
            if (trial.response_ends_trial) {
                end_trial();
            }
        };
        
        // function to end trial when it is time
        function end_trial() {
            
            // kill any remaining setTimeout handlers
            jsPsych.pluginAPI.clearAllTimeouts();
            
            // gather the data to store for the trial
            var trial_data = {
                "rt": response.rt,
                "stimulus": trial.stimulus,
                "button_pressed": response.button
            };
            

        // Set the button info into the trialdata
        function set_btn_info(btns = button_sounds){
            num_btns = trial.choices.length
            for (var i = 0; i < num_btns; i++){
                // Need to convert button label's spaces to underscores
                btn_label = trial.choices[i]['label'].replace(/ /g,"_");
                // Get the sound file associated with the button
                // Note: this assumes all sound files are in a directory 'sound/'
                trial_data[btn_label] = btns[i]['name'].replace(/sound\//g,"");
                // Get the number of times that button was clicked
                trial_data[btn_label+"_click"] = btns[i]['clicks']
            }
        }
        

            set_btn_info();
            
            // clear the display
            display_element.innerHTML = '';
            
            // move on to the next trial
            jsPsych.finishTrial(trial_data);
        };

        var startTime = performance.now();

        // start audio
        if(context !== null){
            startTime = context.currentTime;
            source.start(startTime);
        } else {
            audio.play();
        }
        
        // end trial if time limit is set
        if (trial.trial_duration !== null) {
            jsPsych.pluginAPI.setTimeout(function() {
                end_trial();
            }, trial.trial_duration);
        }
        
        
    };
    
    return plugin;
})();
