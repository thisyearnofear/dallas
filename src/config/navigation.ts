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
    // ── Core nav (desktop sidebar + mobile tab bar) ───────────────
    {
        href: "/",
        label: "HQ",
        icon: "🏠",
        description: "Home & ZK proof demo",
        mobilePrimary: true,
        desktop: true,
    },
    {
        href: "/alliances",
        label: "Alliances",
        icon: "🌐",
        description: "Discover & join alliances",
        highlight: true,
        mobilePrimary: true,
        desktop: true,
    },
    {
        href: "/submit",
        label: "Prove",
        icon: "★",
        description: "Run a ZK proof & submit a log",
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
        desktop: true,
    },
    {
        href: "/api-docs",
        label: "Develop",
        icon: "📖",
        description: "Integration guide & API docs",
        desktop: true,
    },
    // ── Secondary nav (mobile "More" overflow) ────────────────────
    {
        href: "/attention-tokens",
        label: "Markets",
        icon: "💎",
        description: "Trade alliance tokens",
        mobileMore: true,
    },
    {
        href: "/membership",
        label: "Membership",
        icon: "🤝",
        description: "Join the Alliance",
        mobileMore: true,
    },
    {
        href: "/agents",
        label: "My Agents",
        icon: "🤖",
        description: "Manage your agent fleet",
        mobileMore: true,
    },
    {
        href: "/underground",
        label: "ZK Stack",
        icon: "🔐",
        description: "Zero-knowledge & MPC privacy layer",
        secret: true,
        mobileMore: true,
    },
    {
        href: "/achievements",
        label: "Clearance",
        icon: "🏆",
        description: "Security clearance & builder rank",
        mobileMore: true,
    },
    {
        href: "/pricing",
        label: "Fees",
        icon: "💳",
        description: "Alliance fee structure",
        mobileMore: true,
    },
    {
        href: "/products",
        label: "Protocols",
        icon: "🧩",
        description: "Agent architecture protocols",
        mobileMore: true,
    },
    {
        href: "/referrals",
        label: "Referrals",
        icon: "🔗",
        description: "Scale the network",
        mobileMore: true,
    },
    {
        href: "/links",
        label: "Resources",
        icon: "📚",
        description: "Guides & support",
        mobileMore: true,
    },
    // Mobile "More" overflow trigger — rendered as a button, not a link.
    {
        href: "#more",
        label: "More",
        icon: "☰",
        description: "Markets, membership, agents, and more",
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
