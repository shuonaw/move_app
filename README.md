# Move PWA with proactive push check-ins

This package turns the Move prototype into a Home Screen PWA with Web Push.

## Deploy to Netlify

1. Put this folder in a Git repository and connect it to Netlify.
2. In Netlify, set these environment variables:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT` (for example `mailto:you@example.com`)
3. Generate VAPID keys locally:
   ```bash
   npx web-push generate-vapid-keys
   ```
4. Deploy.
5. On iPhone, open the Netlify URL in Safari, Share → Add to Home Screen.
6. Launch Move from the Home Screen and tap **Enable reminders**.

## Reminder behavior

- Maximum two notification windows per day:
  - afternoon: 12:30–3:30 PM local time
  - evening: 6:30–9:30 PM local time
- One semi-random 30-minute slot is chosen within each window.
- A prompt is skipped if you logged within the prior 2 hours.
- The scheduled Netlify function checks every 30 minutes.

## Important

On iPhone/iPad, Web Push is for web apps added to the Home Screen. Notification permission must be requested in response to a user action, which is why Move has an explicit **Enable reminders** button.


## Android install verification

After deploying:
1. Open the site in Chrome on Android.
2. Use **Install** (not just Add to Home screen).
3. Confirm Move appears in the app drawer.
4. Long-press Move → App info to verify Android recognizes it as an installed app.
5. Then enable reminders and test push notifications.
