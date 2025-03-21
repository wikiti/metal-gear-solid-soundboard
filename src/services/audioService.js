import { Howl } from 'howler';

class AudioService {
  constructor() {
    this.sounds = {};
    this.currentStage = null;
    this.previousStage = null;
    this.timeouts = [];
    this.activeOverride = null; // Track active override
  }

  loadSounds(soundData) {
    // Load music tracks (with loop enabled)
    soundData.sources.music.forEach(item => {
      this.sounds[item.id] = new Howl({
        src: [item.src],
        loop: true,
        preload: item.preload || false,
        html5: true,
        volume: item.volume != null ? item.volume : 1.0
      });
    });
    
    // Load sound effects (no loop)
    soundData.sources.sounds.forEach(item => {
      this.sounds[item.id] = new Howl({
        src: [item.src],
        loop: false,
        preload: item.preload || false,
        html5: true,
        volume: item.volume != null ? item.volume : 1.0
      });
    });
  }

  playStage(stageId, stages) {
    // Find the stage
    const stage = stages.find(s => s.id === stageId);
    if (!stage || !stage.music) return;

    // Stop current music if any
    this.stopAllMusic();
    
    // Save previous and current stage
    this.previousStage = this.currentStage;
    this.currentStage = stageId;
    
    // Clear any active override
    this.activeOverride = null;
    
    // Play the stage music
    if (this.sounds[stage.music]) {
      this.sounds[stage.music].play();
    }
  }

  playOverride(override) {
    // Stop current music and clear any pending sounds
    this.stopAllMusic();
    this.clearTimeouts();
    
    // Set this as the active override
    this.activeOverride = override.id;
    
    // Play each sound in the sequence with the specified delays
    override.play.forEach(sound => {
      const timeout = setTimeout(() => {
        if (this.sounds[sound.id]) {
          this.sounds[sound.id].play();
        }
      }, sound.delay * 1000);
      this.timeouts.push(timeout);
    });
    
    // If there's a natural end to this override sequence, clear it
    // For now we'll assume the override stays active until manually cleared
  }

  playSfx(sfx) {
    // Play each sound without stopping music
    sfx.play.forEach(sound => {
      if (this.sounds[sound.id]) {
        // Create a new instance to allow overlapping sounds
        this.sounds[sound.id].play();
      }
    });
  }

  resumePreviousStage(stages) {
    if (this.previousStage) {
      this.playStage(this.previousStage, stages);
    }
  }

  stopAllMusic() {
    // Stop all music tracks (not sound effects)
    Object.values(this.sounds).forEach(sound => {
      if (sound.loop()) {
        sound.stop();
      }
    });
  }

  clearTimeouts() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts = [];
  }

  // New method to check if buttons should be shown based on filters
  isSfxAvailable(buttonFilters) {
    if (!buttonFilters) return true;

    let available = true;

    if (buttonFilters.debug) {
      console.log("buttonFilters", buttonFilters);
      console.log("this.activeOverride", this.activeOverride);
      console.log("buttonFilters.override.in", buttonFilters.override.in);
      console.log("buttonFilters.override.not_in", buttonFilters.override.not_in);
    }

    if (buttonFilters.override.in) {
      available &&= this.activeOverride != null && buttonFilters.override.in.includes(this.activeOverride);
    }
    if (buttonFilters.override.not_in) {
      available &&= this.activeOverride == null || !buttonFilters.override.not_in.includes(this.activeOverride);
    }

    if (buttonFilters.debug) {
      console.log("available", available);
    }

    return available;
  }
}

const defaultAudioService = new AudioService();

export default defaultAudioService;
