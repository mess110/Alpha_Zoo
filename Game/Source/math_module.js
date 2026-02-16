
//
// math_module.js provides a reusable math popup system
// that can be used in any screen (cafe, train, ferris wheel, etc.)
//
// Copyright 2021 Alpha Zoo LLC.
// Written by Matthew Carlin
//

Game.prototype.initializeMathModule = function() {
  var self = this;

  // Initialize math module state
  this.math_popup_visible = false;
  this.math_answer = "";
  this.math_correct_answer = 0;
  this.math_answer_is_wrong = false;
  this.math_success_callback = null;
  this.math_cancel_callback = null;
  this.math_parent_screen = null;

  // Create the math popup UI container
  this.math_popup = new PIXI.Container();
  this.math_popup.visible = false;

  this.math_background = new PIXI.Sprite(PIXI.Texture.from("Art/wood.png"));
  this.math_background.anchor.set(0.5, 0.5);
  this.math_background.position.set(this.width / 2, this.height / 2);
  this.math_background.scale.set(3, 2.5);
  this.math_popup.addChild(this.math_background);

  this.math_problem_text = new PIXI.Text("", {fontFamily: default_font, fontSize: 100, fill: 0x000000, letterSpacing: 5, align: "left"});
  this.math_problem_text.anchor.set(0, 0.5);
  this.math_problem_text.position.set(this.width / 2 - 200, this.height / 2);
  this.math_popup.addChild(this.math_problem_text);

  this.math_answer_text = new PIXI.Text("", {fontFamily: default_font, fontSize: 100, fill: 0x000000, letterSpacing: 5, align: "left"});
  this.math_answer_text.anchor.set(0, 0.5);
  this.math_answer_text.position.set(this.width / 2 + 60, this.height / 2);
  this.math_popup.addChild(this.math_answer_text);

  this.math_escape_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/close_button.png"));
  this.math_escape_glyph.anchor.set(0,1);
  this.math_escape_glyph.position.set(this.width / 2 - 350, this.height / 2 + 180);
  this.math_escape_glyph.scale.set(0.6, 0.6)
  this.math_escape_glyph.tint = 0x000000;
  this.math_escape_glyph.alpha = 0.6;
  this.math_popup.addChild(this.math_escape_glyph);

  this.math_escape_text = new PIXI.Text("Escape", {fontFamily: default_font, fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "left"});
  this.math_escape_text.anchor.set(0,1);
  this.math_escape_text.position.set(this.width / 2 - 270, this.height / 2 + 168);
  this.math_escape_text.alpha = 0.6;
  this.math_popup.addChild(this.math_escape_text);

  this.math_enter_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/enter_button.png"));
  this.math_enter_glyph.anchor.set(0,1);
  this.math_enter_glyph.position.set(this.width / 2 + 150, this.height / 2 + 180);
  this.math_enter_glyph.scale.set(0.6, 0.6)
  this.math_enter_glyph.tint = 0x000000;
  this.math_enter_glyph.alpha = 0.6;
  this.math_popup.addChild(this.math_enter_glyph);

  this.math_enter_text = new PIXI.Text("Enter", {fontFamily: default_font, fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "left"});
  this.math_enter_text.anchor.set(0,1);
  this.math_enter_text.position.set(this.width / 2 + 230, this.height / 2 + 168);
  this.math_enter_text.alpha = 0.6;
  this.math_popup.addChild(this.math_enter_text);
}


/**
 * Show a math popup with a problem to solve
 * @param {PIXI.Container} parent_screen - The screen to add the popup to
 * @param {Function} success_callback - Called when answer is correct (with no arguments)
 * @param {Function} cancel_callback - Called when user presses Escape (with no arguments)
 */
Game.prototype.showMathPopup = function(parent_screen, success_callback, cancel_callback) {
  var self = this;

  // Generate random subtraction problem (single-digit, positive result)
  let num1 = Math.floor(Math.random() * 9) + 1; // 1-9
  let num2 = Math.floor(Math.random() * num1) + 0; // 0 to num1 (ensures positive result)
  this.math_correct_answer = num1 - num2;

  this.math_problem_text.text = num1 + " - " + num2 + " = ";
  this.math_answer = "";
  this.math_answer_text.text = "";
  this.math_success_callback = success_callback;
  this.math_cancel_callback = cancel_callback;
  this.math_parent_screen = parent_screen;

  // Add popup to the parent screen
  parent_screen.addChild(this.math_popup);

  this.math_popup_visible = true;
  this.math_popup.visible = true;
}


Game.prototype.hideMathPopup = function() {
  var self = this;

  this.math_popup_visible = false;
  this.math_popup.visible = false;
  this.math_answer = "";
  this.math_answer_text.text = "";
  this.math_answer_text.style.fill = 0x000000; // Reset to black
  this.math_answer_is_wrong = false;

  // Remove from parent screen
  if (this.math_parent_screen && this.math_popup.parent) {
    this.math_parent_screen.removeChild(this.math_popup);
  }

  this.math_success_callback = null;
  this.math_cancel_callback = null;
  this.math_parent_screen = null;
}


/**
 * Handle keyboard input for the math popup
 * Returns true if input was handled, false otherwise
 */
Game.prototype.handleMathPopupInput = function(key) {
  if (!this.math_popup_visible) {
    return false;
  }

  if (key === "Escape") {
    if (this.math_cancel_callback) {
      this.math_cancel_callback();
    }
    this.hideMathPopup();
    return true;
  }

  // Handle number input (0-9)
  if (key >= '0' && key <= '9') {
    this.addMathType(key);
    return true;
  }

  if (key === "Backspace" || key === "Delete") {
    this.deleteMathType();
    return true;
  }

  if (key === "Enter") {
    this.checkMathAnswer();
    return true;
  }

  return true; // Block all other input when math popup is visible
}


Game.prototype.addMathType = function(digit) {
  var self = this;

  // If answer is wrong, require backspace to clear before typing new digits
  if (this.math_answer_is_wrong) {
    return;
  }

  if (use_voice) {
    soundEffect(digit.toLowerCase());
  }

  // Allow unlimited digits (for future expansion of math operations)
  this.math_answer += digit;
  this.math_answer_text.text = this.math_answer;
}


Game.prototype.deleteMathType = function() {
  var self = this;
  var screen = this.math_parent_screen;

  if (!screen) return;

  if (this.math_answer.length > 0) {
    let l = this.math_answer.slice(-1);
    let t = new PIXI.Text(l, {fontFamily: default_font, fontSize: 100, fill: 0x000000, letterSpacing: 5, align: "left"});

    // If answer was wrong, make falling digits red
    if (this.math_answer_is_wrong) {
      t.style.fill = 0xCC3333; // Match the softer red
    }

    t.anchor.set(0, 0.5);

    // Calculate position based on the answer text's actual position and width
    // Measure the width of the text before the last character
    let measure = new PIXI.TextMetrics.measureText(this.math_answer.slice(0, -1), this.math_answer_text.style);
    t.position.set(this.math_answer_text.x + measure.width, this.math_answer_text.y);

    t.vx = -20 + 40 * Math.random();
    t.vy = -5 + -20 * Math.random();
    t.floor = 1200;
    screen.addChild(t);
    this.freefalling.push(t);

    this.math_answer = this.math_answer.slice(0, -1);
    this.math_answer_text.text = this.math_answer;
    soundEffect("swipe");

    // If we've cleared all wrong digits, reset the wrong state
    if (this.math_answer.length === 0) {
      this.math_answer_is_wrong = false;
      this.math_answer_text.style.fill = 0x000000; // Reset to black
    }
  }
}


Game.prototype.checkMathAnswer = function() {
  var self = this;

  if (this.math_answer === "") return;

  let answer = parseInt(this.math_answer);

  if (answer === this.math_correct_answer) {
    soundEffect("success");
    flicker(this.math_answer_text, 300, 0x000000, 0xFFFFFF);

    // Save callback reference before hiding popup
    let success_callback = this.math_success_callback;

    delay(function() {
      self.hideMathPopup();
      if (success_callback) {
        success_callback();
      }
    }, 300);
  } else {
    // Wrong answer - turn red and require backspace to clear
    soundEffect("swipe");
    this.math_answer_is_wrong = true;
    this.math_answer_text.style.fill = 0xCC3333; // Softer red/crimson color
  }
}
