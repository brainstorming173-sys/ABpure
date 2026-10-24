// Manual mobile money payment numbers (set in .env)
export const settings = {
  paymentNumbers: (process.env.PAYMENT_NUMBERS || '').split(',').map((s) => s.trim()).filter(Boolean),
};
