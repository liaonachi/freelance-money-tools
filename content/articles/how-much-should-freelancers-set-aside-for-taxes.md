---
title: "How Much Should Freelancers Set Aside for Taxes?"
slug: "how-much-should-freelancers-set-aside-for-taxes"
excerpt: "What self-employment tax actually is, how to estimate your monthly set-aside, and why this is a simplified estimate rather than a tax filing."
status: "published"
faq:
  - question: "What is self-employment tax?"
    answer: "It is the Social Security and Medicare tax, 15.3% total. Employees split this cost with their employer; as a freelancer, you are paying both halves yourself."
  - question: "How often do I need to pay estimated taxes?"
    answer: "The IRS generally expects quarterly estimated payments. This calculator estimates a monthly amount so you can set money aside consistently and pay it out when each quarterly deadline comes around."
  - question: "Does this account for tax brackets or deductions?"
    answer: "No — this is a simplified estimate. Federal and state rates are fields you fill in yourself based on your current marginal bracket, and it does not apply business deductions. For an actual filing, use tax software or a CPA."
---

## The problem: no one is withholding for you

When you're an employee, your paycheck already has federal income tax, state income tax, and your half of Social Security and Medicare withheld before you ever see the money. When you're a freelancer or sole proprietor, none of that happens automatically — every dollar of a client payment lands in your account untouched, and it's on you to set money aside and pay it to the IRS yourself, generally on a quarterly schedule.

The number one way freelancers get a nasty tax-season surprise is spending 100% of what they invoice, then discovering in April (or worse, at a quarterly deadline with a penalty attached) that a big chunk of it was never theirs to spend. The fix is simple in principle: set money aside every time you get paid. The hard part is knowing how much.

## What you're actually paying: self-employment tax

The biggest piece most people underestimate is self-employment (SE) tax — this is the freelancer's version of the Social Security and Medicare tax that's split between an employee and employer. As a freelancer, you're both, so you pay the full 15.3%.

The calculation isn't quite "15.3% of your income," though. The IRS has you calculate it on 92.35% of your net self-employment income (this accounts for the fact that an employee's share is calculated on their gross pay, while the "employer's share" effectively isn't taxed again) — this is the standard Schedule SE method, not a simplification:

```
seTaxable = monthlyIncome × 0.9235
seTax = seTaxable × 0.153
```

On top of that, you owe regular federal income tax and (in most states) state income tax, each calculated at your own marginal rate:

```
federal = monthlyIncome × federalRate
state = monthlyIncome × stateRate
total = seTax + federal + state
```

Our [tax set-aside calculator](/tools/tax-set-aside) runs this exact math and breaks the total into a simple table, so you can see how much of the total comes from each piece.

## A worked example

Say you bring in $6,000 in a month, your marginal federal bracket is 12%, your state rate is 5%, and you're including self-employment tax.

- SE taxable amount: $6,000 × 0.9235 = $5,541
- SE tax: $5,541 × 0.153 ≈ **$847.77**
- Federal: $6,000 × 12% = **$720**
- State: $6,000 × 5% = **$300**
- Total to set aside: $847.77 + $720 + $300 ≈ **$1,867.77**
- That's about **31% of the month's income**

For most US freelancers, a total set-aside somewhere in the 25–35% range is typical — high enough to include SE tax plus a moderate federal/state bracket, but not so high that it suggests double-counting or an unusually high bracket. If your number comes out well under 20%, it's worth checking whether you forgot to include self-employment tax; if it's well over 40%, double-check the rates you entered.

## Why this is a simplified estimate

A few things this calculator deliberately does not try to do, because getting them right depends on your specific situation and changes over time:

- **It doesn't apply a bracket table.** Federal and state income tax are genuinely progressive — you enter your marginal rate (the rate on your next dollar of income), not a flat calculation across brackets, because a simplified flat-rate table would be wrong for anyone not exactly at that income level.
- **It doesn't account for deductions.** Business expense deductions, the qualified business income (QBI) deduction, and other adjustments can meaningfully lower what you actually owe. This tool estimates against gross monthly income, before deductions.
- **It doesn't track the Social Security wage base.** There's an annual income cap above which the Social Security portion of SE tax stops applying (the Medicare portion continues, at a slightly different structure for high earners). That cap changes most years, so this calculator doesn't hard-code it — if your annual income is high enough that this might apply to you, check the current IRS figures or talk to a preparer.

None of this means the estimate isn't useful — it's meant to answer "roughly how much should I be setting aside this month," not to replace an actual tax filing.

## Paying quarterly

The IRS generally expects self-employed taxpayers to pay estimated taxes four times a year rather than once. Setting aside money monthly, using a calculation like this one, and then paying out of that reserve when each quarterly deadline comes around is the most common way freelancers stay ahead of it without a surprise bill.

## FAQ

**What is self-employment tax?**
It's the Social Security and Medicare tax, 15.3% total. Employees split this cost with their employer; as a freelancer, you're paying both halves yourself.

**How often do I need to pay estimated taxes?**
The IRS generally expects quarterly estimated payments. This calculator estimates a monthly amount so you can set money aside consistently and pay it out when each quarterly deadline comes around.

**Does this account for tax brackets or deductions?**
No — this is a simplified estimate. Federal and state rates are fields you fill in yourself based on your current marginal bracket, and it doesn't apply business deductions. For an actual filing, use tax software or a CPA.

---

Try the [Tax Set-Aside Calculator](/tools/tax-set-aside) with your own numbers, and if you're also working out what to charge clients in the first place, the [hourly rate calculator](/tools/hourly-rate) already builds a tax set-aside percentage into the math. This is a simplified estimate for US sole proprietors, not tax advice — check current IRS figures and confirm with a tax professional before making decisions based on it.
