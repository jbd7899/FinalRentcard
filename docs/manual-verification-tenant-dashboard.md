# Tenant Dashboard Manual Verification

These steps validate that the tenant dashboard no longer shows fabricated RentCard data and instead reflects the tenant profile returned by the API.

## Prerequisites
- Development environment running locally (`npm run dev`).
- Ability to create a fresh tenant account or reset an existing account's RentCard data.

## Verification Steps

### 1. New tenant onboarding prompt
1. Sign up or log in as a tenant that has no RentCard data populated (newly created accounts automatically receive an empty profile).
2. Navigate to `/tenant/dashboard`.
3. Confirm the **"Your RentCard"** card shows the "Build your RentCard" messaging and a primary button labeled **"Complete My RentCard"**.
4. Verify that no score, reference count, or completion badge is displayed.

### 2. Progress updates after adding data
1. From the dashboard, click **"Complete My RentCard"** to open the RentCard editor.
2. Add data for at least one section (e.g., employment information or credit score) and save the changes.
3. Return to the dashboard and confirm the completion badge now reflects the updated percentage (greater than 0%).
4. If references are added and verified, ensure the verified count and total references are updated accordingly.

### 3. Error handling (optional)
1. Temporarily disable the references API (e.g., by blocking the network request) while loading the dashboard.
2. Confirm the dashboard shows the inline warning **"There was an issue loading your references"** and continues to display the last known RentCard values.

Following these checks ensures new tenants see the onboarding prompt and that populated profiles display accurate statistics from the backend.
