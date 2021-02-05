/**
* jspsych-audio-buttons
* Thomas Sostarics
*
* plugin for playing an audio file, with buttons to hear followup audio stimuli
*
* documentation: docs.jspsych.org
*
**/

jsPsych.plugins["audio-buttons"] = (function() {
    var plugin = {};
    
    jsPsych.pluginAPI.registerPreload('audio-buttons', 'stimulus', 'audio');
    
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
                        default: undefined
                    },
                    aud_file: {
                        type: jsPsych.plugins.parameterType.STRING,
                        default: undefined,
                        description: 'The audio file to be played on click'
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
            // The questions used for the likert scale
            scale_questions: {
                type: jsPsych.plugins.parameterType.COMPLEX,
                array: true,
                pretty_name: 'Scale Questions',
                nested: {
                    prompt: {
                        type: jsPsych.plugins.parameterType.STRING,
                        pretty_name: 'Prompt',
                        default: undefined,
                        description: 'Questions that are associated with the slider.'
                    },
                    labels: {
                        type: jsPsych.plugins.parameterType.STRING,
                        array: true,
                        pretty_name: 'Labels',
                        default: undefined,
                        description: 'Labels to display for individual question.'
                    },
                    required: {
                        type: jsPsych.plugins.parameterType.BOOL,
                        pretty_name: 'Required',
                        default: false,
                        description: 'Makes answering the question required.'
                    },
                    name: {
                        type: jsPsych.plugins.parameterType.STRING,
                        pretty_name: 'Question Name',
                        default: '',
                        description: 'Controls the name of data values associated with this question'
                    }
                }
            },
            scale_width: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Scale width',
                default: null,
                description: 'Width of the likert scales in pixels.'
            },
            // For the text box question(s)
            questions: {
                type: jsPsych.plugins.parameterType.COMPLEX,
                array: true,
                pretty_name: 'Questions',
                default: undefined,
                nested: {
                    prompt: {
                        type: jsPsych.plugins.parameterType.STRING,
                        pretty_name: 'Prompt',
                        default: undefined,
                        description: 'Prompt for the subject to response'
                    },
                    placeholder: {
                        type: jsPsych.plugins.parameterType.STRING,
                        pretty_name: 'Value',
                        default: "",
                        description: 'Placeholder text in the textfield.'
                    },
                    rows: {
                        type: jsPsych.plugins.parameterType.INT,
                        pretty_name: 'Rows',
                        default: 5,
                        description: 'The number of rows for the response text box.'
                    },
                    columns: {
                        type: jsPsych.plugins.parameterType.INT,
                        pretty_name: 'Columns',
                        default: 40,
                        description: 'The number of columns for the response text box.'
                    },
                    required: {
                        type: jsPsych.plugins.parameterType.BOOL,
                        pretty_name: 'Required',
                        default: true,
                        description: 'Require a response'
                    },
                    name: {
                        type: jsPsych.plugins.parameterType.STRING,
                        pretty_name: 'Question Name',
                        default: '',
                        description: 'Controls the name of data values associated with this question'
                    }
                }
            },
            // Scale box preamble (above scale q)
            scale_preamble: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Preamble',
                default: null,
                description: 'HTML formatted string to display at the top of the page above all the questions.'
            },
            // Text box preamble (top of page)
            preamble: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Preamble',
                default: null,
                description: 'HTML formatted string to display at the top of the page above all the questions.'
            },
            // Submit button label
            button_label: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button label',
                default:  'Continue',
                description: 'The text that appears on the button to finish the trial.'
            },
            button_instructions: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button Instructions',
                default: null,
                description: 'Any content here will be displayed below the buttons.'
            },
            // Should probably stay null for these free response questions
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
                default: '50px',
                description: 'Horizontal margin of button.'
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
        if(context !== null){
            var source = context.createBufferSource();
            source.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
            source.connect(context.destination);
        } else {
            var audio = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus);
            audio.currentTime = 0;
        }
        
        // change the scale width if specified
        if(trial.scale_width !== null){
            var w = trial.scale_width + 'px';
        } else {
            var w = '100%';
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
        
        // start form for text box
        html += '<form id="jspsych-survey-text-form">'
        
        // Display audio buttons
        html += '<div id="jspsych-audio-button-response-btngroup">';
        for (var i = 0; i < trial.choices.length; i++) {
            var str = buttons[i].replace(/%choice%/g, trial.choices[i]['label']);
            var str = str.replace(/%aud_file%/g, trial.choices[i]['aud_file'])
            html += '<div class="jspsych-audio-button-response-button" style="cursor: pointer; display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-audio-button-response-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
        }
        html += '</div>';
        
        //show button instructions if there is one
        if (trial.button_instructions !== null) {
            html += trial.button_instructions;
        }
        
        
        // generate question order
        var question_order = [];
        for(var i=0; i<trial.questions.length; i++){
            question_order.push(i);
        }
        if(trial.randomize_question_order){
            question_order = jsPsych.randomization.shuffle(question_order);
        }
        
        // add text box questions
        for (var i = 0; i < trial.questions.length; i++) {
            var question = trial.questions[question_order[i]];
            var question_index = question_order[i];
            html += '<div id="jspsych-survey-text-'+question_index+'" class="jspsych-survey-text-question" style="margin: 2em 0em;">';
            html += '<p class="jspsych-survey-text">' + question.prompt + '</p>';
            var autofocus = i == 0 ? "autofocus" : "";
            var req = question.required ? "required" : "";
            if(question.rows == 1){
                html += '<input type="text" id="input-'+question_index+'"  name="#jspsych-survey-text-response-' + question_index + '" data-name="'+question.name+'" size="'+question.columns+'" '+autofocus+' '+req+' placeholder="'+question.placeholder+'"></input>';
            } else {
                html += '<textarea id="input-'+question_index+'" name="#jspsych-survey-text-response-' + question_index + '" data-name="'+question.name+'" cols="' + question.columns + '" rows="' + question.rows + '" '+autofocus+' '+req+' placeholder="'+question.placeholder+'"></textarea>';
            }
            html += '</div>';
        }
        
        /*
        IF YOU DON'T WANT THE SCALE REMOVE EVERYTHING STARTING HERE...
        */
        // inject CSS for trial (for the likert scale)
        html += '<style id="jspsych-survey-likert-css">';
        html += ".jspsych-survey-likert-statement { display:block; font-size: 16px; padding-top: 40px; margin-bottom:10px; }"+
        ".jspsych-survey-likert-opts { list-style:none; width:"+w+"; margin:auto; padding:0 0 35px; display:block; font-size: 14px; line-height:1.1em; }"+
        ".jspsych-survey-likert-opt-label { line-height: 1.1em; color: #444; }"+
        ".jspsych-survey-likert-opts:before { content: ''; position:relative; top:11px; /*left:9.5%;*/ display:block; background-color:#efefef; height:4px; width:100%; }"+
        ".jspsych-survey-likert-opts:last-of-type { border-bottom: 0; }"+
        ".jspsych-survey-likert-opts li { display:inline-block; /*width:19%;*/ text-align:center; vertical-align: top; }"+
        ".jspsych-survey-likert-opts li input[type=radio] { display:block; position:relative; top:0; left:50%; margin-left:-6px; }"
        html += '</style>';
        
        // show scale preamble text if any
        if(trial.scale_preamble !== null){
            html += '<div id="jspsych-survey-likert-preamble" class="jspsych-survey-likert-preamble">'+trial.scale_preamble+'</div>';
        }
        // we need the likert scale to remain part of the total trial form
        // html += '<form id="jspsych-survey-likert-form">';
        
        // add likert scale scale_questions ///
        // generate scale question order. this is randomized here as opposed to randomizing the order of trial.scale_questions
        // so that the data are always associated with the same question regardless of order
        var scale_question_order = [];
        for(var i=0; i<trial.scale_questions.length; i++){
            scale_question_order.push(i);
        }
        if(trial.randomize_question_order){
            scale_question_order = jsPsych.randomization.shuffle(question_order);
        }
        
        for (var i = 0; i < trial.scale_questions.length; i++) {
            var question = trial.scale_questions[scale_question_order[i]];
            // add scale question
            html += '<label class="jspsych-survey-likert-statement">' + question.prompt + '</label>';
            // add scale options
            var width = 100 / question.labels.length;
            var options_string = '<ul class="jspsych-survey-likert-opts" data-name="'+question.name+'" data-radio-group="Q' + scale_question_order[i] + '">';
            for (var j = 0; j < question.labels.length; j++) {
                options_string += '<li style="width:' + width + '%"><input type="radio" name="Q' + scale_question_order[i] + '" value="' + j + '"';
                if(question.required){
                    options_string += ' required';
                }
                options_string += '><label class="jspsych-survey-likert-opt-label">' + question.labels[j] + '</label></li>';
            }
            options_string += '</ul>';
            html += options_string;
        }
        
        /*
        ...AND ENDING HERE!
        You should also remove the scale_ properties in the plugin
        But if you remove/comment out all the scale stuff it won't
        really matter i think.
        */
        
        // add submit button
        html += '<input type="submit" id="jspsych-survey-text-next" class="jspsych-btn jspsych-survey-text" value="'+trial.button_label+'"></input>';
        html += '</form>'
        
        // display html
        display_element.innerHTML = html;
        
        // Link buttons to sound files
        // Set up array to hold sounds
        var button_sounds = [];
        
        // Click event handler helper function
        function playChoice(i){
            if(button_sounds[i]['sound']){
                button_sounds[i]['sound'].currentTime = 0;
                button_sounds[i]['sound'].play();
                button_sounds[i]['clicks'] += 1;
            }
        }
        
        // Go through each (button) choice and link the aud_file to the button
        for (var i = 0; i < trial.choices.length; i++) {
            // Get the audio stream, needs to be done through this to take advantage of preloading
            var choice_sound = jsPsych.pluginAPI.getAudioBuffer(trial.choices[i]['aud_file']);
            button_sounds.push({name: trial.choices[i]['aud_file'], sound: choice_sound, clicks: 0});
            
            //playchoice.bind is what allows us to use the click handler with a parameter
            document.getElementById('jspsych-audio-button-response-button-'+i).addEventListener("click",playChoice.bind(null, i))
        }
        
        // End trial when the submit button is clicked
        display_element.querySelector('#jspsych-survey-text-form').addEventListener('submit', function(e) {
            e.preventDefault();
            /* 
            Checks if the participant has listened to all of the button options
            and sends an alert if they try to submit without listening to at least
            1 option. Otherwise ends the trial and saves responses.
            */
            if (button_sounds.map(el => {return el.clicks}).includes(0)){
                alert("You must listen to all options before responding.")
            }
            else{
                // measure response time
                var endTime = performance.now();
                var response_time = endTime - startTime;
                
                // create object to hold responses
                var question_data = {};
                
                // Parse text box responses
                for(var index=0; index < trial.questions.length; index++){
                    var id = "Q" + index;
                    var q_element = document.querySelector('#jspsych-survey-text-'+index).querySelector('textarea, input'); 
                    var val = q_element.value;
                    var name = q_element.attributes['data-name'].value;
                    if(name == ''){
                        name = id;
                    }        
                    var obje = {};
                    obje[name] = val;
                    Object.assign(question_data, obje);
                }
                
                var matches = display_element.querySelectorAll('#jspsych-survey-text-form .jspsych-survey-likert-opts');
                
                // Parse the likert scale response
                for(var index = 0; index < matches.length; index++){
                    var id = matches[index].dataset['radioGroup'];
                    var el = display_element.querySelector('input[name="' + id + '"]:checked');
                    if (el === null) {
                        var resp = "";
                    } else {
                        var resp = parseInt(el.value);
                    }
                    var obje = {};
                    if(matches[index].attributes['data-name'].value !== ''){
                        var name = matches[index].attributes['data-name'].value;
                    } else {
                        var name = id;
                    }
                    obje['Acceptability'] = resp;
                    Object.assign(question_data, obje);
                }
                
                // Set the button info into the trialdata
                function set_btn_info(btns = button_sounds){
                    num_btns = trial.choices.length
                    for (var i = 0; i < num_btns; i++){
                        // Need to convert button label's spaces to underscores
                        btn_label = trial.choices[i]['label'].replace(/ /g,"_");
                        // Get the sound file associated with the button
                        // Note: this assumes all sound files are in a directory 'sound/'
                        trialdata[btn_label] = btns[i]['name'].replace(/sound\//g,"");
                        // Get the number of times that button was clicked
                        trialdata[btn_label+"_click"] = btns[i]['clicks']
                    }
                }

                // save data
                var trialdata = {
                    "rt": response_time,
                    "stimulus": trial.stimulus,
                    "text_response": question_data['Q0'],
                    "scale_response": question_data['Acceptability']
                    // "responses": JSON.stringify(question_data),
                    //"button_sounds": JSON.stringify(button_sounds).replace(/,\"sound\":{}/g,''),
                };
                
                set_btn_info();

                // Clear display
                display_element.innerHTML = '';
                // kill any remaining setTimeout handlers
                jsPsych.pluginAPI.clearAllTimeouts();
                // next trial
                jsPsych.finishTrial(trialdata);
            }
        });
        
        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();
        
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
        
        var startTime = performance.now();
    };
    
    return plugin;
})();
