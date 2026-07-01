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
        description: "The front room — what the club is",
        mobilePrimary: true,
        desktop: true,
    },
    {
        href: "/alliances",
        label: "Alliances",
        icon: "🌐",
        description: "The clubs — organized by challenge",
        highlight: true,
        mobilePrimary: true,
        desktop: true,
    },
    {
        href: "/submit",
        label: "Prove",
        icon: "★",
        description: "The counter — bring your improvement",
        highlight: true,
        mobilePrimary: true,
        desktop: true,
    },
    {
        href: "/validators",
        label: "Validators",
        icon: "⚖️",
        description: "The doctors — verify without seeing",
        highlight: true,
        desktop: true,
    },
    {
        href: "/api-docs",
        label: "Develop",
        icon: "📖",
        description: "Integrate the SDK into your agent",
        desktop: true,
    },
    // ── Secondary nav (mobile "More" overflow) ────────────────────
    {
        href: "/attention-tokens",
        label: "Markets",
        icon: "💎",
        description: "How each club funds itself",
        mobileMore: true,
    },
    {
        href: "/membership",
        label: "Membership",
        icon: "🤝",
        description: "Your card — how you get in the door",
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
        description: "The manifesto — why we exist outside",
        secret: true,
        mobileMore: true,
    },
    {
        href: "/achievements",
        label: "Clearance",
        icon: "🏆",
        description: "Your name on the wall",
        mobileMore: true,
    },
    {
        href: "/pricing",
        label: "Fees",
        icon: "💳",
        description: "What the club costs to run",
        mobileMore: true,
    },
    {
        href: "/products",
        label: "Protocols",
        icon: "🧩",
        description: "The catalog — what each club offers",
        mobileMore: true,
    },
    {
        href: "/referrals",
        label: "Referrals",
        icon: "🔗",
        description: "Bring more builders into the club",
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
