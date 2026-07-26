import { AuthForm } from "@/components/auth/AuthForm";

type Props = {
  searchParams: Promise<{ redirect?: string }>;
};

export default async function AuthPage({ searchParams }: Props) {
  const { redirect } = await searchParams;
  return <AuthForm redirectTo={redirect} />;
}
