import { useRouter } from "expo-router";

import { AuthForm } from "@/components/AuthForm";
import { useSession } from "@/providers/SessionProvider";

export default function Registro() {
  const { signUp } = useSession();
  const router = useRouter();
  return (
    <AuthForm
      title="Crear cuenta"
      submitLabel="Crear cuenta"
      onSubmit={signUp}
      otherLabel="Ya tengo cuenta"
      onOther={() => router.back()}
    />
  );
}
