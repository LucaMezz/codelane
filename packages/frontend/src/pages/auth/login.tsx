import { signInWithCredentials } from "@appkit/api-client";
import { LoginInput, loginSchema } from "@appkit/core";
import { LoginForm } from "@appkit/ui";
import { toast } from "@appkit/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";

import loginImageUrl from "../../assets/login-image.png";
import { useAuthSession } from "../../components/auth/auth-session-provider";
import { useFrontendRuntimeConfig } from "../../config";

export function Login(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const config = useFrontendRuntimeConfig();
  const { refreshSession } = useAuthSession();
  const callbackUrl = searchParams.get("callbackUrl");

  async function onSubmit(data: LoginInput) {
    let result;

    try {
      result = await signInWithCredentials(data.email, data.password, {
        apiBaseUrl: config.apiBaseUrl,
        redirectTo: callbackUrl ?? "/dashboard",
      });
    } catch {
      toast.error("Could not reach the server. Please try again.");
      return;
    }

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    try {
      await refreshSession();
    } catch {
      toast.error("Signed in, but could not refresh your session. Please reload the app.");
      return;
    }

    void navigate(result.redirectTo);
  }

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <div className="flex items-center justify-center h-full w-full">
      <LoginForm form={form} imageSrc={loginImageUrl} onSubmit={onSubmit} />
    </div>
  );
}
