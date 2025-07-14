import { PROJECT } from "@/constants/project";

export default function AuthFooter() {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between p-6">
      <div className="text-paragraph-sm text-text-sub-600">
        © {new Date().getFullYear()} {PROJECT.COMPANY}
      </div>
    </div>
  );
}
