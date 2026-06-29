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
    /** This entry is the mobile "More" overflow trigger (renders as a menu button) */
    moreTrigger?: boolean;
}

export const navigationItems: NavItem[] = [
    {
        href: "/",
        label: "HQ",
        icon: "🏠",
        description: "Central Alliance HUD",
        mobilePrimary: true,
        desktop: true,
    },
    {
        href: "/alliances",
        label: "Alliances",
        icon: "🌐",
        description: "Discover & join alliances",
        highlight: true,
        mobileMore: true,
        desktop: true,
    },
    {
        href: "/submit",
        label: "Verify",
        icon: "★",
        description: "Run the ZK proof & submit a log",
        highlight: true,
        mobilePrimary: true,
        desktop: true,
    },
    {
        href: "/validators",
        label: "Validators",
        icon: "⚖️",
        description: "Verify proofs & earn rewards",
        highlight: true,
        mobilePrimary: true,
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
        mobileMore: true,
        desktop: true,
    },
    {
        href: "/agents",
        label: "My Agents",
        icon: "🤖",
        description: "Manage your agent fleet",
        mobileMore: true,
        desktop: true,
    },
    {
        href: "/underground",
        label: "ZK Stack",
        icon: "🔐",
        description: "Zero-knowledge & MPC privacy layer",
        secret: true,
        mobileMore: true,
        desktop: true,
    },
    {
        href: "/achievements",
        label: "Clearance",
        icon: "🏆",
        description: "Security clearance & builder rank",
        mobileMore: true,
        desktop: true,
    },
    {
        href: "/pricing",
        label: "Fees",
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
    // Mobile "More" overflow trigger — rendered as a button, not a link.
    {
        href: "#more",
        label: "More",
        icon: "☰",
        description: "Alliances, markets, membership, and more",
        mobilePrimary: true,
        moreTrigger: true,
    },
];

/** Items for the mobile bottom tab bar (max 4) */
export const mobilePrimaryItems = navigationItems.filter(i => i.mobilePrimary);

/** Items for the mobile "More" overflow menu */
export const mobileMoreItems = navigationItems.filter(i => i.mobileMore);

/** Items for the desktop sidebar */
export const desktopNavItems = navigationItems.filter(i => i.desktop);
