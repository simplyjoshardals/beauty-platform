import { VerifyContent } from "@/components/auth/VerifyContent";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function VerifyPage({ params }: Props) {
  const { token } = await params;
  return <VerifyContent token={token} />;
}
