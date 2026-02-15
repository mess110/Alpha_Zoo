
//
// screen_character_select.js runs the character selection scene.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

let playable_characters = [
  { name: "BLACK BEAR", key: "black_bear" },
  { name: "BROWN BEAR", key: "brown_bear" },
  { name: "LIGHT CAT", key: "light_cat" },
  { name: "ORANGE CAT", key: "orange_cat" },
  { name: "POLAR BEAR", key: "polar_bear" },
  { name: "RABBIT BLUESHIRT", key: "rabbit_blueshirt" },
  { name: "RABBIT GREENSHIRT", key: "rabbit_greenshirt" },
  { name: "YELLOW CAT", key: "yellow_cat" }
];

Game.prototype.initializeCharacterSelect = function() {
  var self = this;
  var screen = this.screens["character_select"];
  this.clearScreen(screen);
  console.log("initializing " + screen.name);

  this.character_select_typing_allowed = true;
  this.character_select_typing_text = "";
  this.selected_character_index = -1;

  // Background - grass green
  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x7EC850;
  screen.addChild(background);

  // Title
  let title = new PIXI.Text("Choose Your Character", {
    fontFamily: default_font,
    fontSize: 80,
    fill: 0x333333,
    align: "center"
  });
  title.anchor.set(0.5, 0.5);
  title.position.set(this.width / 2, 100);
  screen.addChild(title);

  // Create character preview containers
  this.character_previews = [];
  this.character_name_grey_texts = [];
  this.character_name_typing_texts = [];

  // Layout: 4 characters per row, 2 rows
  let characters_per_row = 4;
  let char_spacing_x = 280;
  let char_spacing_y = 320;
  let start_x = this.width / 2 - (characters_per_row - 1) * char_spacing_x / 2;
  let start_y = 300;

  playable_characters.forEach((char_data, index) => {
    let row = Math.floor(index / characters_per_row);
    let col = index % characters_per_row;
    let x = start_x + col * char_spacing_x;
    let y = start_y + row * char_spacing_y;

    // Container for this character option
    let char_container = new PIXI.Container();
    char_container.position.set(x, y);

    // Background circle
    let circle = new PIXI.Graphics();
    circle.beginFill(0xFFFFFF);
    circle.drawCircle(0, 0, 80);
    circle.endFill();
    circle.alpha = 0.5;
    char_container.addChild(circle);

    // Character sprite
    let character = this.makeCharacter(char_data.key);
    character.position.set(0, 45);
    character.scale.set(1.2, 1.2);

    // Set to south-facing idle animation
    if (character.sprites && character.sprites.south) {
      character.sprites.south.animationSpeed = 0.1;
      character.sprites.south.play();
    }

    char_container.addChild(character);

    // Character name label - grey text (shows full name)
    let grey_text = new PIXI.Text(char_data.name, {
      fontFamily: default_font,
      fontSize: 36,
      fill: 0xDDDDDD,
      letterSpacing: 2,
      align: "left"
    });
    grey_text.anchor.set(0, 0);

    // Calculate centered position for left-anchored text
    let text_width = grey_text.width;
    grey_text.position.set(-text_width / 2, 100);
    char_container.addChild(grey_text);
    this.character_name_grey_texts.push(grey_text);

    // Character name label - typing text (fills in as you type)
    let typing_text = new PIXI.Text("", {
      fontFamily: default_font,
      fontSize: 36,
      fill: 0xFFFFFF,
      letterSpacing: 2,
      align: "left"
    });
    typing_text.tint = 0x000000;
    typing_text.anchor.set(0, 0);
    typing_text.position.set(-text_width / 2, 100);
    char_container.addChild(typing_text);
    this.character_name_typing_texts.push(typing_text);

    screen.addChild(char_container);
    this.character_previews.push({
      container: char_container,
      circle: circle,
      data: char_data,
      index: index
    });
  });

  this.character_select_initialized = true;
}


Game.prototype.updateCharacterSelect = function() {
  // Don't update if screen not initialized yet
  if (!this.character_select_initialized) return;

  // Check for partial matches and update typing text overlay
  if (this.character_select_typing_text.length > 0) {
    let found_match = false;
    let typed_no_spaces = this.character_select_typing_text.replace(/ /g, "");

    for (let i = 0; i < playable_characters.length; i++) {
      let char_data = playable_characters[i];
      let name_no_spaces = char_data.name.replace(/ /g, "");

      if (name_no_spaces.startsWith(typed_no_spaces)) {
        // This character matches - fill in the typing text
        // Show the typed portion matching the actual name format
        let display_text = "";
        let typed_index = 0;
        for (let j = 0; j < char_data.name.length && typed_index < typed_no_spaces.length; j++) {
          if (char_data.name[j] === " ") {
            display_text += " ";
          } else {
            display_text += char_data.name[j];
            typed_index++;
          }
        }
        this.character_name_typing_texts[i].text = display_text;

        // Highlight this character
        this.character_previews[i].circle.alpha = 1.0;
        this.character_previews[i].circle.tint = 0xFFFF88;
        found_match = true;
        this.selected_character_index = i;
      } else {
        // Dim this character
        this.character_name_typing_texts[i].text = "";
        this.character_previews[i].circle.alpha = 0.3;
        this.character_previews[i].circle.tint = 0xCCCCCC;
      }
    }

    if (!found_match) {
      this.selected_character_index = -1;
    }
  } else {
    // Reset all to default state
    for (let i = 0; i < this.character_previews.length; i++) {
      this.character_name_typing_texts[i].text = "";
      this.character_previews[i].circle.alpha = 0.5;
      this.character_previews[i].circle.tint = 0xFFFFFF;
    }
    this.selected_character_index = -1;
  }
}


Game.prototype.characterSelectKeyDown = function(ev) {
  var self = this;
  let key = ev.key;

  if (!this.character_select_typing_allowed) return;

  // Handle letter typing
  for (let i in lower_array) {
    if (key === lower_array[i] || key === letter_array[i]) {
      this.addCharacterSelectType(letter_array[i]);
      return;
    }
  }

  // Handle space (optional)
  if (key === " ") {
    this.addCharacterSelectType(" ");
    return;
  }

  // Handle backspace
  if (key === "Backspace" || key === "Delete") {
    this.deleteCharacterSelectType();
    return;
  }
}


Game.prototype.addCharacterSelectType = function(letter) {
  var self = this;

  if (use_voice && letter !== " ") {
    soundEffect(letter.toLowerCase());
  }

  this.character_select_typing_text += letter;

  // Check for exact match (ignoring spaces)
  let typed_no_spaces = this.character_select_typing_text.replace(/ /g, "");
  for (let i = 0; i < playable_characters.length; i++) {
    let char_data = playable_characters[i];
    let name_no_spaces = char_data.name.replace(/ /g, "");
    if (typed_no_spaces === name_no_spaces) {
      this.selectCharacter(char_data.key, i);
      return;
    }
  }
}


Game.prototype.deleteCharacterSelectType = function() {
  if (this.character_select_typing_text.length > 0) {
    // Remove the character from typing text
    this.character_select_typing_text = this.character_select_typing_text.slice(0, -1);
  }
}


Game.prototype.selectCharacter = function(character_key, index) {
  var self = this;

  console.log("Selected character: " + character_key);

  this.character_select_typing_allowed = false;

  soundEffect("success");
  flicker(this.character_name_typing_texts[index], 300, 0x000000, 0xFFFFFF);
  flicker(this.character_name_grey_texts[index], 300, 0x000000, 0xFFFFFF);

  if (use_voice) {
    delay(function() {
      // Map character keys to their spoken sound names
      let spoken_name = character_key;
      if (character_key.includes("cat")) {
        spoken_name = "cat";
      } else if (character_key.includes("rabbit")) {
        spoken_name = "rabbit";
      }
      soundEffect("spoken_" + spoken_name);
    }, 600);
  }

  // Save selection to localStorage
  localStorage.setItem("selected_character", character_key);

  // Transition to zoo screen
  delay(function() {
    self.initializeScreen("zoo");
    self.current_screen = "zoo";
    self.fadeScreens("character_select", "zoo", true);
  }, 800);
}


Game.prototype.clearCharacterSelect = function() {
  var screen = this.screens["character_select"];
  this.clearScreen(screen);
  this.character_previews = [];
  this.character_name_grey_texts = [];
  this.character_name_typing_texts = [];
  this.character_select_initialized = false;
  this.character_select_typing_text = "";
  this.character_select_typing_allowed = true;
}
