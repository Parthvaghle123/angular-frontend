# Bug Investigation - Navbar Click Issue

## Bug Summary
Users reported that clicking a navbar link (especially search or navigation to catalog pages) sometimes requires a double click or doesn't show the expected data immediately. The output is often hidden or reset after the first click.

## Root Cause Analysis
1. **Asynchronous Race Condition**: In `MenuComponent` and `GiftComponent`, the `fetchProducts()` method and the `route.queryParams` subscription both update `filteredProducts`. `fetchProducts()` often finishes after the query params subscription has already filtered the (empty) initial list, causing it to overwrite the filtered results with the full product list. This forces the user to search/click again to see filtered results.
2. **Artificial Delays**: Both components use `setTimeout` (700ms and 1000ms) to artificially delay showing data and to manage a "loading" state. This makes the UI feel unresponsive and hidden on the first click.
3. **Incorrect Navigation Path**: `NavbarComponent.handleSearchSubmit` navigates to the `currentPath`. If a user searches from `/home`, they stay on `/home` where no products are displayed, requiring another click on "Menu" to see results.
4. **Session Storage Logic**: There is logic using `sessionStorage` to determine if it's the "first load" and apply different delays, creating inconsistent behavior.

## Affected Components
- `frontend/src/app/components/navbar.component.ts`
- `frontend/src/app/pages/menu.component.ts`
- `frontend/src/app/pages/gift.component.ts`

## Proposed Solution
1. **Consolidate Data Loading**: Refactor `MenuComponent` and `GiftComponent` to handle filtering immediately after data is fetched if a query parameter is present.
2. **Remove Artificial Delays**: Delete all `setTimeout` calls and artificial `loading = true` blocks that aren't tied to actual API calls.
3. **Fix Search Navigation**: Update `NavbarComponent` to always navigate to `/menu` (the main catalog) when a search is performed, ensuring the user is redirected to a page that can display the results.
4. **Immediate Redirect**: Ensure `routerLink` and navigation events are handled cleanly without conflicts.
