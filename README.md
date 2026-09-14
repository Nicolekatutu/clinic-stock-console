# CLINIC STOCK CONSOLE

## Live Application
**Production URL:** https://clinic-stock-console-flame.vercel.app

**Production branch:** `main`

The application is deployed on Vercel and is automatically deployed
when changes are merged into the `main` branch.

## Design and Architecture

The main users are clinic staff who need to quickly find an item, check its stock, and correct the stock count when necessary. Since the application may also be used on tablets with unreliable WiFi, I want to keep the user interface simple and avoid unnecessary navigation or complicated state management.

### 1. Components and screen structure

I will keep the application focused around three main screens:

- Login
- Stock items
- Item details

The login screen is to be separate from the main application because users should authenticate before accessing stock information.

The main stock screen is where most of the work happens. I will divive it into a few smaller sections instead of having everything inside one large component:

- App layout/header for the main application navigation
- Search input
- Category filter
- Sort controls
- Stock list/table
- Pagination
- Loading state
- Empty state
- Error state

Each stock item can be opened from the list and has its own details route using the item ID
The item details screen will be a modal that displays the information for that item and provides the stock correction form.

I will use reusable components for things like the filters, pagination and loading/error states because these are UI patterns that may be needed in more than one place. The page components are mainly responsible for putting these pieces together rather than containing all of the UI and logic themselves.

My planned structure is roughly:

src/
├── components/
│ ├── layout/
│ ├── items/
│ └── common/
├── pages/
│ ├── LoginPage
│ ├── ItemsPage
│ └── ItemDetailsPage
├── api/
│ ├── auth
│ └── products
├── hooks/
├── types/
└── utils/

The application is relatively small, so I want the separation to make the code easier to understand without creating a component for every small piece of markup.

### 2. State management

Server state

Dummy Json is going to be the server state

This includes:

- Products
- Product categories
- Individual product details
- Authenticated user information

I plan to manage this using TanStack Query rather than putting API data into local component states.

The reason is that products and categories are owned by the API. The frontend should mainly be responsible for requesting, displaying and updating that data.

URL state

I decided that the values that describe the current stock list should be stored in the URL.

These include:

- Search
- Category
- Sort field
- Sort order
- Page

For example:

/items?search=phone&category=smartphones&sortBy=title&order=asc&page=2

I choose this instead of keeping these values only in React state because the current list view should survive a browser refresh and should be possible to copy and share so that if I am on page 3 with a particular search and filter, refreshing the page should bring me back to the same view.
When the search, category or sort changes, I will reset the page back to page 1. This prevents a situation where someone is on page 5 and then applies a filter that only has two pages of results, leaving them on an invalid or empty page.

Local UI state

Some state only matters to the current interface and does not need to be stored globally or in the URL.

I will keep these values as local React state because they don't describe the current stock list view and there is no benefit in putting them in the URL.

### 3. Fetching, caching and invalidating data

I decided to use Axios for making API requests and TanStack Query for managing those requests.

I want to keep the API calls separate from the UI components. For example, product related requests will live in the API layer and the React components will use TanStack Query to consume them.

TanStack Query will also be responsible for caching server responses.
For updates, such as correcting an item's stock count, I will use a TanStack Query mutation. For updates, such as correcting an item's stock count, I use a TanStack
Query mutation. When the PUT succeeds, I update the relevant product
query and product-list cache using the response from the mutation.

I chose this instead of relying only on a refetch because DummyJSON is a
mock API and does not persist product mutations in the same way a real
backend would. A subsequent GET can therefore return the original mock
data even after a successful PUT.

For errors, I will show a useful error state with a retry option instead of leaving the screen blank.

### 4. Layout, spacing, colour and typography

For the visual design, I want the application to feel like an internal clinic tool rather than a marketing website but still look visually pleasing. The priority is readability and getting to the required stock information quickly.

I will Tailwind CSS for the styling rather than introducing a separate component library.
The general layout will have:

- A simple application header/navigation
- A clear main content area
- Consistent spacing between sections and form controls
- Cards/table rows with enough spacing to make the information easy to scan
- Responsive behaviour for smaller screens

For desktop screens, I will use a wider layout that makes good use of the available space. On smaller screens, the layout will adapt rather than forcing the desktop table or controls to fit into a narrow viewport.

For colour, I will keep the palette fairly restrained, using neutral backgrounds and text with a blue based primary colour for actions and important interactive elements. I don't want too many colours competing for attention.

I will use consistent Tailwind spacing and typography utilities instead of creating a large custom design system for this relatively small application.The typography will prioritise readability, with clear differences between page headings, section headings, labels and normal content. I will use Poppins as the main font and make sure the text remains readable at smaller viewport sizes.

### 5. Accessibility approach

Accessibility will be considered as part of the implementation rather than being something added at the end.

The main areas I will focus on are keyboard navigation, readable content and proper HTML semantics.

I will:

Use semantic HTML elements such as button, label, input, select, nav and headings where appropriate.
Make sure every form input has an associated label.
Make sure interactive elements can be reached and operated using the keyboard.
Provide visible focus states.
Use meaningful link text and button labels.
Provide useful `alt` text for product images.
Avoid relying on colour alone to communicate an error, status or action.

I will also test the main flows using only the keyboard to make sure that a user can navigate through the application, search, filter, open an item and submit a stock correction without needing a mouse.

The goal is not just to make the application technically functional, but to make the main stock management tasks easy to understand and operate.

## Decision Log

### Decision 1: Keep stock list state in the URL

**Decision:**
I decided to store the stock list's search, category, sorting and pagination values in the URL.

**Alternative considered:**
I considered keeping these values only in React/local component state.

**Why I chose this:**
The stock list represents a view that a user may want to refresh or share with someone else. If the values were only stored in React state, refreshing the browser would reset the list. Keeping them in the URL means a URL can be refreshed or copied and still represent the same view.

I also decided that changing the search, category or sort should reset the page to page 1. This avoids taking the user to an empty page when the new filter has fewer results.

### Decision 2: Use TanStack Query for server state

**Decision:**
I decided to use TanStack Query to manage data fetched from DummyJSON, including products, categories and individual product details.

**Alternative considered:**
I considered managing the API data with `useEffect` and `useState`, or putting the data into a global state.

**Why I chose this:**
The product data belongs to the API, so I consider it server state rather than application UI state. TanStack Query already provides functionality for fetching, caching, loading and error states, refetching and invalidating stale data.

Using it also means I don't need to build my own caching and server state logic or introduce another global state solution just to store API responses.

---

### Decision 3: Protect search results from stale requests

**Decision:**
I decided to debounce the search input and make the search parameters part of the TanStack Query key. Obsolete requests should also be cancelled or ignored where possible.

**Alternative considered:**
I considered sending a request for every keystroke and simply displaying whichever response arrives.

**Why I chose this:**
The application may be used over patchy WiFi, so sending a request for every keystroke can create unnecessary network traffic. More importantly, requests can finish in a different order from when they were started.

Debouncing reduces unnecessary requests, while making the search parameters part of the query identity ensures that the displayed data corresponds to the user's current search.

### Authentication and token expiry

Users must authenticate before accessing the stock console. Login requests
`expiresInMins: 1` as required by the assessment.

The access token and refresh token are stored locally. API requests include
the access token using an Axios request interceptor.

If the API returns a 401 response, the application clears the expired
authentication tokens and redirects the user to the login screen. The
current path and query string are preserved, so after signing in the user
can return to the stock view they were previously using instead of losing
their place.

I chose this approach instead of silently leaving the user on a broken
screen because the assessment specifically requires a recoverable expired
session.

### DummyJSON limitation

DummyJSON does not provide persistent product mutations. A successful
PUT returns the updated product, but subsequent GET requests can return
the original mock data.
To keep the UI consistent during the current session, the application
updates the TanStack Query cache using the successful PUT response.

# Testing

The project uses Vitest and React Testing Library.

The test suite covers authentication and protected routing, URL state and
pagination behaviour, inventory loading/error states, search request
cancellation, stock correction and TanStack Query cache updates, and
modal interaction behaviour.

Current suite: **10 tests across 4 test files**.

# CI/CD

The project uses GitHub Actions for continuous integration.

The CI workflow runs on every pull request and checks:

- Prettier formatting using `npm run format:check`
- ESLint using `npm run lint`
- Vitest using `npm test -- --run`
- Commit messages using commitlint
- Production build using `npm run build`

If any required check fails, the CI workflow fails and the pull request
cannot be considered ready to merge.

The `main` branch is the production branch. Pull requests are reviewed
and merged into `main`, after which the deployment provider automatically
deploys the latest version.

Conventional Commits are also enforced locally using commitlint and a
Husky `commit-msg` hook, so invalid commit messages are rejected before
they reach the repository.

# AI Reflection

1. What did you use AI for across the four sections?
   Section 1 – Design: I used AI to help me break down the assessment requirements into smaller technical tasks and think through the application structure.
   Section 2 – Build: I used AI mostly as an implementation and debugging assistant. I used it for things like authentication, protected routes, API integration, TanStack Query, search cancellation, pagination, stock updates, error/loading states, accessibility, and testing. I still ran and tested the code myself and made changes when the suggested implementation did not behave as expected.
   Section 3 – I used AI to help me structure the GitHub Actions workflow and decide which checks should run automatically. The workflow checks formatting, linting, tests, and the production build so that problems can be caught before the application is considered ready.
   Section 4 – Reflection/documentation: I used AI to help me organize and review the README and assessment documentation, but the actual reflection and decisions are based on my own experience working on the project.

2. Which tools did you use?
   I mainly used Cursor/AI IDE assistance and ChatGPT, together with VS Code/IDE tooling, Git, GitHub, npm, Vitest, ESLint, Prettier, and GitHub Actions.

I structured the work by breaking the assessment into the four sections and then breaking each section into smaller requirements. I would implement a requirement, run the application or tests, inspect the result, and then use AI when I needed help with a specific implementation or problem. I also reviewed the changes and ran the project's checks myself rather than accepting AI output without testing it.

3. Give one example where an AI suggestion improved your work. What did you prompt it with?
   One example was the search functionality. I wanted to make sure that if a user typed quickly, an older search request would not return after a newer request and replace the correct results.

I asked AI how I could prevent stale search results when using TanStack Query. It suggested using the AbortSignal provided by TanStack Query and passing it through to Axios so that previous requests could be cancelled when the query changed.

AI also helped me identify that I should update the TanStack Query cache using the successful PUT response instead of relying only on a refetch. This was important because DummyJSON does not persist product mutations in the way a real backend would. For this sugestion i did not really give a prompt iwas just suggestion based on the DummyJSON documentation

4. Give one example where AI output was wrong, incomplete or subtly bad, and how you caught it.

One example was the stock update behavior. The PUT request was successful
and returned the updated stock, but the inventory list could still show
the old stock after a refetch. The initial approach relied on fetching the product again after the update. I caught the problem by testing the actual API behavior instead of assuming that a successful PUT meant the data would persist.
I found that DummyJSON could return the original product data on a later
GET because it is a mock API. I changed the implementation to update the
TanStack Query cache using the product returned by the PUT request.
This was caught through actual testing rather than just reviewing the
AI-generated code.

5. Name two decisions you made without AI, and why you trusted your own judgment there.
   I chose to use TypeScript for the project. This was based on my own experience and preference when working with React. I was more comfortable having types for the API responses, query parameters, and component props, especially for an assessment where there were several different API states.
   I chose not to redesign the existing UI unnecessarily. I decided that my time was better spent making sure the required functionality worked correctly, handling edge cases, testing, accessibility, and CI/CD. I also wanted to avoid introducing visual changes that were not required by the assessment.

6. Point us at one part of your codebase you would struggle to defend, and tell us why.

One part I would struggle to defend in detail is the TanStack Query cache update after changing a product's stock.

I understand why it is needed and what it is doing: after the PUT request succeeds, the updated product is placed into the relevant product and products list queries so the UI immediately shows the new stock. However, the exact way the different query keys are matched and updated is something I would need to revisit before confidently explaining every detail of it. I relied on AI to help me work through this part
