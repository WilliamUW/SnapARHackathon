import {Interactable} from "../Interaction/Interactable/Interactable"
import {validate} from "../../Utils/validate"
/**
 * This class provides audio feedback for interactable objects. It allows configuration of audio tracks for hover, trigger start, trigger end, and hold events. The class also provides access to the audio component for further customization.
 */
@component
export class InteractableAudioFeedback extends BaseScriptComponent {
  @input("Asset.AudioTrackAsset")
  @hint("This sound will play when the Interactable is hovered")
  @allowUndefined
  hoverAudioTrack: AudioTrackAsset | undefined

  @input("Asset.AudioTrackAsset")
  @hint("This sound will play when starting the trigger the Interactable")
  @allowUndefined
  triggerStartAudioTrack: AudioTrackAsset | undefined

  @input("Asset.AudioTrackAsset")
  @hint("This sound will play when ending the trigger of the Interactable")
  @allowUndefined
  triggerEndAudioTrack: AudioTrackAsset | undefined

  @input("Asset.AudioTrackAsset")
  @hint("This sound will play when holding the Interactable")
  @allowUndefined
  holdAudioTrack: AudioTrackAsset | undefined

  private _hoverAudioComponent: AudioComponent | undefined
  private _triggerStartAudioComponent: AudioComponent | undefined
  private _triggerEndAudioComponent: AudioComponent | undefined
  private _holdAudioComponent: AudioComponent | undefined
  private interactable: Interactable | null = null
  private isHolding: boolean = false

  onAwake(): void {
    this.defineScriptEvents()
  }

  private defineScriptEvents() {
    this.createEvent("OnStartEvent").bind(() => {
      this.init()
    })
  }

  /**
   * Returns the AudioComponent used for hover feedback for further configuration (such as volume).
   */
  get hoverAudioComponent(): AudioComponent | undefined {
    return this._hoverAudioComponent
  }

  /**
   * Returns the AudioComponent used for trigger start feedback for further configuration (such as volume).
   */
  get triggerStartAudioComponent(): AudioComponent | undefined {
    return this._triggerStartAudioComponent
  }

  /**
   * Returns the AudioComponent used for trigger end feedback for further configuration (such as volume).
   */
  get triggerEndAudioComponent(): AudioComponent | undefined {
    return this._triggerEndAudioComponent
  }

  /**
   * Returns the AudioComponent used for hold feedback for further configuration (such as volume).
   */
  get holdAudioComponent(): AudioComponent | undefined {
    return this._holdAudioComponent
  }

  private setupInteractableCallbacks() {
    validate(this.interactable)

    this.interactable.onHoverEnter.add(() => {
      try {
        if (this._hoverAudioComponent) {
          this._hoverAudioComponent.play(1)
        }
      } catch (e) {
        print("Error playing hover audio: " + e)
      }
    })

    this.interactable.onTriggerStart.add(() => {
      try {
        if (this._triggerStartAudioComponent) {
          this._triggerStartAudioComponent.play(1)
        }
        if (this._holdAudioComponent) {
          if (!this.isHolding) {
            this._holdAudioComponent.play(-1)
            this.isHolding = true
          } else {
            this._holdAudioComponent.stop(true)
            this.isHolding = false
          }
        }
      } catch (e) {
        print("Error playing trigger start audio: " + e)
      }
    })

    this.interactable.onTriggerEnd.add(() => {
      try {
        if (this._triggerEndAudioComponent) {
          this._triggerEndAudioComponent.play(1)
        }
      } catch (e) {
        print("Error playing trigger end audio: " + e)
      }
    })
  }

  private init() {
    if (this.hoverAudioTrack) {
      this._hoverAudioComponent = this.getSceneObject().createComponent(
        "Component.AudioComponent",
      ) as AudioComponent

      this.setPlaybackMode(
        this._hoverAudioComponent,
        Audio.PlaybackMode?.LowLatency,
      )
      this._hoverAudioComponent.audioTrack = this.hoverAudioTrack
    }

    if (this.triggerStartAudioTrack) {
      this._triggerStartAudioComponent = this.getSceneObject().createComponent(
        "Component.AudioComponent",
      ) as AudioComponent

      this.setPlaybackMode(
        this._triggerStartAudioComponent,
        Audio.PlaybackMode?.LowLatency,
      )
      this._triggerStartAudioComponent.audioTrack = this.triggerStartAudioTrack
    }

    if (this.triggerEndAudioTrack) {
      this._triggerEndAudioComponent = this.getSceneObject().createComponent(
        "Component.AudioComponent",
      ) as AudioComponent

      this.setPlaybackMode(
        this._triggerEndAudioComponent,
        Audio.PlaybackMode?.LowLatency,
      )
      this._triggerEndAudioComponent.audioTrack = this.triggerEndAudioTrack
    }

    if (this.holdAudioTrack) {
      this._holdAudioComponent = this.getSceneObject().createComponent(
        "Component.AudioComponent",
      ) as AudioComponent

      this.setPlaybackMode(
        this._holdAudioComponent,
        Audio.PlaybackMode?.LowLatency,
      )
      this._holdAudioComponent.audioTrack = this.holdAudioTrack
    }

    this.interactable = this.getSceneObject().getComponent(
      Interactable.getTypeName(),
    )

    if (!this.interactable) {
      throw new Error(
        "Could not find Interactable component on this SceneObject.",
      )
    }

    this.setupInteractableCallbacks()
  }

  private setPlaybackMode(
    target: AudioComponent,
    playbackMode: Audio.PlaybackMode | undefined,
  ) {
    if (playbackMode !== undefined) {
      target.playbackMode = playbackMode
    }
  }
}
