import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { StatusCard } from "../components/common/StatusCard";
import { useAuth } from "../hooks/useAuth";
import { getFirebaseConfigError, isFirebaseConfigured } from "../services/firebase/config";

const loginValues = {
  email: "",
  password: "",
};

const signUpValues = {
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function validateLoginForm(values) {
  if (!values.email.trim()) {
    return "Please enter your email.";
  }

  if (!values.password) {
    return "Please enter your password.";
  }

  return null;
}

function validateSignUpForm(values) {
  if (!values.displayName.trim()) {
    return "Please enter your display name.";
  }

  if (!values.email.trim()) {
    return "Please enter your email.";
  }

  if (values.password.length < 6) {
    return "Password should be at least 6 characters long.";
  }

  if (values.password !== values.confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
}

export function AuthPage() {
  const { user, loading, authError, logIn, signUp } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginForm, setLoginForm] = useState(loginValues);
  const [signUpForm, setSignUpForm] = useState(signUpValues);

  const redirectTo = location.state?.from?.pathname || "/dashboard";
  const firebaseConfigError = isFirebaseConfigured() ? null : getFirebaseConfigError();

  if (!loading && user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (loading) {
    return (
      <section className="page-section centered-card">
        <div className="auth-card">
          <StatusCard title="Loading" message="Checking your account details..." />
        </div>
      </section>
    );
  }

  function handleModeChange(nextMode) {
    setMode(nextMode);
    setFormError(null);
  }

  function handleLoginChange(event) {
    const { name, value } = event.target;
    setLoginForm((currentValues) => ({ ...currentValues, [name]: value }));
  }

  function handleSignUpChange(event) {
    const { name, value } = event.target;
    setSignUpForm((currentValues) => ({ ...currentValues, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);

    const validationError =
      mode === "login" ? validateLoginForm(loginForm) : validateSignUpForm(signUpForm);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await logIn({
          email: loginForm.email.trim(),
          password: loginForm.password,
        });
      } else {
        await signUp({
          displayName: signUpForm.displayName.trim(),
          email: signUpForm.email.trim(),
          password: signUpForm.password,
        });
      }
    } catch {
      // The provider already stores the readable auth error.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-section centered-card">
      <div className="card auth-card">
        <p className="eyebrow">Account</p>
        <h2>{mode === "login" ? "Log in" : "Create account"}</h2>
        <p>
          {mode === "login"
            ? "Log in to open your dashboard."
            : "Create an account to start tracking habits."}
        </p>

        <div className="auth-toggle">
          <button
            type="button"
            className={mode === "login" ? "toggle-button active-toggle" : "toggle-button"}
            onClick={() => handleModeChange("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "signup" ? "toggle-button active-toggle" : "toggle-button"}
            onClick={() => handleModeChange("signup")}
          >
            Sign up
          </button>
        </div>

        <form className="form-stack auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label className="field">
              <span>Display name</span>
              <input
                type="text"
                name="displayName"
                value={signUpForm.displayName}
                onChange={handleSignUpChange}
                placeholder="Your name"
              />
            </label>
          )}

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={mode === "login" ? loginForm.email : signUpForm.email}
              onChange={mode === "login" ? handleLoginChange : handleSignUpChange}
              placeholder="name@example.com"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={mode === "login" ? loginForm.password : signUpForm.password}
              onChange={mode === "login" ? handleLoginChange : handleSignUpChange}
              placeholder="Enter password"
            />
          </label>

          {mode === "signup" && (
            <label className="field">
              <span>Confirm password</span>
              <input
                type="password"
                name="confirmPassword"
                value={signUpForm.confirmPassword}
                onChange={handleSignUpChange}
                placeholder="Re-enter password"
              />
            </label>
          )}

          {(firebaseConfigError || formError || authError) && (
            <p className="form-error status-banner">{firebaseConfigError || formError || authError}</p>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait..."
              : mode === "login"
                ? "Log in"
                : "Create account"}
          </button>
        </form>
      </div>
    </section>
  );
}
