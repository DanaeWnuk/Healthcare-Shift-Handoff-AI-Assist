# Sprint 1 QA Checklist

This checklist will go over test cases for Sprint 1 of the project with the focus of going over the foundation: requirements, UI wireframes, repo setup, architecture, and secure login prototype.

## Build & Launch
- [ ] App repository builds successfully (Android and iOS)
- [ ] App launches to the **Login screen** without fatal errors

## Authentication Prototype
- [ ] Successful login via **OAuth** redirects back and stores token securely
- [ ] Cancel/deny login -> returns to Login screen with friendly error; no token stored\
- [ ] Logout clears tokens and back stack, returns to login
- [ ] Protected routes blocked with user is not authenticated

## UI Wireframes (Review and Validation)
- [ ] Login screen wireframe matches agreed design
- [ ] SBAR handoff template wireframe includes **Situation, Background, Assessment, and Recommendation**
- [ ] Wireframes are reviewed by Product Owner for clarity and usability

## Test Cases (QA Deliverables)
- [ ] Initial QA test cases documented in repo
- [ ] Test cases reviewed by Scrum Master & Product Owner
- [ ] Checklist items trace back to Sprint 1 backlog goals
