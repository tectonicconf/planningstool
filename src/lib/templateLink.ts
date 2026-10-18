// Shared by every admin board's "Template" badge — links straight to the
// specific shift block it's attached to on the Templates tab (which gives
// each block its own matching `id`, see TemplatesBoard.tsx), not just the
// template group as a whole, so the admin lands on the exact block they
// clicked from rather than having to re-find it inside the group.
export function templateHref(shiftId: string): string {
  return `/admin/templates#${shiftAnchorId(shiftId)}`;
}

export function shiftAnchorId(shiftId: string): string {
  return `shift-${encodeURIComponent(shiftId)}`;
}
