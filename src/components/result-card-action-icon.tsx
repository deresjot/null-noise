import { Bookmark, Eye, FileText } from "lucide-react";

type ResultCardActionIconProps = {
  name: "details" | "remember" | "seen";
};

export function ResultCardActionIcon({ name }: ResultCardActionIconProps) {
  const iconProps = {
    "aria-hidden": true,
    className: "result-card-action-icon",
    focusable: false,
    size: 20,
    strokeWidth: 2.25,
  } as const;

  if (name === "remember") {
    return <Bookmark {...iconProps} />;
  }

  if (name === "seen") {
    return <Eye {...iconProps} />;
  }

  return <FileText {...iconProps} />;
}
