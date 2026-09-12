# About Feature Module

This folder (`src/about/`) contains the complete and self-contained implementation of the About Page and Section for the website.

## Module Structure

- `AboutPage.tsx`: Dedicated full page for `/about` featuring navbar, ambient liquid-glass caustics background, about content, and footer.
- `AboutSection.tsx`: Core visual component featuring liquid-glass styling, heritage story, clinical pillars, historical timeline, and facility metrics.
- `index.ts`: Module entry point re-exporting `AboutPage` and `AboutSection`.

## How to Delete in the Future

If you ever want to completely remove this About Page & Section:

1. **Delete this directory:**
   Delete the entire `src/about/` folder:
   ```powershell
   Remove-Item -Recurse -Force src/about
   ```

2. **Remove the route from `src/App.tsx`:**
   - Remove the import line:
     ```tsx
     import AboutPage from './about';
     ```
   - Remove the route:
     ```tsx
     <Route path="/about" element={<AboutPage />} />
     ```
   - In `src/components/Navbar.tsx`, optionally remove the "About Us" item from `NAV_ITEMS`.
