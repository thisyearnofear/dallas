// Single source of truth for all navigation items.
// Both Navbar (desktop) and MobileNav derive from this array.

export interface NavItem {
    href: string;
    label: string;
    icon: string;
    description: string;
    /** Show a "CORE" badge on desktop */
    highlight?: boolean;
    /** Secret / underground styling */
    secret?: boolean;
    /** Show in mobile bottom tab bar (max 4) */
    mobilePrimary?: boolean;
    /** Show in mobile "More" overflow menu */
    mobileMore?: boolean;
    /** Show on desktop sidebar */
    desktop?: boolean;
}

export const navigationItems: NavItem[] = [
    {
        href: "/",
        label: "Home",
        icon: "🏠",
        description: "Welcome to the Alliance",
        mobilePrimary: true,
        desktop: true,
    },
    {
        href: "/experiences",
        label: "Alliances",
        icon: "🌐",
        description: "Discover & join",
        highlight: true,
        mobilePrimary: true,
        desktop: true,
    },
    {
        href: "/experiences?tab=share",
        label: "Submit Log",
        icon: "📋",
        description: "Private optimization log",
        highlight: true,
        mobileMore: true,
        desktop: true,
    },
    {
        href: "/validators",
        label: "Validators",
        icon: "⚖️",
        description: "Validate & earn",
        highlight: true,
        mobileMore: true,
        desktop: true,
    },
    {
        href: "/attention-tokens",
        label: "Markets",
        icon: "💎",
        description: "Trade alliance tokens",
        mobileMore: true,
        desktop: true,
    },
    {
        href: "/membership",
        label: "Membership",
        icon: "🤝",
        description: "Become a member",
        mobilePrimary: true,
        desktop: true,
    },
    {
        href: "/agents",
        label: "Command Center",
        icon: "🤖",
        description: "Agent intelligence",
        mobileMore: true,
        desktop: true,
    },
    {
        href: "/pricing",
        label: "Pricing",
        icon: "💳",
        description: "Simple, transparent pricing",
        mobileMore: true,
        desktop: true,
    },
    {
        href: "/api-docs",
        label: "API Docs",
        icon: "📖",
        description: "Agent integration guide",
        mobileMore: true,
        desktop: true,
    },
    {
        href: "/underground",
        label: "Underground",
        icon: "🕋",
        description: "Secret operations",
        secret: true,
        mobileMore: true,
        desktop: true,
    },
    {
        href: "/products",
        label: "Protocols",
        icon: "🛠️",
        description: "Tools & products",
        mobileMore: true,
        desktop: false,
    },
    {
        href: "/achievements",
        label: "Achievements",
        icon: "🏆",
        description: "Track progress",
        mobileMore: true,
        desktop: false,
    },
    {
        href: "/referrals",
        label: "Referrals",
        icon: "📢",
        description: "Spread the word",
        mobileMore: true,
        desktop: false,
    },
    {
        href: "/donate",
        label: "Support",
        icon: "💰",
        description: "Support the mission",
        mobileMore: true,
        desktop: false,
    },
    {
        href: "/links",
        label: "Resources",
        icon: "🔗",
        description: "Tools & docs",
        mobilePrimary: true,
        desktop: true,
    },
];

/** Items for the mobile bottom tab bar (max 4) */
export const mobilePrimaryItems = navigationItems.filter(i => i.mobilePrimary);

/** Items for the mobile "More" overflow menu */
export const mobileMoreItems = navigationItems.filter(i => i.mobileMore);

/** Items for the desktop sidebar */
export const desktopNavItems = navigationItems.filter(i => i.desktop);
