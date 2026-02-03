//
// This file contains general sound effect and music utilities based on Howl.js.
//
// Copyright 2023 Alpha Zoo LLC.
// Written by Matthew Carlin
//

var use_music = true;
var use_sound = true;
var use_voice = true;

let music_volume = 0.4;
let sound_volume = 0.6;
let current_music = null;
let old_music = null;

let sound_files = [
  ["success","success.wav"],
  ["swipe","swipe.wav"],
  ["pop","pop.wav"],
  ["puff","puff.wav"],
  ["throw","throw.wav"],
  ["slurp","slurp.wav"],
  ["build","build.wav"],
  ["coin","coin.wav"],
  ["clunk","clunk.wav"],
  ["jump","jump.wav"],
  ["tree_shake","tree_shake.wav"],
  ["poop_1","poop_1.mp3"],
  ["poop_2","poop_2.mp3"],
  ["poop_3","poop_3.mp3"],
  ["breeze","breeze.mp3"],
  ["train_whistle","train_whistle.mp3"],
  ["train_rolling","train_rolling.mp3"],
  ["background_music","Chris Haugen - Campfire Song.mp3"],
  ["chomp_1","chomp_1.mp3"],
  ["chomp_2","chomp_2.mp3"],
  ["rhino","Animals/rhino.mp3"],
  ["otter","Animals/otter.mp3"],
  ["hippo","Animals/hippo.mp3"],
  ["lion","Animals/lion.mp3"],
  ["cheetah","Animals/cheetah.mp3"],
  ["tiger","Animals/tiger.mp3"],
  ["panther","Animals/panther.mp3"],
  ["alligator","Animals/alligator.mp3"],
  ["dog","Animals/dog.mp3"],
  ["fox","Animals/fox.mp3"],
  ["parrot","Animals/parrot.mp3"],
  ["gorilla","Animals/gorilla.mp3"],
  ["zebra","Animals/zebra.mp3"],
  ["snake","Animals/snake.mp3"],
  ["giraffe","Animals/giraffe.mp3"],
  ["cat","Animals/cat.mp3"],
  ["mouse","Animals/mouse.mp3"],
  ["elephant","Animals/elephant.mp3"],
  ["bear","Animals/bear.mp3"],
  ["cow","Animals/cow.mp3"],
  ["chicken","Animals/chicken.mp3"],
  ["frog","Animals/frog.mp3"],
  ["owl","Animals/owl.mp3"],
  ["yak","Animals/yak.mp3"],
  ["pig","Animals/pig.mp3"],
  ["sheep","Animals/sheep.mp3"],
  ["seal","Animals/seal.mp3"],
  ["deer","Animals/deer.mp3"],
  ["moose","Animals/moose.mp3"],
  ["baboon","Animals/baboon.mp3"],
  ["horse","Animals/horse.mp3"],
  ["wolf","Animals/wolf.mp3"],
  ["penguin","Animals/penguin.mp3"],
  ["chimpanzee","Animals/chimpanzee.mp3"],
  ["capybara","Animals/capybara.mp3"],
  ["kangaroo","Animals/kangaroo.mp3"],
  ["meerkat","Animals/meerkat.mp3"],
  ["camel","Animals/camel.mp3"],
  ["goat","Animals/goat.mp3"],
  ["rabbit","Animals/rabbit.mp3"],
  ["alpaca","Animals/alpaca.mp3"],
  ["peacock","Animals/peacock.mp3"],
  ["lemur","Animals/lemur.mp3"],
  ["orangutan","Animals/orangutan.mp3"],
  ["ostrich","Animals/ostrich.mp3"],
  ["flamingo","Animals/flamingo.mp3"],
  ["swan","Animals/swan.mp3"],
  ["goose","Animals/goose.mp3"],
  ["duck","Animals/duck.mp3"],
  ["a4","Marimba/a4.wav"],
  ["b4","Marimba/b4.wav"],
  ["c4","Marimba/c4.wav"],
  ["d4","Marimba/d4.wav"],
  ["e4","Marimba/e4.wav"],
  ["f4","Marimba/f4.wav"],
  ["g4","Marimba/g4.wav"],
  ["a5","Marimba/a5.wav"],
  ["b5","Marimba/b5.wav"],
  ["c5","Marimba/c5.wav"],
  ["d5","Marimba/d5.wav"],
  ["e5","Marimba/e5.wav"],
  ["f5","Marimba/f5.wav"],
  ["g5","Marimba/g5.wav"],
  ["a", "Spoken/a.mp3"],
  ["b", "Spoken/b.mp3"],
  ["c", "Spoken/c.mp3"],
  ["d", "Spoken/d.mp3"],
  ["e", "Spoken/e.mp3"],
  ["f", "Spoken/f.mp3"],
  ["g", "Spoken/g.mp3"],
  ["h", "Spoken/h.mp3"],
  ["i", "Spoken/i.mp3"],
  ["j", "Spoken/j.mp3"],
  ["k", "Spoken/k.mp3"],
  ["l", "Spoken/l.mp3"],
  ["m", "Spoken/m.mp3"],
  ["n", "Spoken/n.mp3"],
  ["o", "Spoken/o.mp3"],
  ["p", "Spoken/p.mp3"],
  ["q", "Spoken/q.mp3"],
  ["r", "Spoken/r.mp3"],
  ["s", "Spoken/s.mp3"],
  ["t", "Spoken/t.mp3"],
  ["u", "Spoken/u.mp3"],
  ["v", "Spoken/v.mp3"],
  ["w", "Spoken/w.mp3"],
  ["x", "Spoken/x.mp3"],
  ["y", "Spoken/y.mp3"],
  ["z", "Spoken/z.mp3"],
  ["spoken_cat", "Spoken/cat.mp3"],
  ["spoken_meerkat", "Spoken/meerkat.mp3"],
  ["spoken_red_panda", "Spoken/red_panda.mp3"],
  ["spoken_horse", "Spoken/horse.mp3"],
  ["spoken_goat", "Spoken/goat.mp3"],
  ["spoken_elk", "Spoken/elk.mp3"],
  ["spoken_camel", "Spoken/camel.mp3"],
  ["spoken_lion", "Spoken/lion.mp3"],
  ["spoken_cheetah", "Spoken/cheetah.mp3"],
  ["spoken_tiger", "Spoken/tiger.mp3"],
  ["spoken_panther", "Spoken/panther.mp3"],
  ["spoken_lynx", "Spoken/lynx.mp3"],
  ["spoken_gazelle", "Spoken/gazelle.mp3"],
  ["spoken_elephant", "Spoken/elephant.mp3"],
  ["spoken_giraffe", "Spoken/giraffe.mp3"],
  ["spoken_rhino", "Spoken/rhino.mp3"],
  ["spoken_yak", "Spoken/yak.mp3"],
  ["spoken_hippo", "Spoken/hippo.mp3"],
  ["spoken_baboon", "Spoken/baboon.mp3"],
  ["spoken_deer", "Spoken/deer.mp3"],
  ["spoken_zebra", "Spoken/zebra.mp3"],
  ["spoken_alpaca", "Spoken/alpaca.mp3"],
  ["spoken_brown_bear", "Spoken/brown_bear.mp3"],
  ["spoken_black_bear", "Spoken/black_bear.mp3"],
  ["spoken_dog", "Spoken/dog.mp3"],
  ["spoken_cow", "Spoken/cow.mp3"],
  ["spoken_train", "Spoken/train.mp3"],
  ["spoken_chimpanzee", "Spoken/chimpanzee.mp3"],
  ["spoken_otter", "Spoken/otter.mp3"],
  ["spoken_snake", "Spoken/snake.mp3"],
  ["spoken_capybara", "Spoken/capybara.mp3"],
  ["spoken_beaver", "Spoken/beaver.mp3"],
  ["spoken_sloth", "Spoken/sloth.mp3"],
  ["spoken_koala", "Spoken/koala.mp3"],
  ["spoken_orangutan", "Spoken/orangutan.mp3"],
  ["spoken_lemur", "Spoken/lemur.mp3"],
  ["spoken_raccoon", "Spoken/raccoon.mp3"],
  ["spoken_mouse", "Spoken/mouse.mp3"],
  ["spoken_frog", "Spoken/frog.mp3"],
  ["spoken_rabbit", "Spoken/rabbit.mp3"],
  ["spoken_seal", "Spoken/seal.mp3"],
  ["spoken_kangaroo", "Spoken/kangaroo.mp3"],
  ["spoken_anteater", "Spoken/anteater.mp3"],
  ["spoken_alligator", "Spoken/alligator.mp3"],
  ["spoken_gorilla", "Spoken/gorilla.mp3"],
  ["spoken_peacock", "Spoken/peacock.mp3"],
  ["spoken_flamingo", "Spoken/flamingo.mp3"],
  ["spoken_ostrich", "Spoken/ostrich.mp3"],
  ["spoken_penguin", "Spoken/penguin.mp3"],
  ["spoken_chicken", "Spoken/chicken.mp3"],
  ["spoken_duck", "Spoken/duck.mp3"],
  ["spoken_goose", "Spoken/goose.mp3"],
  ["spoken_fox", "Spoken/fox.mp3"],
  ["spoken_swan", "Spoken/swan.mp3"],
  ["spoken_panda_bear", "Spoken/panda_bear.mp3"],
  ["spoken_turtle", "Spoken/turtle.mp3"],
  ["spoken_owl", "Spoken/owl.mp3"],
  ["spoken_parrot", "Spoken/parrot.mp3"],
  ["spoken_polar_bear", "Spoken/polar_bear.mp3"],
  ["spoken_llama", "Spoken/llama.mp3"],
  ["spoken_bighorn_sheep", "Spoken/bighorn_sheep.mp3"],
  ["spoken_warthog", "Spoken/warthog.mp3"],
  ["spoken_moose", "Spoken/moose.mp3"],
  ["spoken_pig", "Spoken/pig.mp3"],
  ["spoken_sheep", "Spoken/sheep.mp3"],
  ["spoken_wolf", "Spoken/wolf.mp3"],
  ["spoken_marimba", "Spoken/marimba.mp3"],
  ["spoken_ferris_wheel", "Spoken/ferris_wheel.mp3"],
  ["spoken_cafe", "Spoken/cafe.mp3"],
  ["spoken_gift_shop", "Spoken/gift_shop.mp3"],
]


let sound_data = [];
for (let i = 0; i < sound_files.length; i++) {
  file = sound_files[i];
  sound_data[file[0]] = new Howl({preload: true, src: ["Sound/" + file[1]]})
}


soundEffect = function(effect_name, volume=sound_volume) {
  if (use_sound && volume > 0) {
    var sound_effect = sound_data[effect_name];
    if (sound_effect != null) {
      sound_effect.volume(volume);
      sound_effect.play();
    }
  }
}


stopSoundEffect = function(effect_name) {
  if (sound_volume > 0) {
    var sound_effect = sound_data[effect_name];
    if (sound_effect != null) {
      sound_effect.stop();
    }
  }
}


stopAllSound = function() {
  for (const [key, value] of Object.entries(sound_data)) {
    sound_data[key].stop();
  }
}


pauseSoundEffect = function(effect_name) {
  if (sound_data[effect_name].playing() == true) {
    sound_data[effect_name].hold_up = true;
    sound_data[effect_name].pause();
  }
}


resumeSoundEffect = function(effect_name) {
  if (sound_data[effect_name] != null && sound_data[effect_name].hold_up == true) {
    sound_data[effect_name].hold_up = null;
    sound_data[effect_name].play();
  }
}


setMusic = function(music_name, loop = true) {
  if (use_music && music_volume > 0) {
    if (current_music != null && current_music.name == music_name) {
      return;
    }

    let crossfade = false;
    if (current_music != null && current_music.name != music_name) {
      crossfade = true;
      fadeMusic(500);
    }

    current_music = sound_data[music_name];
    if (current_music != null) {
      current_music.name = music_name;
      current_music.loop(loop);
      current_music.volume(music_volume);
      current_music.play();

      if (crossfade) {
        for (let i = 0; i < 14; i++) {
          delay(function() {
            current_music.volume(i / 20);
          }, 50 * i);
        }
      } else {
        current_music.volume(0.6);
      }
    }
  }
}


stopMusic = function() {
  if (current_music != null) {
    current_music.stop();
    current_music = null;
  }
}


fadeMusic = function(delay_time = 0) {
  if (current_music != null) {
    old_music = current_music;
    current_music = null;
    for (let i = 0; i < 14; i++) {
      delay(function() {
        old_music.volume((13 - i) / 20);
      }, delay_time + 50 * i);
    }
    setTimeout(function() {
      // TO DO
      // DELETE OLD MUSIC
      old_music = null;
    }, 1500);
  }
}

