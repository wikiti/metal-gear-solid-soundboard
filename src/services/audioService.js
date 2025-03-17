import { Howl } from 'howler';

class AudioService {
  constructor() {
    this.sounds = {};
    this.currentStage = null;
    this.previousStage = null;
    this.timeouts = [];
  }

  loadSounds(soundData) {
    // Load music tracks (with loop enabled)
    soundData.sources.music.forEach(item => {
      this.sounds[item.id] = new Howl({
        src: [item.src],
        loop: true,
        preload: item.preload || false,
        html5: true
      });
    });
    
    // Load sound effects (no loop)
    soundData.sources.sounds.forEach(item => {
      this.sounds[item.id] = new Howl({
        src: [item.src],
        loop: false,
        preload: item.preload || false,
        html5: true
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
    
    // Play the stage music
    if (this.sounds[stage.music]) {
      this.sounds[stage.music].play();
    }
  }

  playOverride(override) {
    // Stop current music and clear any pending sounds
    this.stopAllMusic();
    this.clearTimeouts();
    
    // Play each sound in the sequence with the specified delays
    override.play.forEach(sound => {
      const timeout = setTimeout(() => {
        if (this.sounds[sound.id]) {
          this.sounds[sound.id].play();
        }
      }, sound.delay * 1000);
      this.timeouts.push(timeout);
    });
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
}

const defaultAudioService = new AudioService();

export default defaultAudioService;
