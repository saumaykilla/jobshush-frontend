import Navbar from "@/components/Navbar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getUserDetails } from "@/lib/amplifyServerUtils";
import { Menu } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AuthenticationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserDetails();
  if (user) {
    if (user["custom:isOnboarded"] == "false") {
      redirect("/onboarding");
    } else {
      return (
        <>
          <SidebarProvider>
            <div className="flex h-screen w-full">
              <Navbar user={user} />

              <div className="flex-1 flex flex-col overflow-hidden">
                <header className="border-b border-border/50 p-4 lg:hidden">
                  <SidebarTrigger className="p-2">
                    <Menu className="w-4 h-4" />
                  </SidebarTrigger>
                </header>

                <main className="flex-1 overflow-auto p-6">{children}</main>
              </div>
            </div>
          </SidebarProvider>
        </>
      );
    }
  } 
}