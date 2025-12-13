
const addBusinessDays = (startDate, days) => {
    const result = new Date(startDate);
    let count = 0;
    while (count < days) {
        result.setDate(result.getDate() + 1);
        const day = result.getDay();
        if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
            count++;
        }
    }
    return result;
};

// Test Case: Thursday 11th + 3 business days
const date = new Date(2025, 11, 11); // Month is 0-indexed, so 11 is Dec. Wait, user said "dia 11". Assuming current month or next.
// Let's assume Dec 11, 2025 (Thursday)
// Dec 11 2025 is a Thursday.
// 12 (Fri) - 1
// 13 (Sat)
// 14 (Sun)
// 15 (Mon) - 2
// 16 (Tue) - 3
// Result should be Dec 16.

console.log("Start:", date.toDateString());
const result = addBusinessDays(date, 3);
console.log("Result:", result.toDateString());
