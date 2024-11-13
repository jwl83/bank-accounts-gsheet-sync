// Get current date in dddd-mm-dd format
export const getCurrentDate = () => new Date().toISOString().split('T')[0];
