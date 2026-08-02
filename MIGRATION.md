# Migration status (monorepo → CANShift org)

Split from `tburkhalterr/CANShift` with history. Remaining cutover steps:

1. Publish `@canshift/core@1.0.0`, then `npm install` here to regenerate the lockfile — CI is red until then.
2. Verify the `canshift-core-shim` mock and metro config resolve the published package.
3. Transfer `scope:mobile` issues; flip public. The iOS native workflow (Xcode build) is ported separately.
