export function applyPostalCodeMask(
    raw: string,
    countryCode?: string,
    pattern?: string | null,
): string {
    if (!raw) return '';
    const clean = raw.trim();
    const upper = (countryCode || 'BR').toUpperCase();

    // 1. Brasil (BR): 00000-000 ou 00000000
    if (upper === 'BR') {
        const digits = clean.replace(/\D/g, '').slice(0, 8);
        if (digits.length > 5) {
            return `${digits.slice(0, 5)}-${digits.slice(5)}`;
        }
        return digits;
    }

    // 2. Estados Unidos e territórios (US, AS, GU, MH, MP, PR, VI): 00000 ou 00000-0000
    if (['US', 'AS', 'GU', 'MH', 'MP', 'PR', 'VI'].includes(upper)) {
        const digits = clean.replace(/\D/g, '').slice(0, 9);
        if (digits.length > 5) {
            return `${digits.slice(0, 5)}-${digits.slice(5)}`;
        }
        return digits;
    }

    // 3. Portugal (PT): 0000-000 ou 0000
    if (upper === 'PT') {
        const digits = clean.replace(/\D/g, '').slice(0, 7);
        if (digits.length > 4) {
            return `${digits.slice(0, 4)}-${digits.slice(4)}`;
        }
        return digits;
    }

    // 4. Polônia (PL): 00-000
    if (upper === 'PL') {
        const digits = clean.replace(/\D/g, '').slice(0, 5);
        if (digits.length > 2) {
            return `${digits.slice(0, 2)}-${digits.slice(2)}`;
        }
        return digits;
    }

    // 5. Japão (JP): 000-0000
    if (upper === 'JP') {
        const digits = clean.replace(/\D/g, '').slice(0, 7);
        if (digits.length > 3) {
            return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        }
        return digits;
    }

    // 6. República Tcheca (CZ), Eslováquia (SK), Suécia (SE): 000 00
    if (['CZ', 'SK', 'SE'].includes(upper)) {
        const digits = clean.replace(/\D/g, '').slice(0, 5);
        if (digits.length > 3) {
            return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        }
        return digits;
    }

    // 7. Canadá (CA): A0A 0A0
    if (upper === 'CA') {
        const alphanumeric = clean.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
        if (alphanumeric.length > 3) {
            return `${alphanumeric.slice(0, 3)} ${alphanumeric.slice(3)}`;
        }
        return alphanumeric;
    }

    // 8. Holanda (NL): 0000 AA
    if (upper === 'NL') {
        const digits = clean.replace(/\D/g, '').slice(0, 4);
        const letters = clean.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2);
        if (letters.length > 0 && digits.length === 4) {
            return `${digits} ${letters}`;
        }
        return clean.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6);
    }

    // 9. Reino Unido (GB), Guernsey (GG), Jersey (JE), Ilha de Man (IM): ex SW1A 1AA
    if (['GB', 'GG', 'JE', 'IM'].includes(upper)) {
        const formatted = clean.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (formatted.length > 3) {
            return `${formatted.slice(0, formatted.length - 3)} ${formatted.slice(formatted.length - 3)}`.slice(0, 8);
        }
        return formatted;
    }

    // 10. Andorra (AD): AD100 (AD + 3 dígitos)
    if (upper === 'AD') {
        const rest = clean.toUpperCase().replace(/^AD/i, '').replace(/\D/g, '').slice(0, 3);
        return `AD${rest}`;
    }

    // 11. Polinésia Francesa (PF: 98700), Guiana Francesa (GF: 97300), Guadalupe (GP: 97100), Martinica (MQ: 97200), Mayotte (YT: 97600), Reunião (RE: 97400), São Pedro (PM: 97500)
    if (['PF', 'GF', 'GP', 'MQ', 'YT', 'RE', 'PM'].includes(upper)) {
        return clean.replace(/\D/g, '').slice(0, 5);
    }

    // 12. Groelândia (GL: 3900) e Svalbard (SJ: 9170)
    if (['GL', 'SJ', 'LI'].includes(upper)) {
        return clean.replace(/\D/g, '').slice(0, 4);
    }

    // 13. Lituânia (LT: LT-01001), Luxemburgo (LU: L-1010), Moldávia (MD: MD-2000), Eslovênia (SI: SI-1000)
    if (upper === 'LT') {
        const digits = clean.replace(/\D/g, '').slice(0, 5);
        return digits.length > 0 ? `LT-${digits}` : '';
    }
    if (upper === 'LU') {
        const digits = clean.replace(/\D/g, '').slice(0, 4);
        return digits.length > 0 ? `L-${digits}` : '';
    }
    if (upper === 'MD') {
        const digits = clean.replace(/\D/g, '').slice(0, 4);
        return digits.length > 0 ? `MD-${digits}` : '';
    }
    if (upper === 'SI') {
        const digits = clean.replace(/\D/g, '').slice(0, 4);
        return digits.length > 0 ? `SI-${digits}` : '';
    }

    // 14. Vaticano (VA: 00120) e San Marino (SM: 47890)
    if (['VA', 'SM'].includes(upper)) {
        return clean.replace(/\D/g, '').slice(0, 5);
    }

    // 15. Países com 3 dígitos (FO, IS)
    if (['FO', 'IS'].includes(upper)) {
        return clean.replace(/\D/g, '').slice(0, 3);
    }

    // 16. Países com 4 dígitos (AU, AT, BD, BE, BG, DK, HU, NZ, MK, NO, PH, ZA, CH)
    if (['AU', 'AT', 'BD', 'BE', 'BG', 'DK', 'HU', 'NZ', 'MK', 'NO', 'PH', 'ZA', 'CH'].includes(upper)) {
        return clean.replace(/\D/g, '').slice(0, 4);
    }

    // 17. Países com 5 dígitos (HR, DO, FI, FR, DE, GT, MY, MX, MC, PK, ES, TH, TR)
    if (['HR', 'DO', 'FI', 'FR', 'DE', 'GT', 'MY', 'MX', 'MC', 'PK', 'ES', 'TH', 'TR'].includes(upper)) {
        return clean.replace(/\D/g, '').slice(0, 5);
    }

    // 18. Países com 6 dígitos (IN, RO, RU)
    if (['IN', 'RO', 'RU'].includes(upper)) {
        return clean.replace(/\D/g, '').slice(0, 6);
    }

    // 19. Limite genérico baseado no regex pattern
    if (pattern) {
        if (pattern.includes('\\d{6}')) {
            return clean.replace(/\D/g, '').slice(0, 6);
        }
        if (pattern.includes('\\d{5}')) {
            return clean.replace(/\D/g, '').slice(0, 5);
        }
        if (pattern.includes('\\d{4}')) {
            return clean.replace(/\D/g, '').slice(0, 4);
        }
        if (pattern.includes('\\d{3}')) {
            return clean.replace(/\D/g, '').slice(0, 3);
        }
    }

    return clean;
}

export function getPostalCodePlaceholder(countryCode?: string): string {
    const upper = (countryCode || 'BR').toUpperCase();
    switch (upper) {
        case 'BR':
            return '01310-100';
        case 'US':
        case 'AS':
        case 'GU':
        case 'MH':
        case 'MP':
        case 'PR':
        case 'VI':
            return '90210 ou 90210-1234';
        case 'PT':
            return '1000-001';
        case 'PL':
            return '00-001';
        case 'JP':
            return '100-0001';
        case 'CZ':
            return '100 00';
        case 'SK':
            return '811 01';
        case 'SE':
            return '111 22';
        case 'CA':
            return 'K1A 0B1';
        case 'NL':
            return '1012 AB';
        case 'GB':
            return 'SW1A 1AA';
        case 'GG':
            return 'GY1 1AA';
        case 'JE':
            return 'JE1 1AA';
        case 'IM':
            return 'IM1 1AA';
        case 'AD':
            return 'AD100';
        case 'PF':
            return '98700 (Polinésia Francesa)';
        case 'GF':
            return '97300 (Guiana Francesa)';
        case 'GP':
            return '97100 (Guadalupe)';
        case 'MQ':
            return '97200 (Martinica)';
        case 'YT':
            return '97600 (Mayotte)';
        case 'RE':
            return '97400 (Reunião)';
        case 'PM':
            return '97500 (São Pedro e Miquelão)';
        case 'GL':
            return '3900';
        case 'VA':
            return '00120';
        case 'SM':
            return '47890';
        case 'SJ':
            return '9170';
        case 'LI':
            return '9490';
        case 'LT':
            return 'LT-01001';
        case 'LU':
            return 'L-1010';
        case 'MD':
            return 'MD-2000';
        case 'SI':
            return 'SI-1000';
        case 'FO':
            return '100';
        case 'IS':
            return '101';
        case 'IN':
            return '110001';
        case 'RO':
            return '010011';
        case 'RU':
            return '101000';
        case 'DE':
            return '10115';
        case 'ES':
            return '28001';
        case 'FR':
            return '75001';
        case 'IT':
            return '00118';
        case 'MX':
            return '01000';
        case 'MY':
            return '50450';
        case 'TH':
            return '10100';
        case 'TR':
            return '06000';
        case 'HR':
            return '10000';
        case 'DO':
            return '10101';
        case 'FI':
            return '00100';
        case 'GT':
            return '01001';
        case 'MC':
            return '98000';
        case 'PK':
            return '44000';
        case 'AU':
            return '2000';
        case 'AT':
            return '1010';
        case 'BD':
            return '1000';
        case 'BE':
            return '1000';
        case 'BG':
            return '1000';
        case 'DK':
            return '1000';
        case 'HU':
            return '1011';
        case 'NZ':
            return '6011';
        case 'MK':
            return '1000';
        case 'NO':
            return '0001';
        case 'PH':
            return '1000';
        case 'ZA':
            return '0001';
        case 'CH':
            return '8001';
        default:
            return 'Código Postal / CEP';
    }
}

export function applyPhoneMask(raw: string, countryCode?: string): string {
    if (!raw) return '';
    const clean = raw.trim();
    const digits = clean.replace(/\D/g, '');
    const upper = (countryCode || 'BR').toUpperCase();

    // 1. Brasil (BR) - Formato celular 11 dígitos: (11) 98765-4321 ou fixo 10 dígitos: (11) 3456-7890
    if (upper === 'BR') {
        const d = digits.slice(0, 11);
        if (d.length > 10) {
            return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
        }
        if (d.length > 6) {
            return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
        }
        if (d.length > 2) {
            return `(${d.slice(0, 2)}) ${d.slice(2)}`;
        }
        return d;
    }

    // 2. EUA, Canadá e territórios (+1: US, CA, AS, GU, MH, MP, PR, VI) - Formato: (555) 123-4567
    if (['US', 'CA', 'AS', 'GU', 'MH', 'MP', 'PR', 'VI', 'DO'].includes(upper)) {
        const d = digits.slice(0, 10);
        if (d.length > 6) {
            return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
        }
        if (d.length > 3) {
            return `(${d.slice(0, 3)}) ${d.slice(3)}`;
        }
        return d;
    }

    // 3. Portugal (PT), Espanha (ES), Polônia (PL), Tchéquia (CZ), Eslováquia (SK), Eslovênia (SI), Macedônia (MK) - Formato: 912 345 678 (3-3-3)
    if (['PT', 'ES', 'PL', 'CZ', 'SK', 'SI', 'MK'].includes(upper)) {
        const d = digits.slice(0, 9);
        if (d.length > 6) {
            return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
        }
        if (d.length > 3) {
            return `${d.slice(0, 3)} ${d.slice(3)}`;
        }
        return d;
    }

    // 4. França e territórios ultramarinos (FR, GF, GP, MQ, RE, YT, PM, MC), Dinamarca (DK), Ilhas Faroe (FO), Groelândia (GL), Polinésia Francesa (PF) - Formato: 06 12 34 56 78 (pares de 2)
    if (['FR', 'GF', 'GP', 'MQ', 'RE', 'YT', 'PM', 'MC', 'DK', 'FO', 'GL', 'PF'].includes(upper)) {
        const d = digits.slice(0, 10);
        const parts = [];
        for (let i = 0; i < d.length; i += 2) {
            parts.push(d.slice(i, i + 2));
        }
        return parts.join(' ');
    }

    // 5. Itália (IT), Vaticano (VA), San Marino (SM) - Formato: 312 345 6789
    if (['IT', 'VA', 'SM'].includes(upper)) {
        const d = digits.slice(0, 10);
        if (d.length > 6) {
            return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
        }
        if (d.length > 3) {
            return `${d.slice(0, 3)} ${d.slice(3)}`;
        }
        return d;
    }

    // 6. Reino Unido (GB, GG, JE, IM) - Formato: 07123 456789
    if (['GB', 'GG', 'JE', 'IM'].includes(upper)) {
        const d = digits.slice(0, 11);
        if (d.length > 5) {
            return `${d.slice(0, 5)} ${d.slice(5)}`;
        }
        return d;
    }

    // 7. Alemanha (DE), Áustria (AT) - Formato: 0151 12345678
    if (['DE', 'AT'].includes(upper)) {
        const d = digits.slice(0, 12);
        if (d.length > 4) {
            return `${d.slice(0, 4)} ${d.slice(4)}`;
        }
        return d;
    }

    // 8. Japão (JP) - Formato: 090-1234-5678
    if (upper === 'JP') {
        const d = digits.slice(0, 11);
        if (d.length > 7) {
            return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
        }
        if (d.length > 3) {
            return `${d.slice(0, 3)}-${d.slice(3)}`;
        }
        return d;
    }

    // 9. Argentina (AR) - Formato: 11 1234-5678
    if (upper === 'AR') {
        const d = digits.slice(0, 10);
        if (d.length > 6) {
            return `${d.slice(0, 2)} ${d.slice(2, 6)}-${d.slice(6)}`;
        }
        if (d.length > 2) {
            return `${d.slice(0, 2)} ${d.slice(2)}`;
        }
        return d;
    }

    // 10. México (MX) - Formato: 55 1234 5678
    if (upper === 'MX') {
        const d = digits.slice(0, 10);
        if (d.length > 6) {
            return `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}`;
        }
        if (d.length > 2) {
            return `${d.slice(0, 2)} ${d.slice(2)}`;
        }
        return d;
    }

    // 11. Índia (IN) - Formato: 98765 43210
    if (upper === 'IN') {
        const d = digits.slice(0, 10);
        if (d.length > 5) {
            return `${d.slice(0, 5)} ${d.slice(5)}`;
        }
        return d;
    }

    // 12. Austrália (AU), Nova Zelândia (NZ), África do Sul (ZA) - Formato: 0412 345 678
    if (['AU', 'NZ', 'ZA', 'RO', 'HR', 'BG'].includes(upper)) {
        const d = digits.slice(0, 10);
        if (d.length > 7) {
            return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
        }
        if (d.length > 4) {
            return `${d.slice(0, 4)} ${d.slice(4)}`;
        }
        return d;
    }

    // 13. Rússia (RU) - Formato: 912 345-67-89
    if (upper === 'RU') {
        const d = digits.slice(0, 10);
        if (d.length > 8) {
            return `${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}`;
        }
        if (d.length > 6) {
            return `${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6)}`;
        }
        if (d.length > 3) {
            return `${d.slice(0, 3)} ${d.slice(3)}`;
        }
        return d;
    }

    // 14. Suécia (SE), Suíça (CH) - Formato: 070-123 45 67
    if (['SE', 'CH'].includes(upper)) {
        const d = digits.slice(0, 10);
        if (d.length > 8) {
            return `${d.slice(0, 3)}-${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8)}`;
        }
        if (d.length > 6) {
            return `${d.slice(0, 3)}-${d.slice(3, 6)} ${d.slice(6)}`;
        }
        if (d.length > 3) {
            return `${d.slice(0, 3)}-${d.slice(3)}`;
        }
        return d;
    }

    // 15. Tailândia (TH), Turquia (TR), Malásia (MY), Paquistão (PK), Filipinas (PH) - Formato: 081 234 5678
    if (['TH', 'TR', 'MY', 'PK', 'PH', 'BD'].includes(upper)) {
        const d = digits.slice(0, 11);
        if (d.length > 7) {
            return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
        }
        if (d.length > 4) {
            return `${d.slice(0, 4)} ${d.slice(4)}`;
        }
        return d;
    }

    // 16. Noruega (NO), Svalbard (SJ) - Formato: 412 34 567 (3-2-3)
    if (['NO', 'SJ'].includes(upper)) {
        const d = digits.slice(0, 8);
        if (d.length > 5) {
            return `${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5)}`;
        }
        if (d.length > 3) {
            return `${d.slice(0, 3)} ${d.slice(3)}`;
        }
        return d;
    }

    // 17. Andorra (AD), Islândia (IS), Liechtenstein (LI) - Formato: 312 345 (3-3 ou 3-4)
    if (['AD', 'IS', 'LI'].includes(upper)) {
        const d = digits.slice(0, 7);
        if (d.length > 3) {
            return `${d.slice(0, 3)} ${d.slice(3)}`;
        }
        return d;
    }

    // 18. Guatemala (GT) - Formato: 3123 4567 (4-4)
    if (upper === 'GT') {
        const d = digits.slice(0, 8);
        if (d.length > 4) {
            return `${d.slice(0, 4)} ${d.slice(4)}`;
        }
        return d;
    }

    // 19. Bélgica (BE) - Formato: 0470 12 34 56
    if (upper === 'BE') {
        const d = digits.slice(0, 10);
        if (d.length > 8) {
            return `${d.slice(0, 4)} ${d.slice(4, 6)} ${d.slice(6, 8)} ${d.slice(8)}`;
        }
        if (d.length > 6) {
            return `${d.slice(0, 4)} ${d.slice(4, 6)} ${d.slice(6)}`;
        }
        if (d.length > 4) {
            return `${d.slice(0, 4)} ${d.slice(4)}`;
        }
        return d;
    }

    // Genérico para outros países
    if (digits.length > 7) {
        return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }

    return digits;
}

export function getPhonePlaceholder(countryCode?: string): string {
    const upper = (countryCode || 'BR').toUpperCase();
    switch (upper) {
        case 'BR':
            return '(11) 98765-4321';
        case 'US':
        case 'CA':
        case 'AS':
        case 'GU':
        case 'MH':
        case 'MP':
        case 'PR':
        case 'VI':
            return '(555) 123-4567';
        case 'PT':
            return '912 345 678';
        case 'FR':
        case 'GF':
        case 'GP':
        case 'MQ':
        case 'RE':
        case 'YT':
        case 'PM':
        case 'MC':
            return '06 12 34 56 78';
        case 'ES':
            return '612 345 678';
        case 'GB':
        case 'GG':
        case 'JE':
        case 'IM':
            return '07123 456789';
        case 'DE':
            return '0151 12345678';
        case 'IT':
        case 'VA':
        case 'SM':
            return '312 345 6789';
        case 'JP':
            return '090-1234-5678';
        case 'AR':
            return '11 1234-5678';
        case 'MX':
            return '55 1234 5678';
        case 'IN':
            return '98765 43210';
        case 'AU':
            return '0412 345 678';
        case 'AD':
            return '312 345';
        case 'AT':
            return '0664 1234567';
        case 'BD':
            return '01712 345678';
        case 'BE':
            return '0470 12 34 56';
        case 'BG':
            return '088 123 4567';
        case 'HR':
            return '091 123 4567';
        case 'CZ':
            return '601 123 456';
        case 'DK':
        case 'FO':
        case 'GL':
            return '12 34 56 78';
        case 'DO':
            return '(809) 123-4567';
        case 'FI':
            return '040 1234567';
        case 'PF':
            return '87 12 34 56';
        case 'GT':
            return '3123 4567';
        case 'HU':
            return '06 20 123 4567';
        case 'IS':
            return '612 3456';
        case 'LI':
            return '79 123 45';
        case 'LT':
            return '8 612 34567';
        case 'LU':
            return '621 123 456';
        case 'MY':
            return '012 345 6789';
        case 'MD':
            return '0681 23456';
        case 'NL':
            return '06 12345678';
        case 'NZ':
            return '021 123 4567';
        case 'MK':
            return '070 123 456';
        case 'NO':
        case 'SJ':
            return '412 34 567';
        case 'PK':
            return '0300 1234567';
        case 'PH':
            return '0917 123 4567';
        case 'PL':
            return '512 345 678';
        case 'RO':
            return '0712 345 678';
        case 'RU':
            return '912 345-67-89';
        case 'SK':
            return '0901 123 456';
        case 'SI':
            return '031 123 456';
        case 'ZA':
            return '082 123 4567';
        case 'SE':
            return '070-123 45 67';
        case 'CH':
            return '079 123 45 67';
        case 'TH':
            return '081 234 5678';
        case 'TR':
            return '0532 123 4567';
        default:
            return '(11) 98765-4321';
    }
}