import { MessageType, UiMessageType, MUSICKIT_TOKEN_URL } from "./shared";

let musicKit: MusicKit.MusicKitInstance;

const sendMessage = (message: MessageType) => {
  application.postUiMessage(message);
};

const getDeveloperToken = () => {
  return localStorage.getItem("developerToken") || "";
};

const getAppName = () => {
  return localStorage.getItem("appName") || "AudioGata Apple Music Plugin";
};

const getAppBuild = () => {
  return localStorage.getItem("appBuild") || "1.0.0";
};

function songToTrack(song: any): Track {
  return {
    apiId: song.id,
    name: song.attributes.name,
    artistName: song.attributes.artistName,
    artistApiId: song.relationships?.artists?.data?.[0]?.id,
    albumApiId: song.relationships?.albums?.data?.[0]?.id,
    duration: song.attributes.durationInMillis / 1000,
    images: song.attributes.artwork ? [{
      url: song.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300'),
      width: 300,
      height: 300
    }] : [],
    addtionalArtists: song.relationships?.artists?.data?.slice(1).map((artist: any) => ({
      name: artist.attributes?.name || "",
      apiId: artist.id
    })) || []
  };
}

function albumToAlbum(album: any): Album {
  return {
    apiId: album.id,
    name: album.attributes.name,
    artistName: album.attributes.artistName,
    artistApiId: album.relationships?.artists?.data?.[0]?.id,
    images: album.attributes.artwork ? [{
      url: album.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300'),
      width: 300,
      height: 300
    }] : [],
    addtionalArtists: album.relationships?.artists?.data?.slice(1).map((artist: any) => ({
      name: artist.attributes?.name || "",
      apiId: artist.id
    })) || []
  };
}

function artistToArtist(artist: any): Artist {
  return {
    apiId: artist.id,
    name: artist.attributes.name,
    images: artist.attributes.artwork ? [{
      url: artist.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300'),
      width: 300,
      height: 300
    }] : []
  };
}

function playlistToPlaylist(playlist: any): PlaylistInfo {
  return {
    apiId: playlist.id,
    name: playlist.attributes.name,
    images: playlist.attributes.artwork ? [{
      url: playlist.attributes.artwork.url.replace('{w}', '300').replace('{h}', '300'),
      width: 300,
      height: 300
    }] : []
  };
}

class AppleMusicPlayer {
  public name = "applemusic";

  constructor() {
    this.setupMusicKit();
  }

  public async setupMusicKit() {
    if (!window.MusicKit) {
      await this.loadMusicKitScript();
    }

    const developerToken = getDeveloperToken();
    if (!developerToken) return;

    return new Promise<void>((resolve) => {
      const initializeMusicKit = async() => {

        musicKit = await window.MusicKit.configure({
          developerToken: developerToken,
          app: {
            name: getAppName(),
            build: getAppBuild()
          }
        });

        musicKit.addEventListener('playbackStateDidChange', (event: any) => {
          this.handlePlaybackStateChange(event);
        });

        musicKit.addEventListener('playbackTimeDidChange', (event: any) => {
          application.setTrackTime(event.currentPlaybackTime);
        });
        
        resolve();
      };

      document.addEventListener('musickitloaded', initializeMusicKit, { once: true });
    });
  }

  private loadMusicKitScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = MUSICKIT_TOKEN_URL;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load MusicKit'));
      document.head.appendChild(script);
    });
  }

  private handlePlaybackStateChange(event: any) {
    switch (event.state) {
      case 'ended':
        application.endTrack();
        break;
      case 'paused':
        break;
      case 'playing':
        break;
    }
  }

  public async play(song: PlayTrackRequest) {
    if (!musicKit || !musicKit.isAuthorized) return;

    try {
      await musicKit.setQueue({
        song: song.apiId
      });
      
      if (song.seekTime) {
        await musicKit.seekToTime(song.seekTime);
      }
      
      await musicKit.play();
    } catch (error) {
      console.error('Error playing track:', error);
    }
  }

  public async pause() {
    if (musicKit) {
      musicKit.pause();
    }
  }

  public async resume() {
    if (musicKit) {
      await musicKit.play();
    }
  }

  public async seek(timeInSeconds: number) {
    if (musicKit) {
      await musicKit.seekToTime(timeInSeconds);
    }
  }

  public async setVolume(volume: number) {
    if (musicKit) {
      (musicKit as any).volume = volume;
    }
  }
}

async function searchAll(request: SearchRequest): Promise<SearchAllResult> {
  if (!musicKit || !musicKit.isAuthorized) {
    throw new Error('Not authorized');
  }

  const queryParameters = {
    term: request.query,
    types: ["songs", "albums", "artists", "playlists"],
    limit: 25
  };
  
  const result = await musicKit.api.music('/v1/catalog/{{storefrontId}}/search', queryParameters);
  const searchData: MusicKit.SearchResults = result.data.results;

  const tracks = searchData.songs?.data?.map(songToTrack) || [];
  const albums = searchData.albums?.data?.map(albumToAlbum) || [];
  const artists = searchData.artists?.data?.map(artistToArtist) || [];
  const playlists = searchData.playlists?.data?.map(playlistToPlaylist) || [];

  return {
    tracks: { items: tracks },
    albums: { items: albums },
    artists: { items: artists },
    playlists: { items: playlists }
  };
}

async function searchTracks(request: SearchRequest): Promise<SearchTrackResult> {
  if (!musicKit || !musicKit.isAuthorized) {
    throw new Error('Not authorized');
  }

  const queryParameters = {
    term: request.query,
    types: ["songs"],
    limit: 25,
    offset: request.pageInfo?.offset || 0
  };
  
  const result = await musicKit.api.music('/v1/catalog/{{storefrontId}}/search', queryParameters);
  const searchData: MusicKit.SearchResults = result.data.results;

  const tracks = searchData.songs?.data?.map(songToTrack) || [];

  return {
    items: tracks,
    pageInfo: {
      resultsPerPage: 25,
      totalResults: searchData.songs?.data?.length || 0,
      offset: request.pageInfo?.offset || 0
    }
  };
}

async function searchAlbums(request: SearchRequest): Promise<SearchAlbumResult> {
  if (!musicKit || !musicKit.isAuthorized) {
    throw new Error('Not authorized');
  }

  const queryParameters = {
    term: request.query,
    types: ["albums"],
    limit: 25,
    offset: request.pageInfo?.offset || 0
  };
  
  const result = await musicKit.api.music('/v1/catalog/{{storefrontId}}/search', queryParameters);
  const searchData: MusicKit.SearchResults = result.data.results;

  const albums = searchData.albums?.data?.map(albumToAlbum) || [];

  return {
    items: albums,
    pageInfo: {
      resultsPerPage: 25,
      totalResults: searchData.albums?.data?.length || 0,
      offset: request.pageInfo?.offset || 0
    }
  };
}

async function searchArtists(request: SearchRequest): Promise<SearchArtistResult> {
  if (!musicKit || !musicKit.isAuthorized) {
    throw new Error('Not authorized');
  }

  const queryParameters = {
    term: request.query,
    types: ["artists"],
    limit: 25,
    offset: request.pageInfo?.offset || 0
  };
  
  const result = await musicKit.api.music('/v1/catalog/{{storefrontId}}/search', queryParameters);
  const searchData: MusicKit.SearchResults = result.data.results;

  const artists = searchData.artists?.data?.map(artistToArtist) || [];

  return {
    items: artists,
    pageInfo: {
      resultsPerPage: 25,
      totalResults: searchData.artists?.data?.length || 0,
      offset: request.pageInfo?.offset || 0
    }
  };
}

async function getAlbumTracks(request: AlbumTrackRequest): Promise<AlbumTracksResult> {
  if (!musicKit || !musicKit.isAuthorized) {
    throw new Error('Not authorized');
  }

  const queryParameters = {
    include: ['tracks']
  };
  
  const result = await musicKit.api.music(`/v1/catalog/{{storefrontId}}/albums/${request.apiId}`, queryParameters);
  const album = result.data.data[0];
  const tracks = album.relationships.tracks.data.map(songToTrack);

  return {
    album: albumToAlbum(album),
    items: tracks
  };
}

async function getArtistAlbums(request: ArtistAlbumRequest): Promise<ArtistAlbumsResult> {
  if (!musicKit || !musicKit.isAuthorized) {
    throw new Error('Not authorized');
  }

  const queryParameters = {
    include: ['albums']
  };
  
  const result = await musicKit.api.music(`/v1/catalog/{{storefrontId}}/artists/${request.apiId}`, queryParameters);
  const artist = result.data.data[0];
  const albums = artist.relationships.albums.data.map(albumToAlbum);

  return {
    artist: artistToArtist(artist),
    items: albums,
    pageInfo: {
      resultsPerPage: albums.length,
      totalResults: albums.length,
      offset: 0
    }
  };
}

async function getUserPlaylists(request: UserPlaylistRequest): Promise<SearchPlaylistResult> {
  if (!musicKit || !musicKit.isAuthorized) {
    throw new Error('Not authorized');
  }
  const queryParameters = {
    limit: 25,
    offset: request.pageInfo?.offset || 0
  };
  
  const result = await musicKit.api.music('/v1/me/library/playlists', queryParameters);
  const libraryData = result.data;
  const playlists = libraryData.data.map(playlistToPlaylist);

  return {
    items: playlists,
    pageInfo: {
      resultsPerPage: 25,
      totalResults: libraryData.data.length || 0,
      offset: request.pageInfo?.offset || 0
    }
  };
}

async function getPlaylistTracks(request: PlaylistTrackRequest): Promise<PlaylistTracksResult> {
  if (!musicKit || !musicKit.isAuthorized) {
    throw new Error('Not authorized');
  }

  const queryParameters = {
    include: ['tracks']
  };
  
  const result = await musicKit.api.music(`/v1/catalog/{{storefrontId}}/playlists/${request.apiId}`, queryParameters);
  const playlist = result.data.data[0];
  const tracks = playlist.relationships.tracks.data.map(songToTrack);

  return {
    playlist: playlistToPlaylist(playlist),
    items: tracks
  };
}

async function getArtistTopTracks(request: ArtistTopTracksRequest): Promise<ArtistTopTracksResult> {
  if (!musicKit || !musicKit.isAuthorized) {
    throw new Error('Not authorized');
  }

  const queryParameters = {
    views: "top-songs"
  };
    
  const result = await musicKit.api.music(`/v1/catalog/{{storefrontId}}/artists/${request.apiId}`, queryParameters);
  const artist = result.data.data[0];
  const topSongs = artist.views?.["top-songs"]?.data?.map(songToTrack) || [];
  return { items: topSongs };
}

const appleMusicPlayer = new AppleMusicPlayer();

const setMethods = () => {
  application.onSearchAll = searchAll;
  application.onGetAlbumTracks = getAlbumTracks;
  application.onGetArtistAlbums = getArtistAlbums;
  application.onGetArtistTopTracks = getArtistTopTracks;
  application.onGetPlaylistTracks = getPlaylistTracks;
  application.onSearchTracks = searchTracks;
  application.onSearchArtists = searchArtists;
  application.onSearchAlbums = searchAlbums;
  application.onGetUserPlaylists = getUserPlaylists;
  application.onPlay = appleMusicPlayer.play.bind(appleMusicPlayer);
  application.onPause = appleMusicPlayer.pause.bind(appleMusicPlayer);
  application.onResume = appleMusicPlayer.resume.bind(appleMusicPlayer);
  application.onSeek = appleMusicPlayer.seek.bind(appleMusicPlayer);
  application.onSetVolume = appleMusicPlayer.setVolume.bind(appleMusicPlayer);
};

const init = async () => {
  const userToken = localStorage.getItem("userToken");
  const developerToken = getDeveloperToken();
  
  if (userToken && developerToken) {
    setMethods();
  }
  
  const theme = await application.getTheme();
  changeTheme(theme);
};

const onUiMessage = async (message: UiMessageType) => {
  switch (message.type) {
    case "logout":
      localStorage.removeItem("userToken");
      if (musicKit && musicKit.isAuthorized) {
        await musicKit.unauthorize();
      }
      break;
    case "set-keys":
      localStorage.setItem("developerToken", message.developerToken);
      localStorage.setItem("appName", message.appName);
      localStorage.setItem("appBuild", message.appBuild);
      await appleMusicPlayer.setupMusicKit();
      break;
    case "check-login":
      const userToken = localStorage.getItem("userToken");
      if (userToken && musicKit && musicKit.isAuthorized) {
        sendMessage({ type: "login" });
      }

      const host = document.location.host;
      const hostArray = host.split(".");
      hostArray.shift();
      const pluginId = await application.getPluginId();
      const domain = hostArray.join(".");
      const origin = `${document.location.protocol}//${domain}`;
      const developerToken = getDeveloperToken();
      const appName = getAppName();
      const appBuild = getAppBuild();
      
      sendMessage({
        type: "info",
        origin: origin,
        pluginId: pluginId,
        developerToken: developerToken,
        appName: appName,
        appBuild: appBuild
      });
      break;
    case "login":
      localStorage.setItem("userToken", message.userToken);
      if (musicKit) {
        try {
          await musicKit.authorize();
          setMethods();
        } catch (error) {
          console.error('Authorization failed:', error);
        }
      }
      break;
    default:
      // Exhaustive check - all message types handled above
      break;
  }
};

application.onUiMessage = onUiMessage;

const changeTheme = (theme: Theme) => {
  localStorage.setItem("vite-ui-theme", theme);
};

application.onChangeTheme = async (theme: Theme) => {
  changeTheme(theme);
};

init();
