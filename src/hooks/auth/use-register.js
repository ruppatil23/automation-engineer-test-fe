import { useState } from "react";
import { authApi } from "../../apis/auth/auth.api.js";
import { ValidationError } from "../../utils/errors/index.js";
import { useNavigate } from "@tanstack/react-router";
import { useUserStore } from "../../stores/user.store.js";

/**
 * Hook to register user
 */
const useRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsRegistering(true);
    resetMessages();

    try {
      const response = await authApi.registerUser({
        data: {
          name: name,
          email: email,
          password: password,
        },
      });
      

      if (response && response.token && response.user) {
        setSuccessMessage(
          "Registration successful! You can now log in. Redirecting...",
        );

        resetInputs();

        setUser({
          ...response.user,
          authToken: response.token,
        });

        setTimeout(() => {
          navigate({ to: "/login" });
        }, 2000);
      } else {
        setErrorMessage("Registration failed. Please try again.");
      }
    } catch (error) {
      if (error instanceof ValidationError && error.issues.length > 0) {
        console.error("Registration error:", error.toJSON());
        if (Array.isArray(error.issues) && error.issues.length > 0) {
          setErrorMessage(error.issues[0].error);
        } else {
          setErrorMessage(error.message);
        }
      } else {
        const errorMsg =
          (error instanceof Error ? error.message : String(error)) ||
          "An unexpected error occurred. Please try again.";
        setErrorMessage(errorMsg);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const resetMessages = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  const resetInputs = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    errorMessage,
    successMessage,
    isRegistering,
    handleRegister,
    resetMessages,
  };
};

export default useRegister;
