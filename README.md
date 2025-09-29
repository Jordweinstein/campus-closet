# Campus Closets

Campus Closets is an Expo-managed React Native marketplace that lets campus communities rent or buy wardrobe items. It layers Stripe payments and Sentry monitoring on top of Firebase Authentication, Firestore, and Storage so users can authenticate, browse listings, negotiate offers, and complete secure checkouts from their phones.




## Features

- **Email-gated authentication.** The login flow enforces `.edu` addresses, sends verification emails, persists user documents in Firestore, and supports password resets via Firebase Authentication APIs.


- **Seller onboarding & Stripe integration.** Profile setup collects contact details, uploads a profile photo, provisions Stripe customer and connected-account records, and marks the onboarding flow complete once Firestore is updated.


- **Listing management.** Creators can upload multiple images sequentially, choose categories and themes, toggle rent/buy options with pricing, and persist listings to Firestore while Sentry breadcrumbs capture upload diagnostics.


- **Discovery experience.** The Home and Shop screens surface trending and recent listings, support navigation to detailed views, and offer search plus size/price/availability filters with image prefetching for responsive browsing.



- **Offers, rentals, and checkout.** Users can send rental or purchase offers, accept or reject incoming bids, finalize transactions (which blocks rental dates or marks listings sold), and complete payments through a Stripe Payment Sheet tied to connected accounts.



- **Observability & shared state.** Application-level contexts manage authentication, listings, offers, pagination, and liked items while Sentry user context is attached for richer error tracing.




## Architecture Overview

- **App container & navigation.** `App.js` wraps the UI with the Stripe provider plus Auth, Offers, and Listings contexts, then selects between login, profile setup, and the tabbed experience while registering localized date-picker strings.


- **Tab and stack navigation.** A bottom tab bar composes dedicated stacks for home, shop, and profile flows so listing details, creation, offers, and checkout screens can be pushed without losing context.



- **State management.** Context providers centralize Firestore listeners, exposing helpers for pagination, liking listings, offer lifecycle, cleanup on logout, and deletion that also prunes Storage assets.



- **Firebase & Stripe integration.** Firebase initialization powers app/auth/storage access, while the shared Stripe service calls backend endpoints to create customers, connected accounts, account links, payment intents, and account fetches.



- **Serverless extensions.** The `functions/` package exposes HTTPS endpoints (secured with the `STRIPE_SECRET` runtime config) for customer onboarding, account management, payment intents, and customer sessions, with deployment scripts for Firebase Functions.




## Getting Started

### Prerequisites
- Node.js 18+ with npm.
- Expo CLI / Expo Go for running the managed React Native project (the app entry point and dependencies are Expo-based).



### Installation
1. Install dependencies:  
   ```bash
   npm install
   ```
2. Start the Expo development server (choose the platform-specific script as needed):  
   ```bash
   npm run start
   npm run android
   npm run ios
   npm run web
   ```



### Running on Devices
- Use `expo start` (invoked by `npm run start`) to generate a QR code for Expo Go or to launch connected simulators.



## Configuration

- Replace the Firebase keys in `firebase/firebase-config.js` with your own project credentials before distributing builds.


- Update the Sentry DSN and Stripe publishable key in `App.js` to match your environments or secrets management strategy.


- Provision the `STRIPE_SECRET` environment variable for Firebase Functions and deploy them with the provided scripts so `util/stripeService.js` can reach the expected endpoints.



- If you change backend hosts (Cloud Functions/Run), update the corresponding URLs in `util/stripeService.js`.



## Project Structure

- `components/` – Screen components for authentication, browsing, listing creation, profile management, offers, checkout, and theming.



- `contexts/` – React context providers for authentication, listings, and offers, including Firestore subscriptions and helper methods.



- `navigation/` – Stack navigator definitions consumed by the bottom tab bar.


- `firebase/` – Firebase initialization modules for app, authentication persistence, Firestore, and storage access.



- `util/` – Shared helpers such as the Stripe service that bridges the mobile app with backend payment endpoints.



- `functions/` – Firebase Cloud Functions that integrate with Stripe for account and payment lifecycle operations.



- `assets/` – Static imagery referenced across screens (e.g., home-page hero image).



## Development Tips

- When deleting a listing, the listings context removes the Firestore document, associated offers, Storage images, and the user’s listing reference, so ensure Firebase Storage and Firestore rules are configured to allow these operations.


- Offers and payments depend on Stripe connected accounts; if a seller hasn’t completed onboarding, the Offers screen prompts them to finish registration via a generated account link.


- The checkout flow initializes the Stripe Payment Sheet with customer, ephemeral key, and connected account transfer data returned by the backend; any issues here often stem from missing Stripe secrets or mismatched account IDs.



---

## Testing

⚠️ Not run (not requested).

