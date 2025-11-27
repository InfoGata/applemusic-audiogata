import { MessageType, UiMessageType } from "./shared";
import { Button } from "./components/ui/button";
import { useState, useEffect } from "preact/hooks";
import { Input } from "./components/ui/input";

const sendMessage = (message: UiMessageType) => {
  parent.postMessage(message, "*");
};

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [developerToken, setDeveloperToken] = useState("");
  const [appName, setAppName] = useState("AudioGata Apple Music Plugin");
  const [appBuild, setAppBuild] = useState("1.0.0");

  useEffect(() => {
    const onMessage = (event: MessageEvent<MessageType>) => {
      switch (event.data.type) {
        case "info":
          setDeveloperToken(event.data.developerToken);
          setAppName(event.data.appName);
          setAppBuild(event.data.appBuild);
          break;
        case "login":
          setIsSignedIn(true);
          break;
        default:
          // Exhaustive check - all message types handled above
          break;
      }
    };

    sendMessage({ type: "check-login" });
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const onLogin = async () => {
    if (!window.MusicKit) {
      const script = document.createElement('script');
      script.src = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js';
      script.onload = async () => {
        await performLogin();
      };
      document.head.appendChild(script);
    } else {
      await performLogin();
    }
  };

  const performLogin = async () => {
    try {
      const musicKit = await window.MusicKit.configure({
        developerToken: developerToken,
        app: {
          name: appName,
          build: appBuild
        }
      });

      const userToken = await musicKit.authorize();

      sendMessage({
        type: "login",
        userToken: userToken
      });

      setIsSignedIn(true);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const onLogout = () => {
    setIsSignedIn(false);
    sendMessage({ type: "logout" });
  };

  const onSaveSettings = () => {
    sendMessage({
      type: "set-keys",
      developerToken: developerToken,
      appName: appName,
      appBuild: appBuild
    });
  };

  const saveButtonText = "Save Settings";

  return (
    <div className="flex flex-col gap-4 p-4">
      {isSignedIn ? (
        <div>
          <Button onClick={onLogout}>Logout</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Button onClick={onLogin} disabled={!developerToken}>
            Login with Apple Music
          </Button>

          <div className="space-y-2">
            <Input
              placeholder="Developer Token"
              value={developerToken}
              onChange={(e: any) => {
                const value = (e.target as HTMLInputElement).value;
                setDeveloperToken(value);
              }}
            />
            <Input
              placeholder="App Name"
              value={appName}
              onChange={(e: any) => {
                const value = (e.target as HTMLInputElement).value;
                setAppName(value);
              }}
            />
            <Input
              placeholder="App Build"
              value={appBuild}
              onChange={(e: any) => {
                const value = (e.target as HTMLInputElement).value;
                setAppBuild(value);
              }}
            />
            <Button onClick={onSaveSettings}>{saveButtonText}</Button>
          </div>

          <div className="text-sm space-y-2">
            <p className="font-semibold">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Create an Apple Developer account at{" "}
                <a
                  href="https://developer.apple.com"
                  target="_blank"
                  className="text-blue-500 underline"
                >
                  developer.apple.com
                </a>
              </li>
              <li>Generate a MusicKit JWT token for your app</li>
              <li>Enter your Developer Token, App Name, and App Build above</li>
              <li>Click "{saveButtonText}" to save your settings</li>
              <li>Click "Login with Apple Music" to authenticate</li>
            </ol>

            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-md">
              <p className="text-yellow-800 dark:text-yellow-200 text-xs">
                <strong>Note:</strong> You need an active Apple Music subscription and an Apple Developer account
                to use this plugin. The Developer Token must be generated using your Apple Developer credentials
                and MusicKit configuration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
