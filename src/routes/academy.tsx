import { createFileRoute } from "@tanstack/react-router";
import { AcademyWorkspace } from "@/components/academy/AcademyWorkspace";

export const Route = createFileRoute("/academy")({
  head: () => ({ meta: [{ title: "SPORTIX — مساحة الأكاديمية التجريبية" }] }),
  component: AcademyWorkspace,
});
