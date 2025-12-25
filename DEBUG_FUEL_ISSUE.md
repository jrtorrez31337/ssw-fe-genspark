# Debugging: Stargazer Ship Showing 0.1 Fuel

## Issue
Stargazer ship is displaying 0.1 total fuel instead of expected 100.0

## Possible Causes

### 1. Backend Returned Unexpected Value
- Backend IS deployed and returning fuel data
- But fuel_capacity is 0.1 instead of 100.0
- Ship might have been created before backend fix

### 2. Frontend Calculation Error
- Division or multiplication gone wrong
- Type conversion issue

### 3. Database Issue
- Ship has incorrect fuel_capacity in database
- Migration didn't run properly

## Debugging Steps

### Step 1: Check API Response
Open browser DevTools → Network tab:
1. Click on Stargazer ship controls
2. Look for request to `/v1/ships/{ship-id}` or `/v1/ships/by-owner/{owner-id}`
3. Check the response JSON

**Look for:**
```json
{
  "fuel_current": ???,
  "fuel_capacity": ???
}
```

### Step 2: Check Console Logs
Add this temporarily to see what data we're receiving.

### Step 3: Check Ship Creation Date
- When was Stargazer created?
- Before or after backend fuel fix deployment?

## Quick Fix Options

### Option A: If backend not deployed yet
- Frontend defaults should handle this
- 0.1 suggests backend IS responding with data

### Option B: If backend deployed with wrong values
- Backend team needs to fix ship initialization
- Or run migration to fix existing ships

### Option C: Re-create ship
- Delete and re-create Stargazer
- Should get correct 100.0 fuel if backend is deployed
