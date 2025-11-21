# Sprint 1 QA Checklist

This checklist will go over test cases for Sprint 1 of the project with the focus of going over the foundation: requirements, UI wireframes, repo setup, architecture, and secure login prototype.

## Build & Launch
- [x] App repository builds successfully
  - Clone the repo (Tested 10/3/2025)
  - Install dependencies (Tested 10/3/2025)
    
- [x] App launches to the **Login screen** without fatal errors
  - Run the application on Android and iOS (Tested 10/10/2025)
  - Expected: App builds and opens on the Login screen without fatal errors (Tested 10/10/2025)

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
- [x] Login screen wireframe matches agreed design (Tested 10/10/2025)
- [x] SBAR handoff template wireframe includes **Situation, Background, Assessment, and Recommendation**
- [x] Initial QA test cases documented in repo (Tested 10/10/2025)
     
# Sprint 2-3 QA Checklist

This checklist covers QA for Sprint 2 and 3, focusing on backend security, auditing, and patient data endpoints.

## Environment & Build
- [ ] Secrets hygiene (Tested 10/10/2025, likely put in to confirm testing, will need to remove when product is close to being finished.)
- No secrets printed to console; DEBUG prints removed; .env only contains required keys.
- [x] Service boots clean (Tested 10/10/2025)
- App starts without stack traces; health probe works.

## Auth & Identity Hardening
- [ ] Real JWT verification
- Look into jwt.decode(..., options={"verify_signature": False}) to see if its vulnerable to false credential input.
- [ ] Protect sensitive routes
- All /patients/** and /audits/** require Authorization: Bearer <token> via Depends(HTTPBearer).
- [ ] Trusted identity propagation
- get_current_user() extracts email from verified token

## Auth Routes
- [ ] Signup/login behavior
- /signup returns user_id and message; no raw password; role not trusted from request body.
- [x] Login tokens (Tested 10/29/2025)
- /login returns access_token (and expires_in if available).
- [x] Invalid login path
- Bad credentials → 400 with {"detail":"Invalid login"}.

## Patient Data Routes (Tested 10/28/2025-Tested 10/29/2025)
- [x] GET /patients/{id}, /allergies, /careplans, /conditions, /devices, /encounters, /imaging_studies, /immunizations, /medications, /observations, /procedures.
- Auth required → 401/403 when missing/invalid.
- 404 clarity when patient/resource not found (no 500s).
- Field contract matches Supabase columns.
- Audit event per call with distinct action (e.g., VIEW_PATIENT).

# Sprint 4 QA Checklist

This checklist covers QA for Sprint 4 and revisiting test cases from previous sprints.

- [ ] Ensure previous Sprints checkboxes have been tested and are working.
- [ ] Test AI summary capabilities
