// Renders a plain string where **double asterisks** mark bold text and
// [label](https://link) marks a link (opens in a new tab).
// Used by the content pages (onboarding, FAQ) so copy can be edited in the
// data files without touching any markup.
export function RichText({ children }: { children: string }) {
  const parts = children.split(/(\*\*.+?\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g);

  return (
    <>
      {parts.map((part, index) => {
        const bold = part.match(/^\*\*(.+)\*\*$/);
        if (bold) {
          return (
            <strong key={index} className="font-semibold text-white">
              {bold[1]}
            </strong>
          );
        }
        const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
        if (link) {
          return (
            <a
              key={index}
              href={link[2]}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-cyan-300 underline-offset-2 hover:text-cyan-200 hover:underline"
            >
              {link[1]}
            </a>
          );
        }
        return part;
      })}
    </>
  );
}
