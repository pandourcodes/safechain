# SafeChain UI prototype

Calm Blue theme, React Native JavaScript, Expo Go-friendly UI prototype.

## Files
- `App.js` — Home, Active Incident, Evidence Timeline, Incident History, Evidence Detail, and bottom navigation.
- `src/services/demoData.js` — clearly labeled temporary mock data.

## Use in an existing Expo project
1. Copy `App.js` to the project root only if the project uses the standard `App.js` entry point.
2. Copy `src/services/demoData.js` into the matching path.
3. Run `npx expo start`.

No additional UI dependencies are used.

## Expo Router projects
If your project uses Expo Router, do not replace its entry point. Use the screen components as a starting point and place screens under the existing `app/` routes.

## Important
This is a UI-only prototype. SOS activation changes local demo state only. It does not send SMS, capture location/photos/audio, upload evidence, or verify integrity. Mock data is not real evidence. Integrate with the backend only after confirming its actual exports and data schema.
