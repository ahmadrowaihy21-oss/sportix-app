# SPORTIX MARKET pilot business rules

This isolated package records the rules tested in the separately hosted SPORTIX ATHLETE pilot at https://sportix-athlete-w5fgxx.v2.appdeploy.ai/ . It does not replace this repository's existing TanStack application, authentication, database or deployment configuration.

Run on Node 24: `node --test pilots/athlete-market/tests/domain.test.mjs`.

CI validates original-price = SPORTIX-funded coverage + athlete remainder, integer points and caps, stale-policy rejection, single refunds, payment-before-fulfilment, server consent and withdrawal rules, and internal event reconciliation. Prices and conversion are sandbox fixtures. No funds move.

The accompanying workflow runs these tests on this review branch and applicable PRs, without secrets or deployment permissions. It is not an AppDeploy deployment hook. A production adapter and real merchant settlement need separate implementation and tests. See docs/ENGINEERING.md.
