const RENT_PRECISION_POINTS = 2;

export type MonthlyRentRecord = {
    vacancy: boolean,
    rentAmount: number,
    rentDueDate: Date
}

export type MonthlyRentRecords = Array<MonthlyRentRecord>;

/**
 * Determines the vacancy, rent amount and due date for each month in a given time window
 * 
 * @param baseMonthlyRent : The base or starting monthly rent for unit (Number)
 * @param leaseStartDate : The date that the tenant's lease starts (Date)
 * @param windowStartDate : The first date of the given time window (Date)
 * @param windowEndDate : The last date of the given time window (Date)
 * @param dayOfMonthRentDue : The day of each month on which rent is due (Number)
 * @param rentRateChangeFrequency : The frequency in months the rent is changed (Number)
 * @param rentChangeRate : The rate to increase or decrease rent, input as decimal (not %), positive for increase, negative for decrease (Number),
 * @param prorateFirstMonth : Whether to calculate the first month's rent proportionally based on the number of days occupied (Boolean),
 * @returns Array<MonthlyRentRecord>;
 */
export function calculateMonthlyRent(baseMonthlyRent: number, leaseStartDate: Date, windowStartDate: Date,
    windowEndDate: Date, dayOfMonthRentDue: number, rentRateChangeFrequency: number, rentChangeRate: number, prorateFirstMonth = false) {
    if (leaseStartDate >= windowEndDate) throw new Error("Lease start date should occur before window end date.");

    const monthlyRentRecords: MonthlyRentRecords = [];

    let rentDueDate = calculateNextRentDueDate(windowStartDate, dayOfMonthRentDue, true);
    if (leaseStartDate < rentDueDate) rentDueDate = new Date(leaseStartDate);

    let vacancy = leaseStartDate > rentDueDate; // lease starts after the next rent due date
    let monthlyRent = baseMonthlyRent;
    let firstRentFlag = false;
    let firstMonthRentAmount;
    let rentChangeDateTracker;

    while (rentDueDate <= windowEndDate) {

        if (!firstRentFlag && leaseStartDate <= rentDueDate) {
            vacancy = false;
            firstMonthRentAmount = prorateFirstMonth ? calculateProratedRent(monthlyRent, leaseStartDate, dayOfMonthRentDue) : monthlyRent;
            rentDueDate = leaseStartDate;
            firstRentFlag = true;
        }

        if (canDecreaseOrIncreaseRent(vacancy, rentChangeRate)) {
            if (!rentChangeDateTracker) {
                rentChangeDateTracker = rentDueDate;
            }
            else if (shouldUpdateMonthlyRent(rentDueDate, rentChangeDateTracker, rentRateChangeFrequency)) {
                rentChangeDateTracker = addMonthsToDate(rentChangeDateTracker, rentRateChangeFrequency);

                monthlyRent = format(calculateNewMonthlyRent(monthlyRent, rentChangeRate));
            }
        }

        monthlyRentRecords.push({
            vacancy,
            rentAmount: firstMonthRentAmount ?? monthlyRent,
            rentDueDate: rentDueDate,
        })
        if (firstMonthRentAmount) firstMonthRentAmount = null;

        rentDueDate = calculateNextRentDueDate(rentDueDate, dayOfMonthRentDue);
    }

    return monthlyRentRecords;
}

//Helper functions.

/**
 * Calculates the next occurrence of a given day in the month.
 * If the flag is true and the current date already matches the target day, it returns the current date.
 * If the day is greater than the number of days in the month, it uses the last day of the month.
 *
 * @param date The reference date (Date)
 * @param rentDueDay The on which rent is due (Number)
 * @param includeCurrent Whether to include the current date if it already matches the target day (Boolean)
 * @returns The next valid occurrence of the given day (Date).
 */
export function calculateNextRentDueDate(date: Date, rentDueDay: number, includeCurrent = false): Date {
    const year = date.getFullYear();
    const month = date.getMonth();
    const currentDay = date.getDate();

    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const validDay = Math.min(rentDueDay, lastDayOfMonth);

    if (includeCurrent && currentDay === validDay) return new Date(date);

    if (currentDay < validDay) return new Date(year, month, validDay);

    // move to the next month and find the closest valid day
    const nextMonth = month + 1;
    const nextLastDay = new Date(year, nextMonth + 1, 0).getDate();
    const nextValidDay = Math.min(rentDueDay, nextLastDay);

    return new Date(year, nextMonth, nextValidDay);
}

/**
 * Calculates the prorated rent for the first month if the lease does not begin on the rent due date.
 * The calculation always assumes a 30-day month, regardless of the actual days in the month.
 *
 * @param monthlyRent The monthly rent amount (Number)
 * @param leaseStartDate The date the lease begins (Date)
 * @param rentDueDay The next rent due day (Number)
 * @returns The prorated rent amount (Number)
 */
export function calculateProratedRent(monthlyRent: number, leaseStartDate: Date, rentDueDay: number): number {
    const daysPerMonth = 30;
    const monthBegining = new Date(leaseStartDate.getFullYear(), leaseStartDate.getMonth(), 1);
    const rentDueDate = calculateNextRentDueDate(monthBegining, rentDueDay, true);

    let occupiedDaysProportion: number;

    if (monthBegining.toISOString() === leaseStartDate.toISOString()) return format(monthlyRent);


    if (leaseStartDate < rentDueDate)
        occupiedDaysProportion = (rentDueDate.getDate() - leaseStartDate.getDate()) / daysPerMonth;  // lease starts before the rent due date
    else
        occupiedDaysProportion = 1 - ((leaseStartDate.getDate() - rentDueDate.getDate()) / daysPerMonth); // lease starts after the rent due date

    return format((occupiedDaysProportion * monthlyRent));
}

/**
 * Checks if vacancy and change rate values are eligible to either increase or decrease the rent value
 * 
 * @param vacancy Whether the unit is vacant (Boolean)
 * @param rentChangeRate The rate to increase or decrease rent, input as decimal (not %), positive for increase, negative for decrease (Number)
 * @returns If values are eligible to apply a rent change (Boolean)
 */
export function canDecreaseOrIncreaseRent(vacancy: boolean, rentChangeRate: number) {
    const shouldDecrease = (vacancy && rentChangeRate < 0);
    const shouldIncrease = (!vacancy && rentChangeRate > 0);

    return shouldDecrease || shouldIncrease;
}

/**
 * Checks if date is eligible to update monthly rent value based on the rate change frequency
 * 
 * @param currentDate The current date (Date)
 * @param lastChangeDate The last change date (Date)
 * @param rentRateChangeFrequency The frequency in months the rent is changed (Number)
 * @returns 
 */
export function shouldUpdateMonthlyRent(currentDate: Date, lastChangeDate: Date, rentRateChangeFrequency: number) {

    const nextChangeDate = new Date(lastChangeDate);
    // get the next eligible rent change date
    nextChangeDate.setMonth(nextChangeDate.getMonth() + rentRateChangeFrequency);

    return currentDate >= nextChangeDate;
}

/**
 * Adds a given number of months to a date while preserving the day as much as possible.
 * If the target month has fewer days than the original date, it sets the date to the last valid day of the month.
 *
 * @param date - The original date.
 * @param monthsToAdd - The number of months to add.
 * @returns The new date with the added months (Date).
 */
export function addMonthsToDate(date: Date, monthsToAdd: number): Date {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + monthsToAdd);

    const lastDayOfNewMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    if (newDate.getDate() > lastDayOfNewMonth) {
        newDate.setDate(lastDayOfNewMonth);
    }

    return newDate;
}

/**
 * Formats a numeric value with a given number of precision points
 * 
 * @param value Value to be formatted (Number)
 * @param precision Precision points (Number)
 * @returns Formatted number (Number)
 */
export function format(value: number, precision = RENT_PRECISION_POINTS): number {
    return Number(value.toFixed(precision));
}

/**
 * Calculates the new monthly rent
 * 
 * @param baseMonthlyRent : the base amount of rent
 * @param rentChangeRate : the rate that rent my increase or decrease (positive for increase, negative for decrease)
 * @returns number
 * 
 */
function calculateNewMonthlyRent(baseMonthlyRent: number, rentChangeRate: number) {
    return baseMonthlyRent * (1 + rentChangeRate);
}

/**
 * Determines if the year is a leap year
 * 
 * @param year 
 * @returns boolean
 * 
 */
function isLeapYear(year: number) {
    return (year % 4 == 0 && year % 100 != 0);
}