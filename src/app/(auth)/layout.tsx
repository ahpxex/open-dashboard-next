import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { TextLink } from "@/components/ui/text-link";
import { decodeSession, SESSION_COOKIE } from "@/lib/auth/session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = decodeSession(cookieStore.get(SESSION_COOKIE)?.value);

  if (session) {
    redirect("/");
  }

  return (
    <div className="grid grid-cols-[60%_40%] h-screen">
      <div className="relative">
        <Image
          draggable={false}
          src="/bg.jpg"
          fill
          alt="Background"
          className="object-cover"
        />
        <div className="absolute bottom-2 left-2 text-xs text-white bg-opacity-50 px-2 py-1 rounded-none">
          Image by{" "}
          <TextLink
            href="https://pixabay.com/users/nils-art-7103936/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=9765223"
            className="text-gray-50"
          >
            Nils
          </TextLink>{" "}
          from{" "}
          <TextLink
            href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=9765223"
            className="text-gray-50"
          >
            Pixabay
          </TextLink>
        </div>
      </div>
      <div className="flex flex-col space-y-6 items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
}
