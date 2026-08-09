---
name: native-data-fetching
description: "Covers fetch API, React Query, SWR, error handling, caching, offline support, and Expo Router data loaders."
triggers:
  - Need to implement data fetching in a React/Expo app
  - Need to choose between fetch API, React Query, SWR
  - Need error handling, caching, or offline support for data fetching
---

# Native Data Fetching

Covers fetch API, React Query, SWR, error handling, caching, offline support, and Expo Router data loaders.

## Core Protocol

### Step 1: Choose the Right Tool

- **fetch API:** simple requests, no caching, no retries
- **React Query / TanStack Query:** server state management, caching, retries, pagination
- **SWR:** lightweight stale-while-revalidate strategy
- **Expo Router data loaders:** server-side data loading for Expo Router

**Done when:** the appropriate data fetching tool is selected for the use case.

### Step 2: Implement Error Handling

Handle network errors, timeout, and unexpected response shapes. Show appropriate UI for each error state.

**Done when:** loading, error, and success states are all handled.

### Step 3: Add Caching and Offline Support

Configure caching strategy (stale time, cache time, refetch intervals). Add offline support where needed.

**Done when:** caching strategy is configured and offline behavior is defined.

## Failure Modes

- **No error handling:** network failures cause silent UI failures
- **Over-fetching:** fetching the same data in multiple components without caching
- **Stale data:** not configuring cache invalidation or refetch intervals
- **No offline support:** app breaks when network is unavailable
