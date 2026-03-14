import "@/app/globals.css";
import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { buildSidebarTree } from "@/lib/docs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "__SITE_NAME__",
  description: "__SITE_DESCRIPTION__",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tree = buildSidebarTree();

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white antialiased selection:bg-zinc-800 selection:text-white`}>
        <div className="flex min-h-screen pt-14 md:pt-0">
          <Sidebar tree={tree} />
          <main className="flex-1 w-full max-w-5xl mx-auto py-12 px-6 md:px-12 lg:px-24">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
