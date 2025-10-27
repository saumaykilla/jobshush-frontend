import { getUserDetails } from "@/lib/amplifyServerUtils";
import { redirect } from "next/navigation";

export default async function OnBoardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUserDetails();
  if (user) {
    if (user["custom:isOnboarded"] == "true") {
      redirect("/dashboard");
    } else return <>{children}</>;
  }
}