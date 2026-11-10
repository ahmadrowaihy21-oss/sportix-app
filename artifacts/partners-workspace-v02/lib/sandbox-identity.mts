export type SandboxIdentityProps = {
  SPORTIX_SANDBOX_OWNER?: string;
};

// The authenticated ingress must set this request-scoped runtime property.
export function sandboxOwner(
  props: SandboxIdentityProps | undefined,
  localPreview = false,
): string | null {
  const owner = props?.SPORTIX_SANDBOX_OWNER;
  if (typeof owner === "string" && owner.trim() && owner === owner.trim()) {
    return owner;
  }
  return localPreview ? "local-preview-owner" : null;
}
