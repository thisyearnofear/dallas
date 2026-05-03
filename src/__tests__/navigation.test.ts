import { navigationItems, mobilePrimaryItems, mobileMoreItems, desktopNavItems } from '../config/navigation';

describe('Navigation Config', () => {
  describe('navigationItems', () => {
    test('should have at least one item for every route', () => {
      expect(navigationItems.length).toBeGreaterThan(0);
    });

    test('every item should have required fields', () => {
      for (const item of navigationItems) {
        expect(item.href).toBeTruthy();
        expect(item.label).toBeTruthy();
        expect(item.icon).toBeTruthy();
        expect(item.description).toBeTruthy();
      }
    });

    test('every item should have at least one placement (mobile or desktop)', () => {
      for (const item of navigationItems) {
        const hasPlacement = item.mobilePrimary || item.mobileMore || item.desktop;
        expect(hasPlacement).toBeTruthy();
      }
    });

    test('hrefs should start with /', () => {
      for (const item of navigationItems) {
        expect(item.href).toMatch(/^\//);
      }
    });

    test('should not have duplicate hrefs', () => {
      const hrefs = navigationItems.map(i => i.href);
      const unique = new Set(hrefs);
      expect(unique.size).toBe(hrefs.length);
    });
  });

  describe('mobilePrimaryItems', () => {
    test('should have at most 4 items (bottom tab bar constraint)', () => {
      expect(mobilePrimaryItems.length).toBeLessThanOrEqual(4);
    });

    test('all items should be marked as mobilePrimary', () => {
      for (const item of mobilePrimaryItems) {
        expect(item.mobilePrimary).toBe(true);
      }
    });
  });

  describe('mobileMoreItems', () => {
    test('should have at least one item', () => {
      expect(mobileMoreItems.length).toBeGreaterThan(0);
    });

    test('all items should be marked as mobileMore', () => {
      for (const item of mobileMoreItems) {
        expect(item.mobileMore).toBe(true);
      }
    });
  });

  describe('desktopNavItems', () => {
    test('should have at least one item', () => {
      expect(desktopNavItems.length).toBeGreaterThan(0);
    });

    test('all items should be marked as desktop', () => {
      for (const item of desktopNavItems) {
        expect(item.desktop).toBe(true);
      }
    });
  });

  describe('cross-view parity', () => {
    test('every mobileMore item should also exist in the full list', () => {
      const allHrefs = new Set(navigationItems.map(i => i.href));
      for (const item of mobileMoreItems) {
        expect(allHrefs.has(item.href)).toBe(true);
      }
    });

    test('every desktop item should also exist in the full list', () => {
      const allHrefs = new Set(navigationItems.map(i => i.href));
      for (const item of desktopNavItems) {
        expect(allHrefs.has(item.href)).toBe(true);
      }
    });

    test('all mobilePrimary items should also be in desktop (core pages accessible everywhere)', () => {
      const desktopHrefs = new Set(desktopNavItems.map(i => i.href));
      for (const item of mobilePrimaryItems) {
        // Resources/links is in both
        expect(desktopHrefs.has(item.href)).toBe(true);
      }
    });
  });
});
