# E-speak — How the Website Works (Sequence Diagrams)

> These diagrams show the step-by-step journey of different actions on the E-speak platform.
> Think of each arrow as a "conversation" between you (the user), the website screen, and the server storing data.

---

## 1. Visiting the Home Page

When anyone opens the website, the home page loads live statistics from the server.

```mermaid
sequenceDiagram
    actor Visitor
    participant Browser as 🌐 Home Page
    participant Server as 🖥️ Backend Server
    participant DB as 🗄️ Database

    Visitor->>Browser: Opens e-speak website
    Browser->>Server: "How many issues are reported?"
    Browser->>Server: "How many users are registered?"
    Server->>DB: Count all issues & users
    DB-->>Server: Returns numbers
    Server-->>Browser: Sends live stats
    Browser-->>Visitor: Shows animated Impact Metrics\n(Issues Reported, Resolved, Active Citizens, Responses)
```

---

## 2. User Registration (Creating an Account)

```mermaid
sequenceDiagram
    actor User
    participant Browser as 🌐 Register Page
    participant Clerk as 🔐 Clerk (Auth Service)
    participant Server as 🖥️ Backend Server
    participant DB as 🗄️ Database

    User->>Browser: Fills name, email, password → clicks Register
    Browser->>Clerk: Sends registration details
    Clerk->>Clerk: Creates secure account & verifies email
    Clerk-->>Browser: "Account created successfully"
    Browser->>Server: Syncs new user profile (role = user)
    Server->>DB: Saves user record
    DB-->>Server: Saved ✓
    Server-->>Browser: Returns user profile
    Browser-->>User: Redirects to Home Page (now logged in)
```

---

## 3. User Login (Signing In)

```mermaid
sequenceDiagram
    actor User
    participant Browser as 🌐 Login Page
    participant Clerk as 🔐 Clerk (Auth Service)
    participant Server as 🖥️ Backend Server

    User->>Browser: Enters email & password → clicks Sign In
    Browser->>Clerk: Sends credentials
    Clerk->>Clerk: Verifies password
    alt Correct credentials
        Clerk-->>Browser: Issues secure session token
        Browser->>Server: "Who am I?" (sends token)
        Server-->>Browser: Returns user role (user / admin / authority)
        Browser-->>User: Redirects based on role\n👤 User → Home Page\n🛡️ Admin → Admin Dashboard\n🏛️ Authority → Authority Dashboard
    else Wrong credentials
        Clerk-->>Browser: "Invalid email or password"
        Browser-->>User: Shows error message
    end
```

---

## 4. Reporting a Civic Issue

This is the main feature — a citizen reporting a problem in their community.

```mermaid
sequenceDiagram
    actor Citizen
    participant Browser as 🌐 Report Issue Page
    participant AI as 🤖 AI Assistant
    participant Similar as 🔍 Similar Issues Checker
    participant Server as 🖥️ Backend Server
    participant DB as 🗄️ Database

    Citizen->>Browser: Navigates to "Report Issue"
    Note over Browser: Must be logged in to proceed

    Citizen->>Browser: Types issue title
    Browser->>Similar: "Are there existing reports like this?"
    Similar->>Server: Searches database for similar issues
    Server-->>Similar: Returns matching issues (if any)
    Similar-->>Browser: Shows suggestions below title field
    Note over Browser: Citizen can upvote existing issue\ninstead of creating a duplicate

    Citizen->>Browser: Fills description, category, priority
    Browser->>AI: Sends form content for analysis
    AI-->>Browser: Shows smart suggestions\n(category, priority, title improvements)

    Citizen->>Browser: Selects location on map & uploads photos
    Citizen->>Browser: Clicks "Review & Submit"
    Browser->>Browser: Validates all required fields\n(title, description, category, priority,\nname, email, location)

    Browser->>Server: Submits full report (POST /api/issues/create/)
    Server->>DB: Saves issue with status "Submitted"
    DB-->>Server: Saved ✓
    Server-->>Browser: Returns unique Report ID (e.g. RPT-2026-001)
    Browser-->>Citizen: Shows success popup with Report ID
```

---

## 5. Browsing & Viewing Issues

Any visitor (even without an account) can browse all reported issues.

```mermaid
sequenceDiagram
    actor Visitor
    participant Browser as 🌐 Issues Page
    participant Server as 🖥️ Backend Server
    participant DB as 🗄️ Database

    Visitor->>Browser: Goes to "Issues" page
    Browser->>Server: Requests list of all issues\n(GET /api/issues/list/)
    Server->>DB: Fetches issues (sorted by newest)
    DB-->>Server: Returns issue list
    Server-->>Browser: Sends issues with status, category, priority
    Browser-->>Visitor: Displays issue cards with filters

    Visitor->>Browser: Clicks on a specific issue
    Browser->>Server: Requests issue details (GET /api/issues/{id}/)
    Server->>DB: Fetches issue + photos + comments
    DB-->>Server: Returns full details
    Browser->>Server: Records this view (view counter +1)
    Server-->>Browser: Sends all details
    Browser-->>Visitor: Shows full issue page with\nphotos, location map, comments, status timeline
```

---

## 6. Upvoting an Issue

Citizens can support an existing issue to push it up in priority.

```mermaid
sequenceDiagram
    actor Citizen
    participant Browser as 🌐 Issue Detail Page
    participant Server as 🖥️ Backend Server
    participant DB as 🗄️ Database

    Citizen->>Browser: Clicks "Upvote" on an issue
    Browser->>Server: POST /api/issues/{id}/vote/
    Server->>DB: Checks if this user already voted
    alt Already voted
        Server-->>Browser: "You already upvoted this"
        Browser-->>Citizen: Shows message (no change)
    else First time voting
        Server->>DB: Adds vote, increases upvote count
        DB-->>Server: Updated ✓
        Server->>Server: Checks if upvotes crossed threshold
        Note over Server: If enough upvotes → status auto-upgrades\nto "Under Review"
        Server-->>Browser: Updated vote count + new status
        Browser-->>Citizen: Upvote count increases live
    end
```

---

## 7. Admin Managing the Platform

Admins can see all users, change roles, and oversee all reported issues.

```mermaid
sequenceDiagram
    actor Admin
    participant Browser as 🌐 Admin Dashboard
    participant Server as 🖥️ Backend Server
    participant DB as 🗄️ Database

    Admin->>Browser: Logs in (role = admin)
    Browser->>Server: Fetches all users & issues
    Server->>DB: Queries users and issues
    DB-->>Server: Returns full data
    Server-->>Browser: Displays management tables

    Admin->>Browser: Changes a user's role (e.g. promote to authority)
    Browser->>Server: PATCH /api/accounts/users/{id}/role/
    Server->>DB: Updates user role
    DB-->>Server: Updated ✓
    Server-->>Browser: "Role updated successfully"
    Browser-->>Admin: Shows updated user list

    Admin->>Browser: Deletes a spam/duplicate issue
    Browser->>Server: DELETE /api/issues/{id}/delete/
    Server->>DB: Removes issue record
    DB-->>Server: Deleted ✓
    Server-->>Browser: Confirms deletion
```

---

## 8. Authority Resolving an Issue

Authority members handle assigned issues and update their status.

```mermaid
sequenceDiagram
    actor Authority
    participant Browser as 🌐 Authority Dashboard
    participant Server as 🖥️ Backend Server
    participant DB as 🗄️ Database
    participant Email as 📧 Email Service

    Authority->>Browser: Logs in (role = authority)
    Browser->>Server: Fetches issues assigned to this authority
    Server-->>Browser: Shows list of pending issues

    Authority->>Browser: Opens an issue, reviews details & photos
    Authority->>Browser: Updates status (e.g. "In Progress" → "Resolved")
    Browser->>Server: PATCH /api/issues/{id}/update-status/
    Server->>DB: Updates issue status
    DB-->>Server: Updated ✓
    Server->>DB: Creates notification for the issue reporter
    Server->>Email: Sends email update to reporter
    Server-->>Browser: "Status updated"
    Browser-->>Authority: Shows updated issue list

    Note over DB: Reporter will now see\na bell notification on their screen
```

---

## 9. Receiving a Status Notification

When an issue is updated, the person who reported it gets notified automatically.

```mermaid
sequenceDiagram
    actor Reporter
    participant Browser as 🌐 Any Page (logged in)
    participant Server as 🖥️ Backend Server
    participant DB as 🗄️ Database

    Note over Server,DB: Authority updated issue status (see Flow 8)

    Reporter->>Browser: Visits any page on the site
    Browser->>Server: Polls for new notifications\n(GET /api/issues/notifications/)
    Server->>DB: Checks for unread notifications
    DB-->>Server: Returns new notification\n("Your issue moved to Resolved")
    Server-->>Browser: Sends notification data
    Browser-->>Reporter: Red badge appears on bell icon 🔔

    Reporter->>Browser: Clicks the bell icon
    Browser-->>Reporter: Shows notification:\n"Road Pothole → Resolved"
    Reporter->>Browser: Clicks notification
    Browser-->>Reporter: Opens full issue detail page
```

---

## 10. Using the AI Civic Assistant (Chat)

The AI assistant helps users understand how civic issues are typically handled.

```mermaid
sequenceDiagram
    actor User
    participant Browser as 🌐 Civic AI / Report Page
    participant AI as 🤖 AI Assistant (Frontend)
    participant Server as 🖥️ Backend Server
    participant RAG as 📚 Knowledge Base (RAG)

    User->>Browser: Opens Civic AI page or Report Issue
    User->>Browser: Types a question\n(e.g. "How long does pothole repair take?")
    Browser->>AI: Checks if it's a simple greeting/FAQ
    alt Simple greeting ("hi", "thanks")
        AI-->>Browser: Replies instantly without server call
    else Civic question
        Browser->>Server: POST /api/civic-ai/chat/ {question}
        Server->>RAG: Searches trained civic case knowledge base
        RAG-->>Server: Returns relevant case information
        Server->>Server: Generates answer from context
        Server-->>Browser: Returns answer + confidence score
        Browser-->>User: Displays AI response
    end
```

---

## 11. Map View

Users can see all reported issues plotted on an interactive map.

```mermaid
sequenceDiagram
    actor Visitor
    participant Browser as 🌐 Map View Page
    participant Server as 🖥️ Backend Server
    participant DB as 🗄️ Database
    participant Maps as 🗺️ OpenStreetMap

    Visitor->>Browser: Goes to "Map View"
    Browser->>Server: Fetches all issues with coordinates
    Server->>DB: Queries issues where location is set
    DB-->>Server: Returns issues with lat/lng
    Server-->>Browser: Sends issue location data
    Browser->>Maps: Loads map tiles (OpenStreetMap)
    Maps-->>Browser: Renders base map
    Browser-->>Visitor: Shows map with coloured pins\n(🔴 Urgent, 🟡 High, 🟢 Resolved)

    Visitor->>Browser: Clicks a pin on the map
    Browser-->>Visitor: Shows issue popup:\ntitle, status, category, upvotes
    Visitor->>Browser: Clicks "View Details"
    Browser-->>Visitor: Opens full issue page
```

---

## Overall System Architecture (Quick View)

```mermaid
sequenceDiagram
    actor Anyone as 👤 User / Admin / Authority
    participant Frontend as 🌐 React Frontend\n(runs in browser)
    participant Clerk as 🔐 Clerk Auth
    participant Backend as 🖥️ Django Backend\n(REST API)
    participant DB as 🗄️ SQLite Database
    participant AI as 🤖 AI / RAG Engine

    Anyone->>Frontend: Uses the website
    Frontend->>Clerk: Handles all login/signup
    Clerk-->>Frontend: Returns session token
    Frontend->>Backend: All data requests\n(issues, users, stats, comments)
    Backend->>DB: Reads & writes data
    DB-->>Backend: Returns data
    Backend->>AI: AI-powered queries
    AI-->>Backend: Answers from knowledge base
    Backend-->>Frontend: JSON responses
    Frontend-->>Anyone: Live, updated UI
```

---

*Generated for E-speak Civic Platform — Empowering Voices, Developing Communities.*
