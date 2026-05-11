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
        label: "Command",
        icon: "🏠",
        description: "Central Alliance HUD",
        mobilePrimary: true,
        desktop: true,
    },
    {
        href: "/experiences",
        label: "Networks",
        icon: "🌐",
        description: "Collective intelligence",
        highlight: true,
        mobilePrimary: true,
        desktop: true,
    },
    {
        href: "/experiences?tab=share",
        label: "Submit Proof",
        icon: "📋",
        description: "Private optimization log",
        highlight: true,
        mobileMore: true,
        desktop: true,
    },
    {
        href: "/validators",
        label: "Validate",
        icon: "⚖️",
        description: "Verify & earn",
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
        description: "Join the Alliance",
        mobilePrimary: true,
        desktop: true,
    },
    {
        href: "/agents",
        label: "Fleet",
        icon: "🤖",
        description: "Agent intelligence",
        mobileMore: true,
        desktop: true,
    },
    {
        href: "/underground",
        label: "Privacy",
        icon: "🔐",
        description: "ZK & MPC stack",
        secret: true,
        mobileMore: true,
        desktop: true,
    },
    {
        href: "/achievements",
        label: "Rank",
        icon: "🏆",
        description: "Builder progress",
        mobileMore: true,
        desktop: false,
    },
    {
        href: "/pricing",
        label: "Funding",
        icon: "💳",
        description: "Alliance fee structure",
        mobileMore: true,
        desktop: true,
    },
    {
        href: "/api-docs",
        label: "Developer",
        icon: "📖",
        description: "Integration guide",
        mobileMore: true,
        desktop: true,
    },
];

/** Items for the mobile bottom tab bar (max 4) */
export const mobilePrimaryItems = navigationItems.filter(i => i.mobilePrimary);

/** Items for the mobile "More" overflow menu */
export const mobileMoreItems = navigationItems.filter(i => i.mobileMore);

/** Items for the desktop sidebar */
export const desktopNavItems = navigationItems.filter(i => i.desktop);
