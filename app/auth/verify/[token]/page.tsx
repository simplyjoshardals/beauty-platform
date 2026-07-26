import { VerifyContent } from "@/components/auth/VerifyContent";

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ redirect?: string }>;
};

export default async function VerifyPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { redirect } = await searchParams;
  return <VerifyContent token={token} redirectTo={redirect} />;
}
