# Implementation Plan - Status & Priority Updates

Update the FiveM ToDo application to refine status options, add priority sorting, and update the brand icon.

## User Review Required

> [!IMPORTANT]
> The status options will be strictly limited to: **Gekauft**, **Ausstehend**, and **geplant**. Any existing tasks with "In Arbeit" will need to be reassigned or will be mapped to "Ausstehend" in the UI.

## Proposed Changes

### Components
#### [MODIFY] [todo-list.tsx](file:///c:/Users/Janni/Documents/GitHub/nordverkehr%20-todo/src/components/todo-list.tsx)
- Update `statusLabels` and `statusColors` to only include `pending`, `completed`, and `planned`.
- Add a new state `sortBy` for sorting items.
- Implement a sorting dropdown in the filter bar.
- Update the sorting logic in `filteredTodos` to support:
  - **Priorität** (Urgent -> High -> Normal -> Low)
  - **Datum** (Newest first)
  - **Preis** (Highest first)

#### [MODIFY] [todo-form.tsx](file:///c:/Users/Janni/Documents/GitHub/nordverkehr%20-todo/src/components/todo-form.tsx)
- Update the status dropdown to only show the three requested options: Gekauft, Ausstehend, geplant.

#### [MODIFY] [sidebar.tsx](file:///c:/Users/Janni/Documents/GitHub/nordverkehr%20-todo/src/components/sidebar.tsx)
- Replace the current logo with the provided icon URL.

## Verification Plan

### Manual Verification
- Verify the new icon is visible in the sidebar.
- Check the Add/Edit Todo form for updated status options.
- Test the sorting dropdown with multiple items of varying priorities and prices.
- Confirm that "Gekauft", "Ausstehend", and "geplant" are the only status labels visible.
