<?php

namespace App\Enums\Stripe\v1;

enum StripCountrieType: string
{
    case AS = 'AS';
    case AD = 'AD';
    case AR = 'AR';
    case AU = 'AU';
    case AT = 'AT';

    case BD = 'BD';
    case BE = 'BE';
    case BR = 'BR';
    case BG = 'BG';

    case CA = 'CA';
    case HR = 'HR';
    case CZ = 'CZ';

    case DK = 'DK';
    case DO = 'DO';

    case FO = 'FO';
    case FI = 'FI';
    case FR = 'FR';
    case GF = 'GF';
    case PF = 'PF';

    case DE = 'DE';
    case GL = 'GL';
    case GP = 'GP';
    case GU = 'GU';
    case GT = 'GT';
    case GG = 'GG';

    case VA = 'VA';
    case HU = 'HU';

    case IS = 'IS';
    case IN = 'IN';
    case IM = 'IM';
    case IT = 'IT';

    case JP = 'JP';
    case JE = 'JE';

    case LI = 'LI';
    case LT = 'LT';
    case LU = 'LU';

    case MY = 'MY';
    case MH = 'MH';
    case MQ = 'MQ';
    case YT = 'YT';
    case MX = 'MX';
    case MD = 'MD';
    case MC = 'MC';

    case NL = 'NL';
    case NZ = 'NZ';
    case MK = 'MK';
    case MP = 'MP';
    case NO = 'NO';

    case PK = 'PK';
    case PH = 'PH';
    case PL = 'PL';
    case PT = 'PT';
    case PR = 'PR';

    case RE = 'RE';
    case RO = 'RO';
    case RU = 'RU';

    case PM = 'PM';
    case SM = 'SM';
    case SK = 'SK';
    case SI = 'SI';
    case ZA = 'ZA';
    case ES = 'ES';
    case SJ = 'SJ';
    case SE = 'SE';
    case CH = 'CH';

    case TH = 'TH';
    case TR = 'TR';

    case GB = 'GB';
    case US = 'US';

    case VI = 'VI';

    /**
     * Retorna o nome do país em Português.
     */
    public function label(): string
    {
        return match ($this) {
            self::AS => 'Samoa Americana',
            self::AD => 'Andorra',
            self::AR => 'Argentina',
            self::AU => 'Austrália',
            self::AT => 'Áustria',

            self::BD => 'Bangladesh',
            self::BE => 'Bélgica',
            self::BR => 'Brasil',
            self::BG => 'Bulgária',

            self::CA => 'Canadá',
            self::HR => 'Croácia',
            self::CZ => 'Tchéquia',

            self::DK => 'Dinamarca',
            self::DO => 'República Dominicana',

            self::FO => 'Ilhas Faroe',
            self::FI => 'Finlândia',
            self::FR => 'França',
            self::GF => 'Guiana Francesa',
            self::PF => 'Polinésia Francesa',

            self::DE => 'Alemanha',
            self::GL => 'Groelândia',
            self::GP => 'Guadalupe',
            self::GU => 'Guam',
            self::GT => 'Guatemala',
            self::GG => 'Guernsey',

            self::VA => 'Vaticano',
            self::HU => 'Hungria',

            self::IS => 'Islândia',
            self::IN => 'Índia',
            self::IM => 'Ilha de Man',
            self::IT => 'Itália',

            self::JP => 'Japão',
            self::JE => 'Jersey',

            self::LI => 'Liechtenstein',
            self::LT => 'Lituânia',
            self::LU => 'Luxemburgo',

            self::MY => 'Malásia',
            self::MH => 'Ilhas Marshall',
            self::MQ => 'Martinica',
            self::YT => 'Mayotte',
            self::MX => 'México',
            self::MD => 'Moldávia',
            self::MC => 'Mônaco',

            self::NL => 'Holanda',
            self::NZ => 'Nova Zelândia',
            self::MK => 'Macedônia do Norte',
            self::MP => 'Ilhas Marianas do Norte',
            self::NO => 'Noruega',

            self::PK => 'Paquistão',
            self::PH => 'Filipinas',
            self::PL => 'Polônia',
            self::PT => 'Portugal',
            self::PR => 'Porto Rico',

            self::RE => 'Reunião',
            self::RO => 'Romênia',
            self::RU => 'Rússia',

            self::PM => 'São Pedro e Miquelão',
            self::SM => 'San Marino',
            self::SK => 'Eslováquia',
            self::SI => 'Eslovênia',
            self::ZA => 'África do Sul',
            self::ES => 'Espanha',
            self::SJ => 'Svalbard e Jan Mayen',
            self::SE => 'Suécia',
            self::CH => 'Suíça',

            self::TH => 'Tailândia',
            self::TR => 'Turquia',

            self::GB => 'Reino Unido',
            self::US => 'Estados Unidos',

            self::VI => 'Ilhas Virgens Americanas',
        };
    }

    /**
     * Retorna o DDI (código internacional de discagem) com prefixo '+'.
     */
    public function ddi(): string
    {
        return match ($this) {
            self::AS => '+1684',
            self::AD => '+376',
            self::AR => '+54',
            self::AU => '+61',
            self::AT => '+43',

            self::BD => '+880',
            self::BE => '+32',
            self::BR => '+55',
            self::BG => '+359',

            self::CA => '+1',
            self::HR => '+385',
            self::CZ => '+420',

            self::DK => '+45',
            self::DO => '+1809',

            self::FO => '+298',
            self::FI => '+358',
            self::FR => '+33',
            self::GF => '+594',
            self::PF => '+689',

            self::DE => '+49',
            self::GL => '+299',
            self::GP => '+590',
            self::GU => '+1671',
            self::GT => '+502',
            self::GG => '+44',

            self::VA => '+39',
            self::HU => '+36',

            self::IS => '+354',
            self::IN => '+91',
            self::IM => '+44',
            self::IT => '+39',

            self::JP => '+81',
            self::JE => '+44',

            self::LI => '+423',
            self::LT => '+370',
            self::LU => '+352',

            self::MY => '+60',
            self::MH => '+692',
            self::MQ => '+596',
            self::YT => '+262',
            self::MX => '+52',
            self::MD => '+373',
            self::MC => '+377',

            self::NL => '+31',
            self::NZ => '+64',
            self::MK => '+389',
            self::MP => '+1670',
            self::NO => '+47',

            self::PK => '+92',
            self::PH => '+63',
            self::PL => '+48',
            self::PT => '+351',
            self::PR => '+1787',

            self::RE => '+262',
            self::RO => '+40',
            self::RU => '+7',

            self::PM => '+508',
            self::SM => '+378',
            self::SK => '+421',
            self::SI => '+386',
            self::ZA => '+27',
            self::ES => '+34',
            self::SJ => '+47',
            self::SE => '+46',
            self::CH => '+41',

            self::TH => '+66',
            self::TR => '+90',

            self::GB => '+44',
            self::US => '+1',

            self::VI => '+1340',
        };
    }

    /**
     * Alias para obter o código de discagem (DDI).
     */
    public function dd(): string
    {
        return $this->ddi();
    }

    /**
     * Retorna o padrão regex para validação do código postal (sem delimitadores).
     */
    public function postalCodePattern(): string
    {
        return match ($this) {
            self::AS => '^\d{5}(?:-\d{4})?$',                  // Formato: 96799 ou 96799-1234 (NNNNN ou NNNNN-NNNN)
            self::AD => '^AD\d{3}$',                            // Formato: AD100 (AD + 3 dígitos)
            self::AR => '^([A-Z]\d{4}[A-Z]{3}|\d{4})$',        // Formato: C1024CWN ou 1024 (ANNNNAAA ou NNNN)
            self::AU => '^\d{4}$',                              // Formato: 2000 (NNNN - 4 dígitos)
            self::AT => '^\d{4}$',                              // Formato: 1010 (NNNN - 4 dígitos)

            self::BD => '^\d{4}$',                              // Formato: 1000 (NNNN - 4 dígitos)
            self::BE => '^\d{4}$',                              // Formato: 1000 (NNNN - 4 dígitos)
            self::BR => '^\d{5}-?\d{3}$',                       // Formato: 01310-100 ou 01310100 (NNNNN-NNN ou NNNNNNNN)
            self::BG => '^\d{4}$',                              // Formato: 1000 (NNNN - 4 dígitos)

            self::CA => '^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$', // Formato: K1A 0B1 ou K1A0B1 (ANA NAN)
            self::HR => '^\d{5}$',                              // Formato: 10000 (NNNNN - 5 dígitos)
            self::CZ => '^\d{3}\s?\d{2}$',                      // Formato: 100 00 ou 10000 (NNN NN)

            self::DK => '^\d{4}$',                              // Formato: 1000 (NNNN - 4 dígitos)
            self::DO => '^\d{5}$',                              // Formato: 10101 (NNNNN - 5 dígitos)

            self::FO => '^\d{3}$',                              // Formato: 100 (NNN - 3 dígitos)
            self::FI => '^\d{5}$',                              // Formato: 00100 (NNNNN - 5 dígitos)
            self::FR => '^\d{5}$',                              // Formato: 75001 (NNNNN - 5 dígitos)
            self::GF => '^973\d{2}$',                           // Formato: 97300 (973NN - Guiana Francesa)
            self::PF => '^987\d{2}$',                           // Formato: 98700 (987NN - Polinésia Francesa)

            self::DE => '^\d{5}$',                              // Formato: 10115 (NNNNN - 5 dígitos)
            self::GL => '^39\d{2}$',                            // Formato: 3900 (39NN - Groelândia)
            self::GP => '^971\d{2}$',                           // Formato: 97100 (971NN - Guadalupe)
            self::GU => '^969\d{2}(?:-\d{4})?$',                // Formato: 96910 ou 96910-1234 (969NN - Guam)
            self::GT => '^\d{5}$',                              // Formato: 01001 (NNNNN - 5 dígitos)
            self::GG => '^GY\d[\dA-Za-z]?[ ]?\d[A-Za-z]{2}$',   // Formato: GY1 1AA (Guernsey)

            self::VA => '^00120$',                              // Formato: 00120 (Vaticano)
            self::HU => '^\d{4}$',                              // Formato: 1011 (NNNN - 4 dígitos)

            self::IS => '^\d{3}$',                              // Formato: 101 (NNN - 3 dígitos)
            self::IN => '^\d{6}$',                              // Formato: 110001 (NNNNNN - 6 dígitos PIN)
            self::IM => '^IM\d[\dA-Za-z]?[ ]?\d[A-Za-z]{2}$',   // Formato: IM1 1AA (Ilha de Man)
            self::IT => '^\d{5}$',                              // Formato: 00118 (NNNNN - 5 dígitos)

            self::JP => '^\d{3}-?\d{4}$',                       // Formato: 100-0001 ou 1000001 (NNN-NNNN)
            self::JE => '^JE\d[\dA-Za-z]?[ ]?\d[A-Za-z]{2}$',   // Formato: JE1 1AA (Jersey)

            self::LI => '^94\d{2}$',                            // Formato: 9490 (94NN - Liechtenstein)
            self::LT => '^(?:LT-)?\d{5}$',                      // Formato: LT-01001 ou 01001 (LT-NNNNN)
            self::LU => '^(?:L-)?\d{4}$',                       // Formato: L-1010 ou 1010 (L-NNNN)

            self::MY => '^\d{5}$',                              // Formato: 50450 (NNNNN - 5 dígitos)
            self::MH => '^969\d{2}(?:-\d{4})?$',                // Formato: 96960 (969NN - Ilhas Marshall)
            self::MQ => '^972\d{2}$',                           // Formato: 97200 (972NN - Martinica)
            self::YT => '^976\d{2}$',                           // Formato: 97600 (976NN - Mayotte)
            self::MX => '^\d{5}$',                              // Formato: 01000 (NNNNN - 5 dígitos)
            self::MD => '^(?:MD-)?\d{4}$',                      // Formato: MD-2000 ou 2000 (MD-NNNN)
            self::MC => '^980\d{2}$',                           // Formato: 98000 (980NN - Mônaco)

            self::NL => '^\d{4}\s?[A-Za-z]{2}$',                // Formato: 1012 AB ou 1012AB (NNNN AA)
            self::NZ => '^\d{4}$',                              // Formato: 6011 (NNNN - 4 dígitos)
            self::MK => '^\d{4}$',                              // Formato: 1000 (NNNN - 4 dígitos)
            self::MP => '^9695\d(?:-\d{4})?$',                  // Formato: 96950 (9695N - Marianas do Norte)
            self::NO => '^\d{4}$',                              // Formato: 0001 (NNNN - 4 dígitos)

            self::PK => '^\d{5}$',                              // Formato: 44000 (NNNNN - 5 dígitos)
            self::PH => '^\d{4}$',                              // Formato: 1000 (NNNN - 4 dígitos)
            self::PL => '^\d{2}-?\d{3}$',                       // Formato: 00-001 ou 00001 (NN-NNN)
            self::PT => '^\d{4}(?:-\d{3})?$',                   // Formato: 1000-001 ou 1000 (NNNN-NNN ou NNNN)
            self::PR => '^00[679]\d{2}(?:-\d{4})?$',            // Formato: 00901 ou 00901-1234 (00NNN - Porto Rico)

            self::RE => '^974\d{2}$',                           // Formato: 97400 (974NN - Reunião)
            self::RO => '^\d{6}$',                              // Formato: 010011 (NNNNNN - 6 dígitos)
            self::RU => '^\d{6}$',                              // Formato: 101000 (NNNNNN - 6 dígitos)

            self::PM => '^97500$',                              // Formato: 97500 (São Pedro e Miquelão)
            self::SM => '^4789\d$',                             // Formato: 47890 (4789N - San Marino)
            self::SK => '^\d{3}\s?\d{2}$',                      // Formato: 811 01 ou 81101 (NNN NN)
            self::SI => '^(?:SI-)?\d{4}$',                      // Formato: SI-1000 ou 1000 (SI-NNNN)
            self::ZA => '^\d{4}$',                              // Formato: 0001 (NNNN - 4 dígitos)
            self::ES => '^\d{5}$',                              // Formato: 28001 (NNNNN - 5 dígitos)
            self::SJ => '^917\d$',                              // Formato: 9170 (917N - Svalbard)
            self::SE => '^\d{3}\s?\d{2}$',                      // Formato: 111 22 ou 11122 (NNN NN)
            self::CH => '^\d{4}$',                              // Formato: 8001 (NNNN - 4 dígitos)

            self::TH => '^\d{5}$',                              // Formato: 10100 (NNNNN - 5 dígitos)
            self::TR => '^\d{5}$',                              // Formato: 06000 (NNNNN - 5 dígitos)

            self::GB => '^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$', // Formato: SW1A 1AA, EC1A 1BB, W1A 0AX (Reino Unido)
            self::US => '^\d{5}(?:-\d{4})?$',                  // Formato: 90210 ou 90210-1234 (NNNNN ou NNNNN-NNNN)

            self::VI => '^008\d{2}(?:-\d{4})?$',                // Formato: 00801 ou 00801-1234 (008NN - Ilhas Virgens)
        };
    }

    /**
     * Retorna a expressão regular completa delimitada para uso com preg_match.
     * Exemplo: '/^\d{5}-?\d{3}$/i'.
     */
    public function postalCodeRegex(): string
    {
        return "/{$this->postalCodePattern()}/i";
    }

    /**
     * Valida se um determinado código postal é válido para este país.
     */
    public function validatePostalCode(?string $postalCode): bool
    {
        if (empty($postalCode)) {
            return false;
        }

        return (bool) preg_match($this->postalCodeRegex(), trim($postalCode));
    }

    /**
     * Retorna o padrão regex para validação do número de telefone / celular (formato nacional sem DDI).
     */
    public function phonePattern(): string
    {
        return match ($this) {
            self::BR => '^(?:\(?\d{2}\)?\s?)?(?:9\d{4}-?\d{4}|\d{4}-?\d{4})$', // Formato Brasil: (11) 98765-4321 ou (11) 3456-7890
            self::US, self::CA, self::AS, self::GU, self::MP, self::PR, self::VI => '^(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$', // Formato América do Norte / US: (555) 123-4567 ou 555-123-4567
            self::PT => '^9[1236]\d{7}$', // Formato Portugal: 912 345 678
            self::GB, self::GG, self::JE, self::IM => '^(?:0?7\d{9}|0?\d{10})$', // Formato Reino Unido
            self::FR, self::GF, self::GP, self::MQ, self::RE, self::YT, self::PM => '^(?:0?[67]\d{8}|0?\d{9})$', // Formato França e territórios ultramarinos
            self::DE => '^(?:0?1[567]\d{8,9}|0?\d{9,11})$', // Formato Alemanha
            self::IT, self::VA, self::SM => '^(?:3\d{8,9}|\d{9,10})$', // Formato Itália
            self::ES => '^[67]\d{8}$', // Formato Espanha
            self::AU => '^0?4\d{8}$', // Formato Austrália
            self::JP => '^(?:0?[789]0-?\d{4}-?\d{4}|0?\d{9,10})$', // Formato Japão
            self::AR => '^(?:(?:9\s?)?11\s?\d{8}|(?:9\s?)?[23]\d{2}\s?\d{6,7})$', // Formato Argentina
            self::MX => '^(?:\d{2}\s?\d{4}\s?\d{4}|\d{10})$', // Formato México
            self::IN => '^[6789]\d{9}$', // Formato Índia
            self::AD => '^[368]\d{5}$', // Formato Andorra
            self::AT => '^(?:0?6\d{8,10}|\d{4,13})$', // Áustria
            self::BD => '^0?1[3-9]\d{8}$', // Bangladesh
            self::BE => '^0?4\d{8}$', // Bélgica
            self::BG => '^0?8[789]\d{7}$', // Bulgária
            self::HR => '^0?9\d{7,8}$', // Croácia
            self::CZ => '^[67]\d{8}$', // Tchéquia
            self::DK, self::FO, self::GL => '^\d{8}$', // Dinamarca, Ilhas Faroe, Groelândia
            self::DO => '^(?:8[024]9\d{7}|\d{10})$', // República Dominicana
            self::FI => '^0?[45]\d{7,8}$', // Finlândia
            self::PF => '^8[789]\d{6}$', // Polinésia Francesa
            self::GT => '^[345]\d{7}$', // Guatemala
            self::HU => '^(?:0?20|0?30|0?70)\d{7}$', // Hungria
            self::IS => '^[678]\d{6}$', // Islândia
            self::LI => '^(?:7\d{6}|\d{7})$', // Liechtenstein
            self::LT => '^8?6\d{7}$', // Lituânia
            self::LU => '^6\d{8}$', // Luxemburgo
            self::MY => '^0?1[0-9]\d{7,8}$', // Malásia
            self::MH => '^\d{7}$', // Ilhas Marshall
            self::MD => '^[67]\d{7}$', // Moldávia
            self::MC => '^6\d{8}$', // Mônaco
            self::NL => '^0?6\d{8}$', // Holanda
            self::NZ => '^0?2\d{7,9}$', // Nova Zelândia
            self::MK => '^0?7\d{7}$', // Macedônia
            self::NO, self::SJ => '^[49]\d{7}$', // Noruega / Svalbard
            self::PK => '^0?3\d{9}$', // Paquistão
            self::PH => '^0?9\d{9}$', // Filipinas
            self::PL => '^[4-9]\d{8}$', // Polônia
            self::RO => '^0?7\d{8}$', // Romênia
            self::RU => '^9\d{9}$', // Rússia
            self::SK => '^0?9\d{8}$', // Eslováquia
            self::SI => '^0?[34567]1\d{6}$', // Eslovênia
            self::ZA => '^0?[678]\d{8}$', // África do Sul
            self::SE => '^0?7[02369]\d{7}$', // Suécia
            self::CH => '^0?7[5-9]\d{7}$', // Suíça
            self::TH => '^0?[689]\d{8}$', // Tailândia
            self::TR => '^0?5\d{9}$', // Turquia
        };
    }

    /**
     * Retorna a expressão regular completa para validação de telefone com preg_match.
     */
    public function phoneRegex(): string
    {
        return "/{$this->phonePattern()}/i";
    }

    /**
     * Valida se um número de telefone/celular é compatível com as regras do país.
     */
    public function validatePhone(?string $phone): bool
    {
        if (empty($phone)) {
            return true; // Campo de telefone pode ser opcional
        }

        $clean = preg_replace('/[^\d+]/', '', trim($phone));

        // Se o telefone foi enviado com o DDI (ex: +5511999999999), remove o DDI para validar o formato nacional
        $ddi = $this->ddi();
        if (str_starts_with($clean, $ddi)) {
            $clean = substr($clean, strlen($ddi));
        }

        return (bool) preg_match($this->phoneRegex(), trim($phone)) || (bool) preg_match($this->phoneRegex(), $clean);
    }

    /**
     * Retorna o array de opções formatado para campos Select/Dropdown no frontend.
     * Exemplo: [['label' => 'Brasil', 'value' => 'BR', 'code' => 'BR', 'ddi' => '+55', 'postal_code_regex' => '^\d{5}-?\d{3}$', 'phone_regex' => '...'], ...]
     *
     * @return array<int, array{label: string, value: string, code: string, ddi: string, dd: string, postal_code_regex: string, phone_regex: string}>
     */
    public static function toSelect(): array
    {
        return array_map(
            fn(self $country) => [
                'label' => $country->label(),
                'value' => $country->value,
                'code' => $country->value,
                'ddi' => $country->ddi(),
                'dd' => $country->dd(),
                'postal_code_regex' => $country->postalCodePattern(),
                'phone_regex' => $country->phonePattern(),
            ],
            self::cases()
        );
    }

    /**
     * Localiza o enum de país a partir de um DDI (ex: '+55' ou '55').
     */
    public static function fromDdi(?string $ddi): ?self
    {
        if (empty($ddi)) {
            return null;
        }

        $formatted = str_starts_with(trim($ddi), '+') ? trim($ddi) : '+' . trim($ddi);

        foreach (self::cases() as $case) {
            if ($case->ddi() === $formatted) {
                return $case;
            }
        }

        return null;
    }

    /**
     * Verifica se um DDI é suportado.
     */
    public static function isValidDdi(?string $ddi): bool
    {
        return self::fromDdi($ddi) !== null;
    }

    /**
     * Verifica se um país (código ISO ou nome/rótulo) é suportado.
     */
    public static function isValidCountry(?string $country): bool
    {
        return self::fromValueOrLabel($country) !== null;
    }

    /**
     * Localiza o enum de país a partir de um código ISO (ex: 'BR') ou nome/rótulo (ex: 'Brasil').
     */
    public static function fromValueOrLabel(?string $value): ?self
    {
        if (empty($value)) {
            return null;
        }

        $trimmed = trim($value);
        $byCode = self::tryFrom(strtoupper($trimmed));
        if ($byCode !== null) {
            return $byCode;
        }

        foreach (self::cases() as $case) {
            if (strcasecmp($case->label(), $trimmed) === 0) {
                return $case;
            }
        }

        return null;
    }

    /**
     * Retorna as opções ordenadas alfabeticamente pelo nome em português.
     *
     * @return array<int, array{label: string, value: string, code: string, ddi: string, dd: string, postal_code_regex: string, phone_regex: string}>
     */
    public static function toSelectSorted(): array
    {
        $options = self::toSelect();

        usort($options, fn($a, $b) => strcmp($a['label'], $b['label']));

        return $options;
    }
}
