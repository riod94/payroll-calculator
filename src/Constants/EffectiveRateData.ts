import { EffectiveRateEntry } from "../Types";

export default class EffectiveRateData {
    /**
     * EfectiveRateData::$listOfPTKPCategory
     * List Category berdasarkan PTKP Status
     *
     * @type {Record<string, string>}
     */
    public static readonly listOfPTKPCategory: Record<string, string> = {
        'TK/0': 'A',
        'TK/1': 'A',
        'TK/2': 'B',
        'TK/3': 'B',
        'K/0': 'A',
        'K/1': 'B',
        'K/2': 'B',
        'K/3': 'C',
    };

    /**
     * EfectiveRateData::$listOfEffectiveRate
     * List Tarif Efektif berdasarkan kategori
     *
     * @type {Record<string, EffectiveRateEntry[]>}
     */
    public static readonly listOfEffectiveRate: Record<string, EffectiveRateEntry[]> = {
        'A': [
            {
                'from': 0,
                'until': 5400000,
                'rate': 0,
            },
            {
                'from': 5400000,
                'until': 5650000,
                'rate': 0.0025,
            },
            {
                'from': 5650000,
                'until': 5950000,
                'rate': 0.005,
            },
            {
                'from': 5950000,
                'until': 6300000,
                'rate': 0.0075,
            },
            {
                'from': 6300000,
                'until': 6750000,
                'rate': 0.01,
            },
            {
                'from': 6750000,
                'until': 7500000,
                'rate': 0.0125,
            },
            {
                'from': 7500000,
                'until': 8550000,
                'rate': 0.015,
            },
            {
                'from': 8550000,
                'until': 9650000,
                'rate': 0.0175,
            },
            {
                'from': 9650000,
                'until': 10050000,
                'rate': 0.02,
            },
            {
                'from': 10050000,
                'until': 10350000,
                'rate': 0.0225,
            },
            {
                'from': 10350000,
                'until': 10700000,
                'rate': 0.025,
            },
            {
                'from': 10700000,
                'until': 11050000,
                'rate': 0.03,
            },
            {
                'from': 11050000,
                'until': 11600000,
                'rate': 0.035,
            },
            {
                'from': 11600000,
                'until': 12500000,
                'rate': 0.04,
            },
            {
                'from': 12500000,
                'until': 13750000,
                'rate': 0.05,
            },
            {
                'from': 13750000,
                'until': 15100000,
                'rate': 0.06,
            },
            {
                'from': 15100000,
                'until': 16950000,
                'rate': 0.07,
            },
            {
                'from': 16950000,
                'until': 19750000,
                'rate': 0.08,
            },
            {
                'from': 19750000,
                'until': 24150000,
                'rate': 0.09,
            },
            {
                'from': 24150000,
                'until': 26450000,
                'rate': 0.1,
            },
            {
                'from': 26450000,
                'until': 28000000,
                'rate': 0.11,
            },
            {
                'from': 28000000,
                'until': 30050000,
                'rate': 0.12,
            },
            {
                'from': 30050000,
                'until': 32400000,
                'rate': 0.13,
            },
            {
                'from': 32400000,
                'until': 35400000,
                'rate': 0.14,
            },
            {
                'from': 35400000,
                'until': 39100000,
                'rate': 0.15,
            },
            {
                'from': 39100000,
                'until': 43850000,
                'rate': 0.16,
            },
            {
                'from': 43850000,
                'until': 47800000,
                'rate': 0.17,
            },
            {
                'from': 47800000,
                'until': 51400000,
                'rate': 0.18,
            },
            {
                'from': 51400000,
                'until': 56300000,
                'rate': 0.19,
            },
            {
                'from': 56300000,
                'until': 62200000,
                'rate': 0.2,
            },
            {
                'from': 62200000,
                'until': 68600000,
                'rate': 0.21,
            },
            {
                'from': 68600000,
                'until': 77500000,
                'rate': 0.22,
            },
            {
                'from': 77500000,
                'until': 89000000,
                'rate': 0.23,
            },
            {
                'from': 89000000,
                'until': 103000000,
                'rate': 0.24,
            },
            {
                'from': 103000000,
                'until': 125000000,
                'rate': 0.25,
            },
            {
                'from': 125000000,
                'until': 157000000,
                'rate': 0.26,
            },
            {
                'from': 157000000,
                'until': 206000000,
                'rate': 0.27,
            },
            {
                'from': 206000000,
                'until': 337000000,
                'rate': 0.28,
            },
            {
                'from': 337000000,
                'until': 454000000,
                'rate': 0.29,
            },
            {
                'from': 454000000,
                'until': 550000000,
                'rate': 0.3,
            },
            {
                'from': 550000000,
                'until': 695000000,
                'rate': 0.31,
            },
            {
                'from': 695000000,
                'until': 910000000,
                'rate': 0.32,
            },
            {
                'from': 910000000,
                'until': 1400000000,
                'rate': 0.33,
            },
            {
                'from': 1400000000,
                'until': 0,
                'rate': 0.34,
            },
        ],
        'B': [
            {
                'from': 0,
                'until': 6200000,
                'rate': 0,
            },
            {
                'from': 6200000,
                'until': 6500000,
                'rate': 0.0025,
            },
            {
                'from': 6500000,
                'until': 6850000,
                'rate': 0.005,
            },
            {
                'from': 6850000,
                'until': 7300000,
                'rate': 0.0075,
            },
            {
                'from': 7300000,
                'until': 9200000,
                'rate': 0.01,
            },
            {
                'from': 9200000,
                'until': 10750000,
                'rate': 0.015,
            },
            {
                'from': 10750000,
                'until': 11250000,
                'rate': 0.02,
            },
            {
                'from': 11250000,
                'until': 11600000,
                'rate': 0.025,
            },
            {
                'from': 11600000,
                'until': 12600000,
                'rate': 0.03,
            },
            {
                'from': 12600000,
                'until': 13600000,
                'rate': 0.04,
            },
            {
                'from': 13600000,
                'until': 14950000,
                'rate': 0.05,
            },
            {
                'from': 14950000,
                'until': 16400000,
                'rate': 0.06,
            },
            {
                'from': 16400000,
                'until': 18450000,
                'rate': 0.07,
            },
            {
                'from': 18450000,
                'until': 21850000,
                'rate': 0.08,
            },
            {
                'from': 21850000,
                'until': 26000000,
                'rate': 0.09,
            },
            {
                'from': 26000000,
                'until': 27700000,
                'rate': 0.1,
            },
            {
                'from': 27700000,
                'until': 29350000,
                'rate': 0.11,
            },
            {
                'from': 29350000,
                'until': 31450000,
                'rate': 0.12,
            },
            {
                'from': 31450000,
                'until': 33950000,
                'rate': 0.13,
            },
            {
                'from': 33950000,
                'until': 37100000,
                'rate': 0.14,
            },
            {
                'from': 37100000,
                'until': 41100000,
                'rate': 0.15,
            },
            {
                'from': 41100000,
                'until': 45800000,
                'rate': 0.16,
            },
            {
                'from': 45800000,
                'until': 49500000,
                'rate': 0.17,
            },
            {
                'from': 49500000,
                'until': 53800000,
                'rate': 0.18,
            },
            {
                'from': 53800000,
                'until': 58500000,
                'rate': 0.19,
            },
            {
                'from': 58500000,
                'until': 64000000,
                'rate': 0.2,
            },
            {
                'from': 64000000,
                'until': 71000000,
                'rate': 0.21,
            },
            {
                'from': 71000000,
                'until': 80000000,
                'rate': 0.22,
            },
            {
                'from': 80000000,
                'until': 93000000,
                'rate': 0.23,
            },
            {
                'from': 93000000,
                'until': 109000000,
                'rate': 0.24,
            },
            {
                'from': 109000000,
                'until': 129000000,
                'rate': 0.25,
            },
            {
                'from': 129000000,
                'until': 163000000,
                'rate': 0.26,
            },
            {
                'from': 163000000,
                'until': 211000000,
                'rate': 0.27,
            },
            {
                'from': 211000000,
                'until': 374000000,
                'rate': 0.28,
            },
            {
                'from': 374000000,
                'until': 459000000,
                'rate': 0.29,
            },
            {
                'from': 459000000,
                'until': 555000000,
                'rate': 0.3,
            },
            {
                'from': 555000000,
                'until': 704000000,
                'rate': 0.31,
            },
            {
                'from': 704000000,
                'until': 957000000,
                'rate': 0.32,
            },
            {
                'from': 957000000,
                'until': 1405000000,
                'rate': 0.33,
            },
            {
                'from': 1405000000,
                'until': 0,
                'rate': 0.34,
            },
        ],
        'C': [
            {
                'from': 0,
                'until': 6600000,
                'rate': 0,
            },
            {
                'from': 6600000,
                'until': 6950000,
                'rate': 0.0025,
            },
            {
                'from': 6950000,
                'until': 7350000,
                'rate': 0.005,
            },
            {
                'from': 7350000,
                'until': 7800000,
                'rate': 0.0075,
            },
            {
                'from': 7800000,
                'until': 8850000,
                'rate': 0.01,
            },
            {
                'from': 8850000,
                'until': 9800000,
                'rate': 0.0125,
            },
            {
                'from': 9800000,
                'until': 10950000,
                'rate': 0.015,
            },
            {
                'from': 10950000,
                'until': 11200000,
                'rate': 0.0175,
            },
            {
                'from': 11200000,
                'until': 12050000,
                'rate': 0.02,
            },
            {
                'from': 12050000,
                'until': 12950000,
                'rate': 0.03,
            },
            {
                'from': 12950000,
                'until': 14150000,
                'rate': 0.04,
            },
            {
                'from': 14150000,
                'until': 15550000,
                'rate': 0.05,
            },
            {
                'from': 15550000,
                'until': 17050000,
                'rate': 0.06,
            },
            {
                'from': 17050000,
                'until': 19500000,
                'rate': 0.07,
            },
            {
                'from': 19500000,
                'until': 22700000,
                'rate': 0.08,
            },
            {
                'from': 22700000,
                'until': 26600000,
                'rate': 0.09,
            },
            {
                'from': 26600000,
                'until': 28100000,
                'rate': 0.1,
            },
            {
                'from': 28100000,
                'until': 30100000,
                'rate': 0.11,
            },
            {
                'from': 30100000,
                'until': 32600000,
                'rate': 0.12,
            },
            {
                'from': 32600000,
                'until': 35400000,
                'rate': 0.13,
            },
            {
                'from': 35400000,
                'until': 38900000,
                'rate': 0.14,
            },
            {
                'from': 38900000,
                'until': 43000000,
                'rate': 0.15,
            },
            {
                'from': 43000000,
                'until': 47400000,
                'rate': 0.16,
            },
            {
                'from': 47400000,
                'until': 51200000,
                'rate': 0.17,
            },
            {
                'from': 51200000,
                'until': 55800000,
                'rate': 0.18,
            },
            {
                'from': 55800000,
                'until': 60400000,
                'rate': 0.19,
            },
            {
                'from': 60400000,
                'until': 66700000,
                'rate': 0.2,
            },
            {
                'from': 66700000,
                'until': 74500000,
                'rate': 0.21,
            },
            {
                'from': 74500000,
                'until': 83200000,
                'rate': 0.22,
            },
            {
                'from': 83200000,
                'until': 95600000,
                'rate': 0.23,
            },
            {
                'from': 95600000,
                'until': 110000000,
                'rate': 0.24,
            },
            {
                'from': 110000000,
                'until': 134000000,
                'rate': 0.25,
            },
            {
                'from': 134000000,
                'until': 169000000,
                'rate': 0.26,
            },
            {
                'from': 169000000,
                'until': 221000000,
                'rate': 0.27,
            },
            {
                'from': 221000000,
                'until': 390000000,
                'rate': 0.28,
            },
            {
                'from': 390000000,
                'until': 463000000,
                'rate': 0.29,
            },
            {
                'from': 463000000,
                'until': 561000000,
                'rate': 0.3,
            },
            {
                'from': 561000000,
                'until': 709000000,
                'rate': 0.31,
            },
            {
                'from': 709000000,
                'until': 965000000,
                'rate': 0.32,
            },
            {
                'from': 965000000,
                'until': 1419000000,
                'rate': 0.33,
            },
            {
                'from': 1419000000,
                'until': 0,
                'rate': 0.34,
            },
        ],
    }

}