// Sales tax switch.
//
// TODO(owner + accountant): Puerto Rico IVU (sales and use tax) is NOT collected today.
// Checkout charges $0 tax. Whether and how Xstatic Fit must collect IVU on PR orders
// (and any US state or Canadian tax on other orders) is a legal and accounting decision,
// not a code decision. Do not flip this flag until an accountant confirms:
//   1. the business is registered with Hacienda (SURI) and has a merchant registration number,
//   2. which rate applies to these products and buyers,
//   3. how returns are filed.
//
// When COLLECT_SALES_TAX is true, the checkout route turns on Stripe Tax
// (automatic_tax) so Stripe calculates tax from the shipping address. That only works
// after Stripe Tax is activated in the Stripe Dashboard with the registrations the
// accountant confirms (Dashboard > Tax > Registrations). Stripe Tax has its own fees.
// No rate is hardcoded here on purpose.
export const COLLECT_SALES_TAX = false;
