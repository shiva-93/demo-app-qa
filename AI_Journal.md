AI Working Journal (Cursor)
Tool: Cursor (AI chat in the IDE). I wrote each prompt as explicit test steps (locators, assertions, test names, tags) so the AI produced the structure I wanted, not a guess. Then I reviewed, ran, and corrected the output.

1. TCID-002: Sign up / register new user (smoke)
Prompt (summary): Write a new script for registering a new user.

Navigate to the app URL, click the Sign up link, assert the "Create Account" text and that input#name, input#email and input#password are present.
Negative test, "validating error messages for the user signup": enter an invalid email (test#gmal.com) and a short password, click Sign Up with getByRole('button'), assert "Invalid email format" and "Password must be at least 8 characters". Then use a valid email with an 8-character password and assert "Password must contain an uppercase letter" and "Password must contain a number".
Positive test, "register new user": valid name, email and password (8+ chars, uppercase, number), click Sign Up, land on the dashboard.
test.describe('TCID-002 ...') with the @smoke tag.
Why I directed it this way: I gave exact locators and expected messages from manual testing first, so the assertions check real UI behaviour.

Result: The positive registration test exposed a bug: a new user does not get registered. API errors also appeared in the browser console. Details are in the test strategy document.

2. TCID-003: Submit claim (functional)
Prompt (summary): Using claims.example.spec.js as context, write a separate test, "TCID-003 Verify whether the user is able to submit the claim".

"navigate to the claims page": log in as E2E_CLAIMANT_USER and assert the Submit Your First Claim and Submit New Claim buttons with getByRole('button').
"submit a new claim": click Submit New Claim, wait for [data-testid="wizard-step-1"] with waitFor, then fill:
incident date (dd/mm/yyyy) in input#incidentDate
location in input#incidentLocation
50000 in input#claimAmount
click Next, fill input#description, click Next, then click Submit Claim.
Assert all the entered values on the summary and that the View Details button appears.
Put the steps in a reusable method in claims.page.js (page object) and call it from the spec.
Why I directed it this way: It keeps the page object single-purpose and the spec readable as a specification (DRY, so other claim tests can reuse the method).

3. How I worked with AI
Deciding what to test. The risk areas came from my own manual exploration and code reading.
Expected results. I took assertion text from the real UI, not from AI guesses.
Making a failing test pass. If a test failed because of an app defect, I kept it failing and logged the bug instead of letting the AI "fix" the test.