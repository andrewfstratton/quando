(function () {
    var quando = this['quando']
    if (!quando) {
      alert('Fatal Error: Narrative must be included after quando_browser')
    }
    var self = quando.narrative = {}

    let area ={}
    let character = {}
    let object = {}
    let mood = {}
    let interaction = {}
    let option = {}

    self.areas = []
    var characters = []
    var objects = []
    var moods = []
    var interactions = []
    var options = []

    self.unlocked_chapters = [0]
    self.all_interactions = []

    self.current_area = {}
    self.items = []

    self.add_area = function(name,lock,fn_add_charcters_and_objects) {
        area = {}
        characters = []
        objects = []
        area.name = name
        area.lock = lock
        fn_add_charcters_and_objects()
        area.characters = characters
        area.objects = objects
        self.areas.push(area)
    }

    self.add_character = function(name,fn_add_moods) {
        character = {}
        moods = []
        character.name = name
        character.current_mood = "neutral"
        fn_add_moods()
        character.moods = moods
        characters.push(character)
    }

    self.add_object = function(name,description,fn_add_interactions) {
        object = {}
        interactions = []
        object.name = name
        object.description = description
        fn_add_interactions()
        object.interactions = interactions
        objects.push(object)
    }

    self.add_mood = function(when_mood,fn_add_interactions) {
        mood = {}
        interactions = []
        mood.when_mood = when_mood
        fn_add_interactions()
        mood.interactions = interactions
        moods.push(mood)

    }

    self.add_interaction = function(chapter_num,prompt,takes_input,con_types,additional,unlocked_chapter_nums,locked_chapter_nums,item_names,area_names,fn_add_options) {
        interaction = {}
        options = []
        interaction.chapter_num = chapter_num
        interaction.prompt = prompt
        if (takes_input == "yes") {
            interaction.takes_input = true
            fn_add_options()
            interaction.options = options
        } else {
            interaction.takes_input = false
            interaction.consequences = self.add_consequences(con_types,additional,unlocked_chapter_nums,locked_chapter_nums,item_names,area_names)
        }
        interactions.push(interaction)
    }

    self.add_option = function(phrase,reaction,con_types,additional,unlocked_chapter_nums,locked_chapter_nums,item_names,area_names) {
        option = {}
        option.phrase = phrase
        option.reaction = reaction
        option.consequences = self.add_consequences(con_types,additional,unlocked_chapter_nums,locked_chapter_nums,item_names,area_names)
        options.push(option)
    }

    self.add_consequences = function(con_types,additional,unlocked_chapter_nums,locked_chapter_nums,item_names,area_names) {
        consequences = []
        consequences.push(self.add_consequence(con_types[0],unlocked_chapter_nums[0],locked_chapter_nums[0],item_names[0],area_names[0]))
        if (additional[0] == "yes") {
            consequences.push(self.add_consequence(con_types[1],unlocked_chapter_nums[1],locked_chapter_nums[1],item_names[0],area_names[1]))
        }
        if (additional[1] == "yes") {
            consequences.push(self.add_consequence(con_types[2],unlocked_chapter_nums[2],locked_chapter_nums[2],item_names[2],area_names[2]))
        }
        return consequences
    }

    self.add_consequence = function(contype,unlocked_chapter_num,locked_chapter_num,item_name,area_name) {
        consequence = {}
        consequence.consequence_type = contype
        if (contype == "unlock") {
            consequence.consequence_parameter = unlocked_chapter_num
        } else if (contype == "lock") {
            consequence.consequence_parameter = locked_chapter_num
        } else if (contype == "item") {
            consequence.consequence_parameter = item_name
        } else if (contype == "area") {
            consequence.consequence_parameter = area_name
        }
        return consequence
    }


    self.play_scenario = function(scenario_name,start_area,goal,goal_chapter_num,goal_item_name,goal_character_name,goal_mood) {
        alert("Playing Scenario " + scenario_name)

        quando.cursor_left_right(50, 50, false, val)
        quando.cursor_up_down(50, 50, false, val)
        quando.mouse.handleX(0,false,50,50,false,(val)=>{quando.cursor_left_right(50, 50, false, val)
        })
        quando.mouse.handleY(1,false,50,50,false,(val)=>{quando.cursor_up_down(50, 50, false, val)
        })

        self.areas.forEach(a => {
            other_areas = self.areas.slice()
            other_areas.splice(self.areas.indexOf(a),1)
            self.create_display(a,other_areas)
        })

        current_area_index = self.areas.findIndex(a => a.name === start_area)
        self.current_area = self.areas[current_area_index]

        goal_character_index = 0
        goal_character_area = ""

        self.areas.forEach(a => {
            index = a.characters.findIndex(c => c.name === goal_character_name)
            if (index >= 0) {
                goal_character_index = index
                goal_character_area = a
            }
        })

        while ((goal == "chapter" && !self.unlocked_chapters.includes(goal_chapter_num)) || 
        (goal == "item" && !self.items.includes(goal_item_name)) || 
        (goal == "feel" && goal_character_area.characters[goal_character_index].current_mood != goal_mood)) {
            
            quando.showDisplay(self.areas.indexOf(self.current_area))

            self.unlocked_chapters.push(goal_chapter_num)
        }
    }

    self.talk_to = function(character) {
        all_interactions = character.moods[character.moods.findIndex(m => m.when_mood === character.current_mood)].interactions
        random_interaction = all_interactions[Math.floor(Math.random()*all_interactions.length)]
        self.interact(random_interaction)
    }

    self.interact_with = function(object) {
        random_interaction = object.interactions[Math.floor(Math.random()*object.interactions.length)]
        alert(random_interaction.prompt)
    }

    self.move_to = function(area) {
        self.current_area = area
        quando.showDisplay(self.areas.indexOf(area))
    }

    self.interact = function(interaction) {
        alert(interaction.prompt)
        if (interaction.takes_input) {
            prompt_text = ""
            interaction.options.forEach(o => {
                prompt_text = prompt_text + o.phrase + "\n"
            })
            found_match = false
            while (!found_match) {
                quando.prompt(prompt_text,(txt)=>{found_match = self.string_equals(txt,interaction.options)})
            }
        }
    }

    self.string_equals = function(txt,options) {
        found_match = false
        options.forEach(o => {
            if (o.phrase === txt) {
                alert(o.consequences[0])
                found_match = true
            }
        })
        return found_match
    }

    self.create_display = function(area,other_areas) {
        quando.display(self.areas.indexOf(area),()=>{
            quando.title(area.name)
            quando.addLabelStatement("TALK TO CHARACTER:", ()=>{})
            area.characters.forEach(c => {
                quando.addLabelStatement(c.name, ()=>self.talk_to(c))
            })
            quando.addLabelStatement("INTERACT WITH OBJECT:", ()=>{})
            area.objects.forEach(o => {
                quando.addLabelStatement(o.name, ()=>self.interact_with(o))
            })
            quando.addLabelStatement("MOVE TO AREA:", ()=>{})
            other_areas.forEach(a => {
                quando.addLabelStatement(a.name + " - " + a.lock, ()=>self.move_to(a))
            })
        })
    }

    
    /*
    self.get_random_interaction = function() {
        if (all_ints.length == 0) {}
        characters[0].moods.forEach(e => {
            e.interactions.forEach(ee => {
                if (self.unlocked_chapters.includes(ee.chapter_num)) {
                    all_ints.push(ee)
                }
            });
        });
        return all_ints[Math.floor(Math.random()*all_ints.length)]
    }

    self.play_interaction = function(interaction) {
        alert(interaction.prompt)

    }

    /*

    /*
    self.option_phrases = []
    self.option_responses = []
    self.option_chapters = []
    self.option_features = []
    self.current_option = 0

    self.add_option = function(phrase, response, chapter) {
        self.option_phrases.push(phrase)
        self.option_responses.push(response)
        self.option_chapters.push(chapter)
        console.log("option added")
        return true
    }

    self.send_options = function(phrase, default_response) {
        self.option_phrases.push(phrase)
        self.option_responses.push(default_response)
        self.option_chapters.push(phrase)
        quando.send_message('option',self.option_phrases[0],'node-red-alfie.eu-gb.mybluemix.net','node')
    }

    quando.add_message_handler('option', (val) => {
        self.option_features.push(val)
        self.current_option += 1
        if (self.current_option < self.option_phrases.length) {
            quando.send_message('option',self.option_phrases[self.current_option],'node-red-alfie.eu-gb.mybluemix.net','node')
        } else {
            self.current_option = 0
        }
    })

    self.print_stuff = function() {
        console.log(self.option_features)
    }
    */

}) ()