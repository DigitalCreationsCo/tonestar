import { AllLocales } from "@/lib/App";
import { useMessages } from "next-intl";
import { notFound } from "next/navigation";
import AuthLayout from "@/components/layouts/AuthLayout";

export default function Layout( props: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {

    if (!AllLocales.includes(props.params.locale)) notFound();
    const messages = useMessages();
    
  return (
    <AuthLayout heading="Welcome back" description="Log in to your account">
      {props.children}
    </AuthLayout>
  );
}
