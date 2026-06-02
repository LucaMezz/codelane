export type ApiClientOptions = {
  apiBaseUrl: string;
};

export type SignInResult =
  | { success: true; redirectTo: string }
  | {
      success: false;
      error: "invalid_credentials" | "unknown";
      message: string;
    };

export type SignOutResult =
  | {
      success: true;
      redirectTo: string;
    }
  | {
      success: false;
      error: "unknown";
      message: string;
    };

export type RegisterUserResult =
  | {
      success: true;
      user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
        emailVerified: Date | string | null;
      };
    }
  | {
      success: false;
      error: "email_taken" | "validation_error" | "unknown";
      message: string;
    };

export type AuthSession = {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
} | null;
