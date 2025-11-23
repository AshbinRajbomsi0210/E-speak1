# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Authentication & Profile (Added)

A lightweight mock authentication layer has been added to demonstrate role-based header interactions.

### Roles Supported
`user`, `admin`, `authority`

### Header Behavior
* When not signed in: a Sign In dropdown allows quick role selection (instant mock sign-in) or navigation to the full login page.
* When signed in: a Profile dropdown displays email, role, and options to view profile or sign out.
* Mobile menu includes the same quick actions.

### Files Introduced
* `src/context/AuthContext.jsx` – Provides `signIn(role, overrides)` and `signOut()` along with `user`, `role`, `authenticated` state.
* `src/pages/profile/index.jsx` – Displays basic mock user information and placeholder stats.

### Usage
Quick sign in: open the header Sign In menu and choose a role. You'll be redirected to `/profile`.
Full login: visit `/login` (optionally append `?role=admin` / `?role=authority` / `?role=user`). Use mock credentials displayed below.

### Mock Credentials
| Role | Email | Password |
|------|-------|----------|
| user | user@example.com | user123 |
| admin | admin@gov.local | admin123 |
| authority | authority@dept.local | authority123 |

Social login buttons are only enabled for the `user` role (Google/Facebook simulate login).

### Sign Out
Use the Profile dropdown (desktop) or mobile menu Sign Out button. This clears `localStorage.authSession`.

### Next Steps (Potential Enhancements)
* Replace mock auth with real API integration.
* Persist roles/permissions and guard routes.
* Add protected admin/authority dashboards.
* Display real profile metrics and activity.

---
