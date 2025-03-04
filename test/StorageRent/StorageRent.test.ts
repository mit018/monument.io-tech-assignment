import { calculateMonthlyRent, calculateNextRentDueDate, calculateProratedRent, canDecreaseOrIncreaseRent, shouldUpdateMonthlyRent } from "../../src/StorageRent/StorageRent";

describe("calculateMonthlyRent function", () => {

    it("should return MonthlyRentRecords", () => {

        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-01-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 1;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = .1;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate,
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-01-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00,
                rentDueDate: new Date("2023-02-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 121.00,
                rentDueDate: new Date("2023-03-01T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should return MonthlyRentRecords when lease starts in Feb", () => {

        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-02-05T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 31;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = .1;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate,
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
            {
                vacancy: true,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-01-31T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-02-05T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-02-28T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00,
                rentDueDate: new Date("2023-03-31T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should return MonthlyRentRecords when lease starts at the end of Feb", () => {

        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-02-28T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 31;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = .1;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate,
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
            {
                vacancy: true,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-01-31T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-02-28T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00,
                rentDueDate: new Date("2023-03-31T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should return MonthlyRentRecords validate first payment due date when lease start is before monthly due date", () => {

        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-01-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 15;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = .1;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate,
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-01-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-01-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00,
                rentDueDate: new Date("2023-02-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 121.00,
                rentDueDate: new Date("2023-03-15T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    // NEW tests

    it("should return MonthlyRentRecords when rentChangeRate is negative", () => {

        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-03-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-04-31T00:00:00");
        const dayOfMonthRentDue = 15;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = -.1;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate,
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
            {
                vacancy: true,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-01-15T00:00:00")
            },
            {
                vacancy: true,
                rentAmount: 90.00,
                rentDueDate: new Date("2023-02-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 90.00,
                rentDueDate: new Date("2023-03-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 90.00,
                rentDueDate: new Date("2023-03-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 90.00,
                rentDueDate: new Date("2023-04-15T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should return MonthlyRentRecords when rentRateChangeFrequency is 3", () => {

        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-03-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-07-31T00:00:00");
        const dayOfMonthRentDue = 15;
        const rentRateChangeFrequency = 3;
        const rentChangeRate = .1;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate,
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
            {
                vacancy: true,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-01-15T00:00:00")
            },
            {
                vacancy: true,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-02-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-03-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-03-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-04-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-05-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00,
                rentDueDate: new Date("2023-06-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00,
                rentDueDate: new Date("2023-07-15T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should return MonthlyRentRecords when rentRateChangeFrequency is 2 and rentChangeRate is negative", () => {

        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-05-20T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-07-31T00:00:00");
        const dayOfMonthRentDue = 15;
        const rentRateChangeFrequency = 2;
        const rentChangeRate = -.05;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate,
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
            {
                vacancy: true,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-01-15T00:00:00")
            },
            {
                vacancy: true,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-02-15T00:00:00")
            },
            {
                vacancy: true,
                rentAmount: 95.00,
                rentDueDate: new Date("2023-03-15T00:00:00")
            },
            {
                vacancy: true,
                rentAmount: 95.00,
                rentDueDate: new Date("2023-04-15T00:00:00")
            },
            {
                vacancy: true,
                rentAmount: 90.25,
                rentDueDate: new Date("2023-05-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 90.25,
                rentDueDate: new Date("2023-05-20T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 90.25,
                rentDueDate: new Date("2023-06-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 90.25,
                rentDueDate: new Date("2023-07-15T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should return MonthlyRentRecords when prorateFirstMonth is true and lease start date is before current's month due day", () => {

        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-02-20T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-04-01T00:00:00");
        const dayOfMonthRentDue = 31;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = .1;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate,
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate, true);

        let expectedResult = [
            {
                vacancy: true,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-01-31T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 26.67,
                rentDueDate: new Date("2023-02-20T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-02-28T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00,
                rentDueDate: new Date("2023-03-31T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should return MonthlyRentRecords when prorateFirstMonth is true and lease start date is after current's month due day", () => {

        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-02-20T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-04-01T00:00:00");
        const dayOfMonthRentDue = 15;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = .1;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate,
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate, true);

        let expectedResult = [
            {
                vacancy: true,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-01-15T00:00:00")
            },
            {
                vacancy: true,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-02-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 83.33,
                rentDueDate: new Date("2023-02-20T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-03-15T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should return MonthlyRentRecords when prorateFirstMonth is true and lease start date is equal to current's month due day", () => {

        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-02-15T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-04-01T00:00:00");
        const dayOfMonthRentDue = 15;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = .1;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate,
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate, true);

        let expectedResult = [
            {
                vacancy: true,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-01-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-02-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00,
                rentDueDate: new Date("2023-03-15T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });
});

describe("calculateNextRentDueDate function", () => {
    it("should return the same date if includeCurrent is true and the date matches the rent due day", () => {
        const result = calculateNextRentDueDate(new Date(2025, 1, 15), 15, true);
        const expected = new Date(2025, 1, 15);
        expect(result).toEqual(expected);
    });

    it("should return the same month's rent due date if the target day is later in the month", () => {
        expect(calculateNextRentDueDate(new Date(2025, 1, 10), 15))
            .toEqual(new Date(2025, 1, 15));
    });

    it("should return the next month's rent due date if the current date is after the due day", () => {
        expect(calculateNextRentDueDate(new Date(2025, 1, 20), 15))
            .toEqual(new Date(2025, 2, 15));
    });

    it("should return the last day of the month if rentDueDay is greater than the number of days in the month", () => {
        expect(calculateNextRentDueDate(new Date(2025, 1, 10), 31))
            .toEqual(new Date(2025, 1, 28));
    });

    it("should correctly move to the next month when the target day is invalid and includeCurrent is false", () => {
        expect(calculateNextRentDueDate(new Date(2025, 1, 28), 31))
            .toEqual(new Date(2025, 2, 31));
    });

    it("should not move to the next month when the target day is invalid and includeCurrent is true", () => {
        expect(calculateNextRentDueDate(new Date(2025, 1, 28), 31, true))
            .toEqual(new Date(2025, 1, 28));
    });

    it("should correctly handle December to January transitions", () => {
        expect(calculateNextRentDueDate(new Date(2025, 11, 29), 31))
            .toEqual(new Date(2025, 11, 31));
    });

    it("should correctly handle leap years when the target day is beyond February 29", () => {
        expect(calculateNextRentDueDate(new Date(2024, 1, 10), 31))
            .toEqual(new Date(2024, 1, 29)); // 2024 is a leap year
    });

    it("should correctly handle non-leap years when the target day is beyond February 28", () => {
        expect(calculateNextRentDueDate(new Date(2025, 1, 10), 31))
            .toEqual(new Date(2025, 1, 28)); // 2025 is not a leap year
    });

    it("should correctly transition from a 30-day month to a 31-day month", () => {
        expect(calculateNextRentDueDate(new Date(2025, 3, 30), 31))
            .toEqual(new Date(2025, 4, 31)); // April → May (30 → 31 days)
    });
});

describe("calculateProratedRent function", () => {

    it("should return full rent if lease starts exactly on rent due day", () => {
        expect(calculateProratedRent(1000, new Date(2025, 1, 15), 15))
            .toBe(1000);
    });

    it("should calculate prorated rent if lease starts before rent due date", () => {
        expect(calculateProratedRent(1000, new Date(2025, 1, 5), 15))
            .toBeCloseTo(333.33, 2); // (15 - 5) / 30 * 1000 = 333.33
    });

    it("should calculate prorated rent if lease starts after rent due date", () => {
        expect(calculateProratedRent(1000, new Date(2025, 1, 20), 15))
            .toBeCloseTo(833.33, 2); // (1 - (20 - 15) / 30) * 1000 = 833.33
    });

    it("should return full rent if lease starts at the end of the month but before rent due day", () => {
        expect(calculateProratedRent(1000, new Date(2025, 1, 28), 31))
            .toBe(1000);
    });

    it("should handle months with 30 days correctly", () => {
        expect(calculateProratedRent(1200, new Date(2025, 3, 10), 30))
            .toBeCloseTo(800, 2); // (30 - 10) / 30 * 1200 = 800
    });

    it("should handle months with 31 days correctly", () => {
        expect(calculateProratedRent(1200, new Date(2025, 6, 15), 31))
            .toBeCloseTo(640, 2); // (31 - 15) / 30 * 1200 = 640
    });

    it("should handle leap years when rent is due on Feb 29", () => {
        expect(calculateProratedRent(1000, new Date(2024, 1, 10), 29))
            .toBeCloseTo(633.33, 2); // (29 - 10) / 30 * 1000 = 633.33
    });

    it("should handle non-leap years when rent is due on Feb 28", () => {
        expect(calculateProratedRent(1000, new Date(2025, 1, 10), 28))
            .toBeCloseTo(600, 2); // (28 - 10) / 30 * 1000 = 600
    });
});

describe("canDecreaseOrIncreaseRent function", () => {

    it("should allow rent increase when unit is occupied and rate is positive", () => {
        expect(canDecreaseOrIncreaseRent(false, 0.1)).toBe(true);
    });

    it("should not allow rent increase when unit is vacant", () => {
        expect(canDecreaseOrIncreaseRent(true, 0.1)).toBe(false);
    });

    it("should allow rent decrease when unit is vacant and rate is negative", () => {
        expect(canDecreaseOrIncreaseRent(true, -0.1)).toBe(true);
    });

    it("should not allow rent decrease when unit is occupied", () => {
        expect(canDecreaseOrIncreaseRent(false, -0.1)).toBe(false);
    });

    it("should not allow rent change when rate is zero, even if occupied", () => {
        expect(canDecreaseOrIncreaseRent(false, 0)).toBe(false);
    });

    it("should not allow rent change when rate is zero, even if vacant", () => {
        expect(canDecreaseOrIncreaseRent(true, 0)).toBe(false);
    });

    it("should not allow rent increase when rate is negative and occupied", () => {
        expect(canDecreaseOrIncreaseRent(false, -0.05)).toBe(false);
    });

    it("should not allow rent decrease when rate is positive and vacant", () => {
        expect(canDecreaseOrIncreaseRent(true, 0.05)).toBe(false);
    });

});

describe("shouldUpdateMonthlyRent function", () => {

    it("should update rent exactly on the eligible change date", () => {
        expect(shouldUpdateMonthlyRent(
            new Date(2025, 2, 1),
            new Date(2025, 1, 1),
            1
        )).toBe(true);
    });

    it("should update rent after the eligible change date", () => {
        expect(shouldUpdateMonthlyRent(
            new Date(2025, 2, 15),
            new Date(2025, 1, 1),
            1
        )).toBe(true);
    });

    it("should not update rent before the change date", () => {
        expect(shouldUpdateMonthlyRent(
            new Date(2025, 1, 28),
            new Date(2025, 1, 1),
            1
        )).toBe(false);
    });

    it("should update rent every 2 months", () => {
        expect(shouldUpdateMonthlyRent(
            new Date(2025, 3, 1),
            new Date(2025, 1, 1),
            2
        )).toBe(true);
    });

    it("should not update rent if only 1 month has passed but frequency is 2", () => {
        expect(shouldUpdateMonthlyRent(
            new Date(2025, 2, 1),
            new Date(2025, 1, 1),
            2
        )).toBe(false);
    });

    it("should update rent exactly after 6 months", () => {
        expect(shouldUpdateMonthlyRent(
            new Date(2025, 7, 1),
            new Date(2025, 1, 1),
            6
        )).toBe(true);
    });

    it("should not update rent if only 5 months passed but frequency is 6", () => {
        expect(shouldUpdateMonthlyRent(
            new Date(2025, 6, 1),
            new Date(2025, 1, 1),
            6
        )).toBe(false);
    });

    it("should update rent exactly after 12 months (1 year)", () => {
        expect(shouldUpdateMonthlyRent(
            new Date(2026, 1, 1),
            new Date(2025, 1, 1),
            12
        )).toBe(true);
    });

    it("should not update rent if 11 months have passed but frequency is 12", () => {
        expect(shouldUpdateMonthlyRent(
            new Date(2026, 0, 1),
            new Date(2025, 1, 1),
            12
        )).toBe(false);
    });

    it("should handle leap years correctly when change date falls on February 29", () => {
        expect(shouldUpdateMonthlyRent(
            new Date(2028, 1, 29),
            new Date(2027, 1, 28),
            12
        )).toBe(true);
    });

    it("should handle month-end differences correctly", () => {
        expect(shouldUpdateMonthlyRent(
            new Date(2025, 3, 30),
            new Date(2025, 1, 28),
            2
        )).toBe(true);
    });

});