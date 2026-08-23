<?php

namespace App\Enums\Stripe\v1;

enum StripeTaxIdType: string
{
    case AD_NRT = 'ad_nrt';
    case AE_TRN = 'ae_trn';
    case AL_TIN = 'al_tin';
    case AM_TIN = 'am_tin';
    case AO_TIN = 'ao_tin';
    case AR_CUIT = 'ar_cuit';

    case AU_ABN = 'au_abn';
    case AU_ARN = 'au_arn';

    case AW_TIN = 'aw_tin';
    case AZ_TIN = 'az_tin';

    case BA_TIN = 'ba_tin';
    case BB_TIN = 'bb_tin';
    case BD_BIN = 'bd_bin';
    case BF_IFU = 'bf_ifu';
    case BG_UIC = 'bg_uic';
    case BH_VAT = 'bh_vat';
    case BJ_IFU = 'bj_ifu';
    case BO_TIN = 'bo_tin';

    case BR_CNPJ = 'br_cnpj';
    case BR_CPF = 'br_cpf';

    case BS_TIN = 'bs_tin';
    case BY_TIN = 'by_tin';

    case CA_BN = 'ca_bn';
    case CA_GST_HST = 'ca_gst_hst';
    case CA_PST_BC = 'ca_pst_bc';
    case CA_PST_MB = 'ca_pst_mb';
    case CA_PST_SK = 'ca_pst_sk';
    case CA_QST = 'ca_qst';

    case CD_NIF = 'cd_nif';

    case CH_UID = 'ch_uid';
    case CH_VAT = 'ch_vat';

    case CL_TIN = 'cl_tin';
    case CM_NIU = 'cm_niu';
    case CN_TIN = 'cn_tin';
    case CO_NIT = 'co_nit';
    case CR_TIN = 'cr_tin';
    case CV_NIF = 'cv_nif';

    case DE_STN = 'de_stn';

    case DO_RCN = 'do_rcn';

    case EC_RUC = 'ec_ruc';
    case EG_TIN = 'eg_tin';
    case ES_CIF = 'es_cif';
    case ET_TIN = 'et_tin';

    case EU_OSS_VAT = 'eu_oss_vat';
    case EU_VAT = 'eu_vat';

    case GB_VAT = 'gb_vat';
    case GE_VAT = 'ge_vat';
    case GN_NIF = 'gn_nif';

    case HK_BR = 'hk_br';
    case HR_OIB = 'hr_oib';
    case HU_TIN = 'hu_tin';

    case ID_NPWP = 'id_npwp';
    case IL_VAT = 'il_vat';
    case IN_GST = 'in_gst';
    case IS_VAT = 'is_vat';

    case JP_CN = 'jp_cn';
    case JP_RN = 'jp_rn';
    case JP_TRN = 'jp_trn';

    case KE_PIN = 'ke_pin';
    case KG_TIN = 'kg_tin';
    case KH_TIN = 'kh_tin';
    case KR_BRN = 'kr_brn';
    case KZ_BIN = 'kz_bin';

    case LA_TIN = 'la_tin';

    case LI_UID = 'li_uid';
    case LI_VAT = 'li_vat';

    case LK_VAT = 'lk_vat';

    case MA_VAT = 'ma_vat';
    case MD_VAT = 'md_vat';
    case ME_PIB = 'me_pib';
    case MK_VAT = 'mk_vat';
    case MR_NIF = 'mr_nif';
    case MX_RFC = 'mx_rfc';

    case MY_FRP = 'my_frp';
    case MY_ITN = 'my_itn';
    case MY_SST = 'my_sst';

    case NG_TIN = 'ng_tin';

    case NO_VAT = 'no_vat';
    case NO_VOEC = 'no_voec';

    case NP_PAN = 'np_pan';
    case NZ_GST = 'nz_gst';

    case OM_VAT = 'om_vat';

    case PE_RUC = 'pe_ruc';
    case PH_TIN = 'ph_tin';
    case PL_NIP = 'pl_nip';

    case RO_TIN = 'ro_tin';
    case RS_PIB = 'rs_pib';

    case RU_INN = 'ru_inn';
    case RU_KPP = 'ru_kpp';

    case SA_VAT = 'sa_vat';

    case SG_GST = 'sg_gst';
    case SG_UEN = 'sg_uen';

    case SI_TIN = 'si_tin';
    case SN_NINEA = 'sn_ninea';
    case SR_FIN = 'sr_fin';
    case SV_NIT = 'sv_nit';

    case TH_VAT = 'th_vat';
    case TJ_TIN = 'tj_tin';
    case TR_TIN = 'tr_tin';

    case TW_VAT = 'tw_vat';
    case TZ_VAT = 'tz_vat';

    case UA_VAT = 'ua_vat';
    case UG_TIN = 'ug_tin';

    case US_EIN = 'us_ein';
    case UY_RUC = 'uy_ruc';

    case UZ_TIN = 'uz_tin';
    case UZ_VAT = 'uz_vat';

    case VE_RIF = 've_rif';
    case VN_TIN = 'vn_tin';

    case ZA_VAT = 'za_vat';

    case ZM_TIN = 'zm_tin';
    case ZW_TIN = 'zw_tin';

    /**
     * Retorna o nome amigável do documento e país.
     */
    public function label(): string
    {
        return match ($this) {
            self::AD_NRT => 'Andorra — NRT (Número de Registre Tributari)',
            self::AE_TRN => 'Emirados Árabes Unidos — TRN (Tax Registration Number)',
            self::AL_TIN => 'Albânia — TIN (NIPT)',
            self::AM_TIN => 'Armênia — TIN (Taxpayer Identification Number)',
            self::AO_TIN => 'Angola — TIN (NIF)',
            self::AR_CUIT => 'Argentina — CUIT (Código Único de Identificación Tributaria)',

            self::AU_ABN => 'Austrália — ABN (Australian Business Number)',
            self::AU_ARN => 'Austrália — ARN (Australian Registered Body Number)',

            self::AW_TIN => 'Aruba — TIN',
            self::AZ_TIN => 'Azerbaijão — TIN',

            self::BA_TIN => 'Bósnia e Herzegovina — TIN',
            self::BB_TIN => 'Barbados — TIN',
            self::BD_BIN => 'Bangladesh — BIN',
            self::BF_IFU => 'Burkina Faso — IFU',
            self::BG_UIC => 'Bulgária — UIC',
            self::BH_VAT => 'Bahrein — VAT',
            self::BJ_IFU => 'Benin — IFU',
            self::BO_TIN => 'Bolívia — TIN (NIT)',

            self::BR_CNPJ => 'Brasil — CNPJ (Cadastro Nacional da Pessoa Jurídica)',
            self::BR_CPF => 'Brasil — CPF (Cadastro de Pessoas Físicas)',

            self::BS_TIN => 'Bahamas — TIN',
            self::BY_TIN => 'Bielorrússia — TIN',

            self::CA_BN => 'Canadá — BN (Business Number)',
            self::CA_GST_HST => 'Canadá — GST/HST',
            self::CA_PST_BC => 'Canadá (BC) — PST',
            self::CA_PST_MB => 'Canadá (MB) — PST',
            self::CA_PST_SK => 'Canadá (SK) — PST',
            self::CA_QST => 'Canadá (QC) — QST',

            self::CD_NIF => 'República Democrática do Congo — NIF',

            self::CH_UID => 'Suíça — UID (Unternehmens-Identifikationsnummer)',
            self::CH_VAT => 'Suíça — VAT (MWST/TVA/IVA)',

            self::CL_TIN => 'Chile — TIN (RUT)',
            self::CM_NIU => 'Camarões — NIU',
            self::CN_TIN => 'China — TIN',
            self::CO_NIT => 'Colômbia — NIT (Número de Identificación Tributaria)',
            self::CR_TIN => 'Costa Rica — TIN',
            self::CV_NIF => 'Cabo Verde — NIF',

            self::DE_STN => 'Alemanha — St.-Nr. (Steuernummer)',

            self::DO_RCN => 'República Dominicana — RNC',

            self::EC_RUC => 'Equador — RUC',
            self::EG_TIN => 'Egito — TIN',
            self::ES_CIF => 'Espanha — CIF (NIF)',
            self::ET_TIN => 'Etiópia — TIN',

            self::EU_OSS_VAT => 'União Europeia — OSS VAT',
            self::EU_VAT => 'União Europeia — VAT',

            self::GB_VAT => 'Reino Unido — VAT (Value Added Tax)',
            self::GE_VAT => 'Geórgia — VAT',
            self::GN_NIF => 'Guiné — NIF',

            self::HK_BR => 'Hong Kong — BR (Business Registration)',
            self::HR_OIB => 'Croácia — OIB',
            self::HU_TIN => 'Hungria — TIN (Adószám)',

            self::ID_NPWP => 'Indonésia — NPWP',
            self::IL_VAT => 'Israel — VAT',
            self::IN_GST => 'Índia — GST (GSTIN)',
            self::IS_VAT => 'Islândia — VAT (VSK)',

            self::JP_CN => 'Japão — Corporate Number',
            self::JP_RN => 'Japão — Registered Number',
            self::JP_TRN => 'Japão — Tax Registration Number',

            self::KE_PIN => 'Quênia — PIN',
            self::KG_TIN => 'Quirguistão — TIN',
            self::KH_TIN => 'Camboja — TIN',
            self::KR_BRN => 'Coreia do Sul — BRN',
            self::KZ_BIN => 'Cazaquistão — BIN',

            self::LA_TIN => 'Laos — TIN',

            self::LI_UID => 'Liechtenstein — UID',
            self::LI_VAT => 'Liechtenstein — VAT',

            self::LK_VAT => 'Sri Lanka — VAT',

            self::MA_VAT => 'Marrocos — VAT (IF)',
            self::MD_VAT => 'Moldávia — VAT',
            self::ME_PIB => 'Montenegro — PIB',
            self::MK_VAT => 'Macedônia do Norte — VAT',
            self::MR_NIF => 'Mauritânia — NIF',
            self::MX_RFC => 'México — RFC (Registro Federal de Contribuyentes)',

            self::MY_FRP => 'Malásia — FRP',
            self::MY_ITN => 'Malásia — ITN',
            self::MY_SST => 'Malásia — SST',

            self::NG_TIN => 'Nigéria — TIN',

            self::NO_VAT => 'Noruega — VAT (MVA)',
            self::NO_VOEC => 'Noruega — VOEC',

            self::NP_PAN => 'Nepal — PAN',
            self::NZ_GST => 'Nova Zelândia — GST',

            self::OM_VAT => 'Omã — VAT',

            self::PE_RUC => 'Peru — RUC',
            self::PH_TIN => 'Filipinas — TIN',
            self::PL_NIP => 'Polônia — NIP',

            self::RO_TIN => 'Romênia — TIN (CIF)',
            self::RS_PIB => 'Sérvia — PIB',

            self::RU_INN => 'Rússia — INN',
            self::RU_KPP => 'Rússia — KPP',

            self::SA_VAT => 'Arábia Saudita — VAT',

            self::SG_GST => 'Cingapura — GST',
            self::SG_UEN => 'Cingapura — UEN',

            self::SI_TIN => 'Eslovênia — TIN (Davčna številka)',
            self::SN_NINEA => 'Senegal — NINEA',
            self::SR_FIN => 'Suriname — FIN',
            self::SV_NIT => 'El Salvador — NIT',

            self::TH_VAT => 'Tailândia — VAT',
            self::TJ_TIN => 'Tajiquistão — TIN',
            self::TR_TIN => 'Turquia — TIN (VKN)',

            self::TW_VAT => 'Taiwan — VAT (Unified Business Number)',
            self::TZ_VAT => 'Tanzânia — VAT',

            self::UA_VAT => 'Ucrânia — VAT (IPN)',
            self::UG_TIN => 'Uganda — TIN',

            self::US_EIN => 'Estados Unidos — EIN (Employer Identification Number)',
            self::UY_RUC => 'Uruguai — RUC',

            self::UZ_TIN => 'Uzbequistão — TIN',
            self::UZ_VAT => 'Uzbequistão — VAT',

            self::VE_RIF => 'Venezuela — RIF',
            self::VN_TIN => 'Vietnã — TIN',

            self::ZA_VAT => 'África do Sul — VAT',

            self::ZM_TIN => 'Zâmbia — TIN',
            self::ZW_TIN => 'Zimbábue — TIN',
        };
    }

    /**
     * Retorna o código do país associado (ISO 3166-1 alpha-2).
     */
    public function countryCode(): string
    {
        return strtoupper(explode('_', $this->value)[0]);
    }

    /**
     * Retorna o array de opções formatado para campos Select/Dropdown no frontend.
     * Exemplo: [['label' => 'Brasil — CNPJ (Cadastro Nacional da Pessoa Jurídica)', 'value' => 'br_cnpj'], ...]
     *
     * @return array<int, array{label: string, value: string, country: string}>
     */
    public static function toSelect(): array
    {
        return array_map(
            fn (self $type) => [
                'label' => $type->label(),
                'value' => $type->value,
                'country' => $type->countryCode(),
            ],
            self::cases()
        );
    }

    /**
     * Retorna opções de select filtradas por código de país (ex: 'BR', 'US', 'CA').
     *
     * @return array<int, array{label: string, value: string, country: string}>
     */
    public static function forCountry(string $countryCode): array
    {
        $countryCode = strtoupper($countryCode);

        return array_values(
            array_filter(
                self::toSelect(),
                fn (array $item) => $item['country'] === $countryCode
            )
        );
    }
}