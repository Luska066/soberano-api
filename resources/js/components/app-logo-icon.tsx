import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            {/* Background Shield */}
            <path
                d="M50 8L88 22V52C88 74 50 92 50 92C50 92 12 74 12 52V22L50 8Z"
                fill="#0d1228"
                stroke="#c9a227"
                strokeWidth="3.5"
            />
            {/* Inner Shield Line */}
            <path
                d="M50 16L80 27V51C80 69 50 84 50 84C50 84 20 69 20 51V27L50 16Z"
                stroke="rgba(201, 162, 39, 0.35)"
                strokeWidth="1.5"
            />
            {/* Crown Peak Left */}
            <path
                d="M30 46L24 32L38 38L50 26L62 38L76 32L70 46H30Z"
                fill="url(#gold-gradient)"
                stroke="#c9a227"
                strokeWidth="1.5"
            />
            {/* Red Accent Jewel Center */}
            <polygon
                points="50,40 54,46 50,52 46,46"
                fill="#cc2200"
                stroke="#ff4d4d"
                strokeWidth="1"
            />
            {/* Tech Crosshair in Center */}
            <circle cx="50" cy="62" r="10" stroke="#4da6d6" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="50" cy="62" r="3" fill="#c9a227" />
            <line x1="50" y1="48" x2="50" y2="52" stroke="#c9a227" strokeWidth="2" />
            <line x1="50" y1="72" x2="50" y2="76" stroke="#c9a227" strokeWidth="2" />
            <line x1="36" y1="62" x2="40" y2="62" stroke="#c9a227" strokeWidth="2" />
            <line x1="60" y1="62" x2="64" y2="62" stroke="#c9a227" strokeWidth="2" />

            <defs>
                <linearGradient id="gold-gradient" x1="24" y1="26" x2="76" y2="46" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#e8c85c" />
                    <stop offset="0.5" stopColor="#c9a227" />
                    <stop offset="1" stopColor="#967010" />
                </linearGradient>
            </defs>
        </svg>
    );
}
