import Link from "next/link";

export function Footer() {  // <-- Make sure you have "export" here
  const year = new Date().getFullYear();
  return (
    <footer className="border-t py-6">
      <div className="mx-auto max-w-7xl flex flex-col items-center gap-2 px-4 md:px-6">
        <p className="text-sm text-muted-foreground text-center">
          © {year} <Link href="/" className="font-semibold hover:underline">Evex</Link>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
