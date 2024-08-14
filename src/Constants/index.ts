import { JKKRiskGradePercent, PPHRateLayerList, PTKPCategory, PTKPList, TerDaily } from "../Types";

const PPH_RATE_LAYER_LIST: PPHRateLayerList = {
    2021: [
        { 'index': 1, 'from': 0, 'until': 50000000, 'rate_percentage': (5 / 100), 'benefit': 0, 'subtract': 0, 'gross_up_from': 0, 'gross_up_until': 47500000 },
        { 'index': 2, 'from': 50000000, 'until': 250000000, 'rate_percentage': (15 / 100), 'benefit': 2500000, 'subtract': 47500000, 'gross_up_from': 47500000, 'gross_up_until': 217500000 },
        { 'index': 3, 'from': 250000000, 'until': 500000000, 'rate_percentage': (25 / 100), 'benefit': 32500000, 'subtract': 217500000, 'gross_up_from': 217500000, 'gross_up_until': 405000000 },
        { 'index': 4, 'from': 500000000, 'until': 0, 'rate_percentage': (30 / 100), 'benefit': 95000000, 'subtract': 405000000, 'gross_up_from': 405000000, 'gross_up_until': 0 },
    ],
    2022: [
        { 'index': 1, 'from': 0, 'until': 60000000, 'rate_percentage': (5 / 100), 'benefit': 0, 'subtract': 0, 'gross_up_from': 0, 'gross_up_until': 57000000 },
        { 'index': 2, 'from': 60000000, 'until': 250000000, 'rate_percentage': (15 / 100), 'benefit': 3000000, 'subtract': 57000000, 'gross_up_from': 57000000, 'gross_up_until': 218500000 },
        { 'index': 3, 'from': 250000000, 'until': 500000000, 'rate_percentage': (25 / 100), 'benefit': 31500000, 'subtract': 218500000, 'gross_up_from': 218500000, 'gross_up_until': 406000000 },
        { 'index': 4, 'from': 500000000, 'until': 5000000000, 'rate_percentage': (30 / 100), 'benefit': 94000000, 'subtract': 406000000, 'gross_up_from': 406000000, 'gross_up_until': 3556000000 },
        { 'index': 5, 'from': 5000000000, 'until': 0, 'rate_percentage': (35 / 100), 'benefit': 1444000000, 'subtract': 3556000000, 'gross_up_from': 3556000000, 'gross_up_until': 0 },
    ],
};

const LIST_OF_PTKP: PTKPList = {
    'TK/0': 54000000,
    'TK/1': 58500000,
    'TK/2': 63000000,
    'TK/3': 67500000,
    'K/0': 58500000,
    'K/1': 63000000,
    'K/2': 67500000,
    'K/3': 72000000,
};

const LIST_OF_JKK_RISK_GRADE_PERCENT: JKKRiskGradePercent = {
    1: 0.24,
    2: 0.54,
    3: 0.89,
    4: 1.27,
    5: 1.74,
};

const LIST_OF_PTKP_CATEGORY: PTKPCategory = {
    'TK/0': 'A',
    'TK/1': 'A',
    'TK/2': 'B',
    'TK/3': 'B',
    'K/0': 'A',
    'K/1': 'B',
    'K/2': 'B',
    'K/3': 'C',
};

const TER_DAILY: TerDaily[] = [
    {
        'from': 0,
        'until': 450000,
        'rate': 0,
    },
    {
        'from': 450000,
        'until': 2500000,
        'rate': 0.005,
    },
];

const CALCULATION = {
    NETT: 'NETT',
    GROSS: 'GROSS',
    GROSS_UP: 'GROSSUP',
}

export {
    PPH_RATE_LAYER_LIST,
    LIST_OF_PTKP,
    LIST_OF_JKK_RISK_GRADE_PERCENT,
    LIST_OF_PTKP_CATEGORY,
    TER_DAILY,
    CALCULATION,
}