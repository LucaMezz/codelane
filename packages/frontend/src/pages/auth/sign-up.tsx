import { registerUser } from "@appkit/api-client";
import { RegisterInput, registerSchema } from "@appkit/core";
import { SignUpForm } from "@appkit/ui";
import { toast } from "@appkit/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import signUpImageUrl from "../../assets/sign-up-image.png";
import { useFrontendRuntimeConfig } from "../../config";

export function SignUp(): React.JSX.Element {
  const config = useFrontendRuntimeConfig();

  async function onSubmit(data: RegisterInput) {
    let result;

    try {
      result = await registerUser(data, {
        apiBaseUrl: config.apiBaseUrl,
      });
    } catch {
      toast.error("Could not reach the server. Please try again.");
      return;
    }

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Account created.");
  }

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <div className="flex items-center justify-center h-full w-full">
      <SignUpForm form={form} imageSrc={signUpImageUrl} onSubmit={onSubmit} />
    </div>
  );
}
