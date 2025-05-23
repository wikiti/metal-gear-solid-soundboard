import { Howl, Howler } from 'howler';

class AudioService {
  constructor() {
    this.sounds = {};
    this.currentStage = null;
    this.timeouts = [];
    this.intervals = [];
    this.activeOverride = null;
    
    // Volume control properties
    this.masterVolume = localStorage.getItem('mgs-master-volume') || 1.0;
    this.isMuted = localStorage.getItem('mgs-muted') === 'true' || false;
    this.previousVolume = this.masterVolume; // Store volume for unmute
    
    // For error handling
    this.errorListeners = [];
    
    // For playing override listeners
    this.overrideUpdateListeners = [];
    
    // Initialize Howler master volume
    this.applyMasterVolume();
  }

  // Error event subscription
  onError(listener) {
    this.errorListeners.push(listener);
    return () => {
      this.errorListeners = this.errorListeners.filter(l => l !== listener);
    };
  }

  onOverrideUpdate(listener) {
    this.overrideUpdateListeners.push(listener);
    return () => {
      this.overrideUpdateListeners = this.overrideUpdateListeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners about an error
  emitError(error) {
    console.error(`Failed to load audio source '${error.id}'`, error);
    this.errorListeners.forEach(listener => listener(error));
  }

  emitOverrideUpdate(override) {
    this.overrideUpdateListeners.forEach(listener => listener(override));
  }

  // Apply the current volume setting to Howler global volume
  applyMasterVolume() {
    Howler.volume(this.isMuted ? 0 : this.masterVolume);
  }
  
  // Set a new volume level (0 to 1)
  setVolume(volume) {
    this.masterVolume = volume;
    this.previousVolume = volume;
    localStorage.setItem('mgs-master-volume', volume);
    this.applyMasterVolume();
  }

  setMute(isMuted) {
    this.isMuted = isMuted;
    localStorage.setItem('mgs-muted', isMuted);
    this.applyMasterVolume();
  }
  
  // Get current volume state
  getVolumeState() {
    return {
      volume: this.masterVolume,
      isMuted: this.isMuted
    };
  }

  loadSounds(soundData) {
    // Load music tracks (with loop enabled)
    soundData.sources.music.forEach(item => {
      const customLoop = !!(item.loop_start != null || item.loop_end != null);

      this.sounds[item.id] = new Howl({
        src: [item.src],
        loop: !customLoop,
        preload: item.preload || false,
        html5: true,
        volume: item.volume != null ? item.volume : 1.0,
        onloaderror: () => {
          this.emitError({ type: 'music', ...item });
        },
        onplay: () => {
          if (!customLoop) {
            return;
          }

          const music = this.sounds[item.id];
          this.clearIntervals();

          const loopInterval = setInterval(() => {
            if (music.seek() >= item.loop_end) {
              music.seek(item.loop_start);
            }
          }, 10);

          this.intervals.push(loopInterval);
        }
      });

      this.sounds[item.id].meta = { type: 'music' };
    });
    
    // Load sound effects (no loop)
    soundData.sources.sounds.forEach(item => {
      this.sounds[item.id] = new Howl({
        src: [item.src],
        loop: false,
        preload: item.preload || false,
        html5: true,
        volume: item.volume != null ? item.volume : 1.0,
        onloaderror: () => {
          this.emitError({ type: 'sound', ...item });
        }
      });

      this.sounds[item.id].meta = { type: 'sound' };
    });
  }

  playStage(stageId, stages, resume = false) {
    // Find the stage
    const stage = stages.find(s => s.id === stageId);
    if (!stage || !stage.music) return;

    this.stopAllMusic();

    // Save previous and current stage
    this.currentStage = stage;

    // Clear any active override
    this.activeOverride = null;

    // Play the stage music
    const music = this.sounds[stage.music];
    if (music) {
      if (resume) {
        // Resume the previous stage if applicable
        music.seek(music.meta.paused_at || 0);
      }

      music.play();
      music.meta.paused_at = null;
    }

    this.emitOverrideUpdate(null);
  }

  playOverride(override) {
    // Keep track of pause timestamp
    if (this.currentStage) {
      const music = this.sounds[this.currentStage.music];
      music.meta.paused_at = music.seek();
    }

    // Stop current music and clear any pending sounds
    this.stopAllMusic();
    this.clearTimeouts();
    
    // Set this as the active override
    this.activeOverride = override.id;
    
    // Play each sound in the sequence with the specified delays
    override.play.forEach(sound => {
      if (!sound.id) {
        return;
      }

      const timeout = setTimeout(() => {
        if (this.sounds[sound.id]) {
          this.sounds[sound.id].play();
        }
      }, sound.delay * 1000);
      this.timeouts.push(timeout);
    });

    this.emitOverrideUpdate(override);

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

  resumeStage(stages) {
    if (this.currentStage) {
      this.playStage(this.currentStage.id, stages, true);
    }
  }

  stopAllMusic() {
    // Stop all music tracks (not sound effects)
    Object.values(this.sounds).forEach(sound => {
      if (sound.meta.type === 'music') {
        sound.stop();
      }
    });

    this.clearIntervals();
  }

  clearTimeouts() {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts = [];
  }

  clearIntervals() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
  }

  // New method to check if buttons should be shown based on filters
  isAudioAvaible(filters) {
    if (!filters) return true;

    let available = true;

    if (filters?.override?.in) {
      available &&= this.activeOverride != null && filters.override.in.includes(this.activeOverride);
    }
    if (filters?.override?.not_in) {
      available &&= this.activeOverride == null || !filters.override.not_in.includes(this.activeOverride);
    }

    if (filters?.stage?.in) {
      available &&= this.currentStage != null && filters.stage.in.includes(this.currentStage.id);
    }
    if (filters?.stage?.not_in) {
      available &&= this.currentStage == null || !filters.stage.not_in.includes(this.currentStage.id);
    }

    return available;
  }
}

const defaultAudioService = new AudioService();

export default defaultAudioService;
