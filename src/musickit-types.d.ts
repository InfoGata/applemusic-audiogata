/// <reference types="@types/musickit-js" />

declare namespace MusicKit {
  /**
   * Fixed MusicKit type definitions with correct Promise return types
   * These override the incorrect types from @types/musickit-js
   */

  /**
   * Apple Music API response structures
   */
  interface APIResponse<T = any> {
    data: T;
    meta?: {
      results?: {
        order: string[];
        rawOrder: string[];
      };
      metrics?: {
        dataSetId: string;
      };
    };
  }

  interface SearchResponse {
    data: {
      results: SearchResults;
      meta?: {
        results?: {
          order: string[];
          rawOrder: string[];
        };
        metrics?: {
          dataSetId: string;
        };
      };
    };
  }

  interface SearchResults {
    top?: SearchResultGroup;
    artists?: SearchResultGroup;
    albums?: SearchResultGroup;
    songs?: SearchResultGroup;
    playlists?: SearchResultGroup;
    stations?: SearchResultGroup;
    'music-videos'?: SearchResultGroup;
    'video-extras'?: SearchResultGroup;
  }

  interface SearchResultGroup {
    href?: string;
    next?: string;
    data: any[];
    name: string;
    groupId: string;
  }

  interface API {
    music(endpoint: string, queryParameters?: any): Promise<SearchResponse>;
  }

  /**
   * Configure a MusicKit instance.
   * @param configuration Configuration options for the MusicKit instance
   * @returns Promise that resolves to a MusicKitInstance
   */
  function configure(configuration: Configuration): Promise<MusicKitInstance>;

  /**
   * Fixed MusicKitInstance interface with correct Promise return types
   */
  interface MusicKitInstance {
    /**
     * An instance of the MusicKit API.
     */
    readonly api: API;
    
    /**
     * The current bit rate of the music player.
     */
    readonly bitrate: PlaybackBitrate;
    
    /**
     * The developer token to identify yourself as a trusted developer and
     * member of the Apple Developer Program.
     */
    readonly developerToken: string;
    
    /**
     * A Boolean value indicating whether the user has authenticated and
     * authorized the application for use.
     */
    readonly isAuthorized: boolean;
    
    /**
     * A user token used to access personalized Apple Music content.
     */
    readonly musicUserToken: string;
    
    /**
     * The current playback state of the music player.
     */
    readonly playbackState: PlaybackStates;
    
    /**
     * A Boolean value that indicates if a playback target is available.
     */
    readonly playbackTargetAvailable: boolean;
    
    /**
     * An instance of the MusicKit player.
     */
    readonly player: Player;
    
    /**
     * The current storefront for the configured MusicKit instance.
     */
    readonly storefrontId: string;
    
    /**
     * Add an event listener for a MusicKit instance by name.
     */
    addEventListener<T extends keyof Events>(name: T, callback: (event: Events[T]) => any): void;
    
    /**
     * Add items to user's library
     */
    addToLibrary(id: any, type: any): Promise<any>;
    
    /**
     * Returns a promise containing a music user token when a user has
     * authenticated and authorized the app.
     */
    authorize(): Promise<string>;
    
    /**
     * Begins playing the media item at the specified index in the queue.
     */
    changeToMediaAtIndex(index: number): Promise<number>;
    
    /**
     * Pauses playback of the media player.
     */
    pause(): void;
    
    /**
     * Begins playback of the current media item.
     */
    play(): Promise<MediaItemPosition>;
    
    /**
     * Add items to play later in the queue.
     */
    playLater(options: SetQueueOptions): Promise<void>;
    
    /**
     * Add items to play next in the queue.
     */
    playNext(options: SetQueueOptions): Promise<void>;
    
    /**
     * Removes an event listener for a MusicKit instance by name.
     */
    removeEventListener(name: string, callback?: () => any): void;
    
    /**
     * Sets the playback point to a specified time.
     * Fixed return type: Promise<void> instead of Promise<any>
     */
    seekToTime(time: number): Promise<void>;
    
    /**
     * Sets a music player's playback queue using queue options.
     */
    setQueue(options: SetQueueOptions): Promise<Queue>;
    
    /**
     * Starts playback of the next media item in the playback queue.
     */
    skipToNextItem(): Promise<MediaItemPosition>;
    
    /**
     * Starts playback of the previous media item in the playback queue.
     */
    skipToPreviousItem(): Promise<MediaItemPosition>;
    
    /**
     * Stops playback of the media player.
     */
    stop(): void;
    
    /**
     * Unauthorizes the app for the current user.
     * Fixed return type: Promise<void> instead of Promise<any>
     */
    unauthorize(): Promise<void>;
  }

  /**
   * Fixed Player interface with correct Promise return types
   */
  interface Player {
    /**
     * The current bit rate of the music player.
     */
    readonly bitrate: number;
    
    /**
     * The music player has EME loaded.
     */
    readonly canSupportDRM: boolean;
    
    /**
     * The current playback duration.
     */
    readonly currentPlaybackDuration: number;
    
    /**
     * The current playback progress.
     */
    readonly currentPlaybackProgress: number;
    
    /**
     * The current position of the playhead.
     */
    readonly currentPlaybackTime: number;
    
    /**
     * No description available.
     */
    readonly currentPlaybackTimeRemaining: number;
    
    /**
     * The current playback duration in hours and minutes.
     */
    readonly formattedCurrentPlaybackDuration: FormattedPlaybackDuration;
    
    /**
     * A Boolean value indicating whether the player is currently playing.
     */
    readonly isPlaying: boolean;
    
    /**
     * The currently-playing media item, or the media item, within an queue,
     * that you have designated to begin playback.
     */
    readonly nowPlayingItem: MediaItem;
    
    /**
     * The index of the now playing item in the current playback queue.
     */
    readonly nowPlayingItemIndex?: number | undefined;
    
    /**
     * The current playback rate for the player.
     */
    readonly playbackRate: number;
    
    /**
     * The current playback state of the music player.
     */
    readonly playbackState: PlaybackStates;
    
    /**
     * A Boolean value that indicates whether a playback target is available.
     */
    readonly playbackTargetAvailable?: boolean | undefined;
    
    /**
     * The current playback queue of the music player.
     */
    readonly queue: Queue;
    
    /**
     * The current repeat mode of the music player.
     */
    repeatMode: PlayerRepeatMode;
    
    /**
     * The current shuffle mode of the music player.
     */
    shuffleMode: PlayerShuffleMode;
    
    /**
     * A number indicating the current volume of the music player.
     */
    volume: number;
    
    /**
     * Adds an event listener as a callback for an event name.
     */
    addEventListener(name: string, callback: () => any): void;
    
    /**
     * Begins playing the media item at the specified index in the queue immediately.
     */
    changeToMediaAtIndex(index: number): Promise<MediaItemPosition>;
    
    /**
     * Begins playing the media item in the queue immediately.
     */
    changeToMediaItem(descriptor: Descriptor): Promise<MediaItemPosition>;
    
    /**
     * Sets the volume to 0.
     */
    mute(): void;
    
    /**
     * Pauses playback of the current item.
     */
    pause(): void;
    
    /**
     * Initiates playback of the current item.
     * Returns Promise<MediaItemPosition> to match actual implementation
     */
    play(): Promise<MediaItemPosition>;
    
    /**
     * Prepares a music player for playback.
     */
    prepareToPlay(descriptor: Descriptor): Promise<void>;
    
    /**
     * Removes an event listener.
     */
    removeEventListener(name: string, callback: () => any): void;
    
    /**
     * Sets the playback point to a specified time.
     * Fixed return type: Promise<void> instead of Promise<any>
     */
    seekToTime(time: number): Promise<void>;
    
    /**
     * Displays the playback target picker if a playback target is available.
     */
    showPlaybackTargetPicker(): void;
    
    /**
     * Starts playback of the next media item in the playback queue.
     */
    skipToNextItem(): Promise<MediaItemPosition>;
    
    /**
     * Starts playback of the previous media item in the playback queue.
     */
    skipToPreviousItem(): Promise<MediaItemPosition>;
    
    /**
     * Stops the currently playing media item.
     */
    stop(): void;
  }
}