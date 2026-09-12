# Departments Feature Module

This folder (`src/departments/`) contains the complete and self-contained implementation of the Departments Page for the website.

## Module Structure

- `DepartmentsPage.tsx`: Dedicated full page for `/departments` featuring navbar, scroll-progress bar, dot-grid background, department content, and footer. Chrome is intentionally identical to `src/about/AboutPage.tsx` so the two pages never feel different.
- `index.ts`: Module entry point re-exporting `DepartmentsPage`.
- The rich, heavily-animated content itself lives in `src/components/ui/departments-bento.tsx` (same location convention as `src/components/ui/about-bento.tsx`), and is fully self-contained — it duplicates its own small `TiltCard` / `AnimatedNumber` helpers rather than importing them from the About module, so this feature can be deleted independently.

## What's inside `departments-bento.tsx`

1. **Header** — badge, headline, animated stat count-up.
2. **Department Directory** — an 8-card bento grid (Cardiology, Neurology, Orthopedics, Pediatrics, Oncology, Dermatology, Emergency & Trauma, Radiology & Imaging), each with its own color theme, 3D tilt, cursor spotlight, and ambient glow. Clicking a card sets it as active.
3. **Active Department Deep-Dive** — an animated crossfade panel showing the selected department's overview, services checklist, ward/logistics info, and attached specialist doctors (two per department, three of whom are the same named doctors introduced on the About page for continuity: Dr. Tony Stark, Dr. Steve Rogers, Dr. Thor Odinson).
4. **Closing consultation banner** — matches the About page's closing CTA banner treatment.

## How to Delete in the Future

1. **Delete this directory:**
   ```powershell
   Remove-Item -Recurse -Force src/departments
   ```
2. **Delete the content component:**
   ```powershell
   Remove-Item -Force src/components/ui/departments-bento.tsx
   ```
3. **Remove the route from `src/App.tsx`:**
   - Remove the import line:
     ```tsx
     import DepartmentsPage from './departments';
     ```
   - Remove the route:
     ```tsx
     <Route path="/departments" element={<DepartmentsPage />} />
     ```
4. **In `src/components/Navbar.tsx`:**
   - Remove `/departments` from the `LIGHT_ROUTES` check.
   - Optionally remove the "Departments" item from `NAV_ITEMS`.
