//
// screen_bus_stop.js runs the bus stop scene where users choose their destination.
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

let destination_options = [
  { name: "ZOO", key: "zoo", enabled: true },
  { name: "WARDROBE", key: "wardrobe", enabled: true },
  { name: "DISCO", key: "disco", enabled: false },
];

Game.prototype.initializeBusStop = function() {
  var self = this;
  var screen = this.screens["bus_stop"];
  this.clearScreen(screen);
  console.log("initializing " + screen.name);

  this.bus_stop_typing_allowed = true;
  this.bus_stop_last_prefix = "";
  this.bus_stop_last_edit = null;
  this.selected_destination_index = -1;
  this.bus_stop_decorations = [];

  // Background - bus stop image
  let background = PIXI.Sprite.from("Art/Bus_Stop/bus_stop.png");
  background.width = this.width;
  background.height = this.height;
  screen.addChild(background);

  // Add player character from localStorage or default to brown_bear
  let selected_character = localStorage.getItem("selected_character") || "brown_bear";
  this.bus_stop_player = this.makeCharacter(selected_character);
  this.bus_stop_player.position.set(this.width / 2, this.height * 0.75);
  screen.addChild(this.bus_stop_player);

  // Load saved progression data if available
  let persist_purchases = window.getPersistPurchases();
  let saved_data = null;

  if (persist_purchases && window.hasZooSave()) {
    saved_data = window.loadZoo();
  }

  // Sync persistent items from zoo player if it exists (returning from zoo)
  if (this.player) {
    // Sync balloons
    if (this.player.balloons && this.player.balloons.length > 0) {
      for (let i = 0; i < this.player.balloons.length; i++) {
        this.bus_stop_player.addBalloon(this.player.balloons[i].color);
      }
    }

    // Sync stuffies
    if (this.player.stuffies && this.player.stuffies.length > 0) {
      for (let stuffie of this.player.stuffies) {
        this.bus_stop_player.addStuffie(stuffie.character_name, this.bus_stop_decorations);
      }
      // Add stuffies to the screen
      for (let stuffie of this.bus_stop_player.stuffies) {
        screen.addChild(stuffie);
      }
    }

    // Sync accessories
    if (this.player.shirt_color) {
      this.bus_stop_player.addShirt(this.player.shirt_color);
    }
    if (this.player.hat_type) {
      this.bus_stop_player.addHat(this.player.hat_type);
    }
    if (this.player.glasses_type) {
      this.bus_stop_player.addGlasses(this.player.glasses_type);
    }
    if (this.player.scooter_type) {
      this.bus_stop_player.addScooter(this.player.scooter_type, "bus_stop");
    }
  }
  // Otherwise, load from saved progression data (first time on bus stop)
  else if (saved_data && saved_data.progression) {
    let progression = saved_data.progression;

    // Load balloons
    if (progression.balloons && progression.balloons.length > 0) {
      for (let balloon_color of progression.balloons) {
        this.bus_stop_player.addBalloon(balloon_color);
      }
    }

    // Load stuffies
    if (progression.stuffies && progression.stuffies.length > 0) {
      for (let stuffie_name of progression.stuffies) {
        this.bus_stop_player.addStuffie(stuffie_name, this.bus_stop_decorations);
      }
      // Add stuffies to the screen
      for (let stuffie of this.bus_stop_player.stuffies) {
        screen.addChild(stuffie);
      }
    }

    // Load accessories
    if (progression.shirt_color) {
      this.bus_stop_player.addShirt(progression.shirt_color);
    }
    if (progression.hat_type) {
      this.bus_stop_player.addHat(progression.hat_type);
    }
    if (progression.glasses_type) {
      this.bus_stop_player.addGlasses(progression.glasses_type);
    }
    if (progression.scooter_type) {
      this.bus_stop_player.addScooter(progression.scooter_type, "bus_stop");
    }
  }

  // Title
  let title = new PIXI.Text("Where Do You Want To Go?", {
    fontFamily: default_font,
    fontSize: 80,
    fill: 0x333333,
    align: "center"
  });
  title.anchor.set(0.5, 0.5);
  title.position.set(this.width / 2, 100);
  screen.addChild(title);

  // Create metro-style line connecting the destinations
  let metro_line = new PIXI.Graphics();
  let line_y = 300;
  let line_start_x = 100;
  let line_end_x = 750;

  // Draw the main horizontal metro line
  metro_line.lineStyle(12, 0xFF6600, 1);
  metro_line.moveTo(line_start_x, line_y);
  metro_line.lineTo(line_end_x, line_y);
  screen.addChild(metro_line);

  // Create destination preview containers
  this.destination_previews = [];
  this.destination_name_grey_texts = [];
  this.destination_name_typing_texts = [];

  // Layout: 3 destinations arranged horizontally on the left 2/3 of screen
  let dest_spacing_x = 325;
  let start_x = 100;
  let start_y = 300;

  destination_options.forEach((dest_data, index) => {
    let x = start_x + index * dest_spacing_x;
    let y = start_y;

    // Container for this destination option
    let dest_container = new PIXI.Container();
    dest_container.position.set(x, y);

    // Determine if this destination is enabled
    let is_enabled = dest_data.enabled;
    let circle_color = is_enabled ? 0xFF6600 : 0x999999;
    let fill_color = is_enabled ? 0xFFFFFF : 0xCCCCCC;

    // Metro station stop - outer circle
    let outer_circle = new PIXI.Graphics();
    outer_circle.lineStyle(8, circle_color, 1);
    outer_circle.beginFill(fill_color);
    outer_circle.drawCircle(0, 0, 40);
    outer_circle.endFill();
    dest_container.addChild(outer_circle);

    // Metro station stop - inner highlight circle
    let circle = new PIXI.Graphics();
    circle.beginFill(fill_color);
    circle.drawCircle(0, 0, 30);
    circle.endFill();
    circle.alpha = 0.6;
    dest_container.addChild(circle);

    // Destination name label - grey text (shows full name)
    let grey_text = new PIXI.Text(dest_data.name, {
      fontFamily: default_font,
      fontSize: 48,
      fill: is_enabled ? 0x666666 : 0xAAAAAA,
      letterSpacing: 2,
      align: "left"
    });
    grey_text.anchor.set(0, 0);

    // Calculate centered position for left-anchored text
    let text_width = grey_text.width;
    grey_text.position.set(-text_width / 2, 55);
    dest_container.addChild(grey_text);
    this.destination_name_grey_texts.push(grey_text);

    // Destination name label - typing text (fills in as you type)
    let typing_text = new PIXI.Text("", {
      fontFamily: default_font,
      fontSize: 48,
      fill: 0x000000,
      letterSpacing: 2,
      align: "left"
    });
    typing_text.anchor.set(0, 0);
    typing_text.position.set(-text_width / 2, 55);
    typing_text.target = dest_data.name;
    typing_text.enabled = is_enabled;
    dest_container.addChild(typing_text);
    this.destination_name_typing_texts.push(typing_text);

    screen.addChild(dest_container);
    this.destination_previews.push({
      container: dest_container,
      circle: circle,
      outer_circle: outer_circle,
      data: dest_data,
      index: index
    });
  });

  this.bus_stop_last_edit = this.destination_name_typing_texts[0];
  this.bus_stop_initialized = true;
}


Game.prototype.updateBusStop = function(diff) {
  // Don't update if screen not initialized yet
  if (!this.bus_stop_initialized) return;

  let fractional = diff / (1000/30.0);
  var keymap = this.keymap;
  var player = this.bus_stop_player;

  // Player movement
  if (player) {
    player.updateBalloons();

    // Determine direction based on keymap
    if (keymap["ArrowUp"] && keymap["ArrowRight"]) {
      player.direction = "upright";
    } else if (keymap["ArrowUp"] && keymap["ArrowLeft"]) {
      player.direction = "upleft";
    } else if (keymap["ArrowDown"] && keymap["ArrowRight"]) {
      player.direction = "downright";
    } else if (keymap["ArrowDown"] && keymap["ArrowLeft"]) {
      player.direction = "downleft";
    } else if (keymap["ArrowDown"]) {
      player.direction = "down";
    } else if (keymap["ArrowUp"]) {
      player.direction = "up";
    } else if (keymap["ArrowLeft"]) {
      player.direction = "left";
    } else if (keymap["ArrowRight"]) {
      player.direction = "right";
    } else {
      player.direction = null;
    }

    // Move player if direction is set and within bounds
    if (player.direction != null) {
      // Calculate next position
      let next_x = player.x;
      let next_y = player.y;
      let speed = player.walk_speed * player.scooter_boost;

      if (player.direction == "upright") {
        next_y = player.y - 0.707 * speed;
        next_x = player.x + 0.707 * speed;
      } else if (player.direction == "upleft") {
        next_y = player.y - 0.707 * speed;
        next_x = player.x - 0.707 * speed;
      } else if (player.direction == "downright") {
        next_y = player.y + 0.707 * speed;
        next_x = player.x + 0.707 * speed;
      } else if (player.direction == "downleft") {
        next_y = player.y + 0.707 * speed;
        next_x = player.x - 0.707 * speed;
      } else if (player.direction == "down") {
        next_y = player.y + speed;
      } else if (player.direction == "up") {
        next_y = player.y - speed;
      } else if (player.direction == "left") {
        next_x = player.x - speed;
      } else if (player.direction == "right") {
        next_x = player.x + speed;
      }

      // Bounds checking - keep player on screen with some margin
      let margin = 140;
      if (next_x >= margin && next_x <= this.width - margin &&
          next_y >= this.height - margin * 1.65 && next_y <= this.height - margin) {
        player.move();
      }

      player.updateDirection();
      player.walkAnimation();
    }
  }

  // Update destination highlighting based on typing text
  let found_match = false;
  for (let i = 0; i < this.destination_previews.length; i++) {
    let is_enabled = this.destination_name_typing_texts[i].enabled;
    if (is_enabled && this.destination_name_typing_texts[i].text.length > 0) {
      // Highlight this destination
      this.destination_previews[i].circle.alpha = 1.0;
      this.destination_previews[i].circle.tint = 0xFFDD00;
      this.destination_previews[i].outer_circle.tint = 0xFFDD00;
      found_match = true;
      this.selected_destination_index = i;
    } else {
      // Reset to default state
      this.destination_previews[i].circle.alpha = 0.6;
      this.destination_previews[i].circle.tint = 0xFFFFFF;
      this.destination_previews[i].outer_circle.tint = 0xFFFFFF;
    }
  }

  if (!found_match) {
    this.selected_destination_index = -1;
  }

  // Update falling letters physics
  this.freeeeeFreeeeeFalling(fractional);
}


Game.prototype.busStopKeyDown = function(ev) {
  var self = this;
  let key = ev.key;

  if (!this.bus_stop_typing_allowed) return;

  // Handle letter typing
  for (let i in lower_array) {
    if (key === lower_array[i] || key === letter_array[i]) {
      this.addBusStopType(letter_array[i]);
      return;
    }
  }


  // Handle backspace
  if (key === "Backspace" || key === "Delete") {
    this.deleteBusStopType();
    return;
  }
}


Game.prototype.addBusStopType = function(letter) {
  var self = this;

  let new_text = this.bus_stop_last_prefix + letter;
  let one_text_is_filled = false;

  if (use_voice && letter !== " ") {
    soundEffect(letter.toLowerCase());
  }

  // Check all typing texts to see if any match the new prefix
  for (let i = 0; i < this.destination_name_typing_texts.length; i++) {
    let typing_text = this.destination_name_typing_texts[i];
    // Only allow typing on enabled destinations
    if (typing_text.enabled && typing_text.target.indexOf(new_text) == 0) {
      one_text_is_filled = true;
      if (new_text.length <= typing_text.target.length) {
        typing_text.text = new_text;
        this.bus_stop_last_prefix = new_text;
        this.bus_stop_last_edit = typing_text;
        // Auto-add space if the target has a space at this position
        if (typing_text.text.length < typing_text.target.length &&
          typing_text.target[new_text.length] == " ") {
          typing_text.text += " ";
          this.bus_stop_last_prefix += " ";
        }
      }
    } else {
      typing_text.text = "";
    }
  }

  // If no text matches, continue filling the last edited text (forgiving typing)
  if (!one_text_is_filled) {
    if (new_text.length <= this.bus_stop_last_edit.target.length) {
      this.bus_stop_last_edit.text = new_text;
      this.bus_stop_last_prefix = new_text;
      // Auto-add space if the target has a space at this position
      if (this.bus_stop_last_edit.text.length < this.bus_stop_last_edit.target.length &&
        this.bus_stop_last_edit.target[new_text.length] == " ") {
        this.bus_stop_last_edit.text += " ";
        this.bus_stop_last_prefix += " ";
      }
    } else {
      this.bus_stop_last_edit.text = this.bus_stop_last_prefix;
    }
  }

  // Check for exact match
  for (let i = 0; i < this.destination_name_typing_texts.length; i++) {
    let typing_text = this.destination_name_typing_texts[i];
    if (typing_text.text == typing_text.target) {
      this.selectDestination(destination_options[i].key, i);
      return;
    }
  }
}


Game.prototype.deleteBusStopType = function() {
  var self = this;
  var screen = this.screens["bus_stop"];

  let deleting = false;
  for (let i = 0; i < this.destination_name_typing_texts.length; i++) {
    let typing_text = this.destination_name_typing_texts[i];

    if (typing_text.text.length > 0) {
      deleting = true;

      // Skip spaces when deleting
      if (typing_text.text[typing_text.text.length - 1] === " ") {
        typing_text.text = typing_text.text.slice(0,-1);
        this.bus_stop_last_prefix = this.bus_stop_last_prefix.slice(0,-1);
      }

      // Create falling letter animation
      let l = typing_text.text.slice(-1, typing_text.text.length);
      let t = new PIXI.Text(l, {fontFamily: default_font, fontSize: 48, fill: 0x000000, letterSpacing: 2, align: "left"});
      t.anchor.set(0, 0.5);
      t.position.set(
        typing_text.parent.position.x + typing_text.position.x + 27 * (typing_text.text.length - 1),
        typing_text.parent.position.y + typing_text.position.y
      );
      t.vx = -20 + 40 * Math.random();
      t.vy = -5 + -20 * Math.random();
      t.floor = 1200;
      screen.addChild(t);
      this.freefalling.push(t);

      typing_text.text = typing_text.text.slice(0, -1);
    }
  }
  if (deleting) {
    this.bus_stop_last_prefix = this.bus_stop_last_prefix.slice(0, -1);
    soundEffect("swipe");
  }
}


Game.prototype.selectDestination = function(destination_key, index) {
  var self = this;

  console.log("Selected destination: " + destination_key);

  this.bus_stop_typing_allowed = false;

  soundEffect("success");
  flicker(this.destination_name_typing_texts[index], 300, 0x000000, 0xFFFFFF);
  flicker(this.destination_name_grey_texts[index], 300, 0x000000, 0xFFFFFF);

  // Transition to the selected screen
  delay(function() {
    if (destination_key === "zoo") {
      self.initializeScreen("zoo");
      self.current_screen = "zoo";
      self.fadeScreens("bus_stop", "zoo", true);
    } else if (destination_key === "wardrobe") {
      self.initializeScreen("character_select");
      self.current_screen = "character_select";
      self.fadeScreens("bus_stop", "character_select", true);
    }
  }, 800);
}


Game.prototype.clearBusStop = function() {
  var screen = this.screens["bus_stop"];
  this.clearScreen(screen);
  this.destination_previews = [];
  this.destination_name_grey_texts = [];
  this.destination_name_typing_texts = [];
  this.bus_stop_initialized = false;
  this.bus_stop_last_prefix = "";
  this.bus_stop_last_edit = null;
  this.bus_stop_typing_allowed = true;
  this.bus_stop_player = null;
  this.bus_stop_decorations = [];
}
