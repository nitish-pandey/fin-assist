import NepaliDate from "nepali-date-converter";

/**
 * Convert BS (Bikram Sambat) date to AD (Anno Domini) date
 * @param bsYear - BS year
 * @param bsMonth - BS month (1-12)
 * @param bsDay - BS day (1-32)
 * @returns Object with year, month, and day in AD
 */
export function convertBsToAd(bsYear: number, bsMonth: number, bsDay: number) {
    // Create NepaliDate instance (months are 0-indexed in the constructor)
    const nepaliDate = new NepaliDate(bsYear, bsMonth - 1, bsDay);

    // Convert to JS Date (AD)
    const adDate = nepaliDate.toJsDate();

    return {
        year: adDate.getFullYear(),
        month: adDate.getMonth() + 1,
        day: adDate.getDate(),
    };
}

/**
 * Convert AD (Anno Domini) date to BS (Bikram Sambat) date
 * @param adYear - AD year
 * @param adMonth - AD month (1-12)
 * @param adDay - AD day (1-31)
 * @returns Object with year, month, and day in BS
 */
export function convertAdToBs(adYear: number, adMonth: number, adDay: number) {
    // Create NepaliDate from JS Date
    const jsDate = new Date(adYear, adMonth - 1, adDay);
    const nepaliDate = new NepaliDate(jsDate);

    // Get BS date
    const bsDate = nepaliDate.getBS();

    return {
        year: bsDate.year,
        month: bsDate.month + 1, // Convert from 0-indexed to 1-indexed
        day: bsDate.date,
    };
}
