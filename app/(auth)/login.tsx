import { useRouter } from "expo-router";

import { AuthForm } from "@/components/AuthForm";
import { useSession } from "@/providers/SessionProvider";

export default function Login() {
  const { signIn } = useSession();
  const router = useRouter();
  return (
    <AuthForm
      title="Iniciar sesion"
      submitLabel="Entrar"
      onSubmit={signIn}
      otherLabel="Crear cuenta"
      onOther={() => router.push("/registro")}
    />
  );
}
