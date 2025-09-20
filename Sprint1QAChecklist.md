# Sprint 1 QA Checklist

This checklist will go over test cases for Sprint 1 of the project with the focus of going over the foundation: requirements, UI wireframes, repo setup, architecture, and secure login prototype.

## Build & Launch
- [ ] App repository builds successfully (Android and iOS)
  - Clone the repo
  - Install dependencies
    
- [ ] App launches to the **Login screen** without fatal errors
  - Run the application on Android and iOS
  - Expected: App builds and opens on the Login screen without fatal errors

## Authentication Prototype
- [ ] Successful login via **OAuth** redirects back and stores token securely
  - Complete OAuth flow with valid test credentials
  - Expected: Redirects back to app, token securely stored, and user lands back on Home screen.
- [ ] Cancel/deny login -> returns to Login screen with friendly error; no token stored
  - Repeat but cancel/deny the OAuth flow
  - Expected: Back to login screen, clear error shown, and no token stored
- [ ] Logout clears tokens and back stack, returns to login
  - From authenicated state, tap Logout
  - Expected: Token cleared, app returns to login, and back button can not reverse to protected screen
- [ ] Protected routes blocked with user is not authenticated
  - Try to navigate manually to a protected page while logged out
  - Expected: Redirect to login, no access granted

## UI Wireframes (Review and Validation)
- [ ] Login screen wireframe matches agreed design
- [ ] SBAR handoff template wireframe includes **Situation, Background, Assessment, and Recommendation**
- [ ] Wireframes are reviewed by Product Owner for clarity and usability
  - Compare the wireframes against backlog requirements
  - Expected: Wireframes reviewed and approved by Product Owner for clarity and usability

## Test Cases (QA Deliverables)
- [ ] Initial QA test cases documented in repo
- [ ] Test cases reviewed by Scrum Master & Product Owner
- [ ] Checklist items trace back to Sprint 1 backlog goals
  - Confirm initial QA test cases file is committed. Review coverage against Sprint 1 backlog items
  - Expected: Test cases reviewed by Scrum Master and Product Owner
