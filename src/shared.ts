export const MUSICKIT_TOKEN_URL = "https://js-cdn.music.apple.com/musickit/v3/musickit.js";

type UiCheckLoginType = {
  type: "check-login";
};
type UiLoginType = {
  type: "login";
  userToken: string;
};
type UiLogoutType = {
  type: "logout";
};
type UiSetKeysType = {
  type: "set-keys";
  developerToken: string;
  appName: string;
  appBuild: string;
};

export type UiMessageType =
  | UiCheckLoginType
  | UiLoginType
  | UiLogoutType
  | UiSetKeysType;

type LoginType = {
  type: "login";
};

type InfoType = {
  type: "info";
  origin: string;
  pluginId: string;
  developerToken: string;
  appName: string;
  appBuild: string;
};

export type MessageType = LoginType | InfoType;
