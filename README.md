# DisasterBot Frontend

DisasterBot is a React + Vite application that helps users explore disaster risk content and chat with an AI-backed assistant about preparedness, response, and local hazards. The UI combines a visual landing experience with a protected chat workspace and authentication flow to keep sessions in sync with the backend.

## What the app does

- Presents a landing page with a scrolling image gallery to set the tone for disaster risk awareness.
- Offers a dedicated chatbot workspace for asking natural-language questions.
- Supports account registration, login, and session persistence so conversations can be tied to a user.
- Communicates with a backend API for authentication and chat responses.

## Pages and routes

Routes are configured in `src/App.jsx` using `react-router-dom`.

| Route | Page | Description |
| --- | --- | --- |
| `/` | `DisasterDimensions` (`src/pages/DisasterDimensions.jsx`) | Image-focused landing page with a draggable, fullscreen-capable slider. |
| `/chatbot` | `Chatbot` (`src/pages/Chatbot.jsx`) | Protected chat workspace with country selection, prompts carousel, message history, and input form. |
| `/more-info` | `MoreInfo` (`src/pages/MoreInfo.jsx`) | Placeholder page for future informational content. |
| `/login` | `Login` (`src/pages/Login.jsx`) | Username/password login form. |
| `/register` | `Register` (`src/pages/Register.jsx`) | Account creation form. |

### Route protection

The `/chatbot` route is wrapped in `RequireAuth` (`src/components/RequireAuth.jsx`). While the app is restoring a session, it shows a loading card. If no user is authenticated, it prompts for login/registration; otherwise it renders the chat layout.

## Key UI components

- **NavBar (`src/components/NavBar.jsx`)**: Top-level navigation and auth status display (login/register buttons or greeting + logout).
- **ImageSlider (`src/components/ImageSlider.jsx`)**: Draggable, inertial image carousel with parallax and fullscreen support.
- **FullscreenOverlay (`src/components/FullscreenOverlay.jsx`)**: Fullscreen viewer for slider images with keyboard and wheel navigation.
- **PromptCarousel (`src/components/PromptCarousel.jsx`)**: GSAP-powered, looping prompt suggestions to kick off chats.
- **ChatMessage (`src/components/ChatMessage.jsx`)**: Message bubble with bot/user styling and timestamps.
- **InputForm (`src/components/InputForm.jsx`)**: Material UI text field + send button for composing messages.
- **TypingIndicator (`src/components/TypingIndicator.jsx`)**: Visual typing bubbles while responses are loading.
- **ChatbotLayout (`src/components/ChatbotLayout.jsx`)**: Simple layout wrapper for the chat route.

## Authentication flow

Authentication state lives in `src/context/AuthContext.jsx` and is provided application-wide in `src/main.jsx`.

- **Access tokens**: Stored in `localStorage` under `disasterbot_access_token` and decoded client-side to derive the current user.
- **Session restoration**: On initial load, the app checks the access token. If it is missing or expired, it calls `POST /auth/refresh` with `credentials: "include"` to exchange a refresh cookie for a new access token.
- **Login**: The login form (`/auth/login`) posts credentials and expects an `accessToken` in the response. Successful login stores the token and redirects to `/chatbot`.
- **Registration**: The registration form (`/auth/register`) behaves similarly, storing the returned access token after account creation.
- **Logout**: `POST /auth/logout` clears the server refresh cookie and the client access token.

## Backend communication

The API base URL is resolved from `VITE_API_BASE_URL` and defaults to `http://localhost:3000` if unset. All API requests are made via `fetch`.

### Chat requests

`src/pages/Chatbot.jsx` sends user questions to:

```
POST {VITE_API_BASE_URL}/ragbot
```

Payload:

```json
{
  "question": "<user message>",
  "country": "<selected country>"
}
```

The request includes `credentials: "include"` and an `Authorization: Bearer <accessToken>` header when available. If the backend returns a `401`, the app attempts a refresh and retries the request with the new token.

## Project structure

```
src/
  App.jsx                # Route definitions
  main.jsx               # React root + AuthProvider
  components/            # Reusable UI components
  context/AuthContext.jsx# Auth/session state
  pages/                 # Route-level screens
  css/                   # Styling
  assets/                # Images
```

## Local development

```bash
npm install
npm run dev
```

The app expects the backend API to be reachable at `VITE_API_BASE_URL` (or `http://localhost:3000`).