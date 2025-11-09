import AuthForm from "@/components/forms/AuthForm";
import ROUTES from "@/constants/routes";
import { SignInSchema, SignUpSchema } from "@/lib/validations";
import { mockRouter, mockToast, resetMocks } from "@/tests/mocks";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const user = userEvent.setup();

beforeEach(() => {
  resetMocks();
});

describe("AuthForm", () => {
  describe("Sign In Form", () => {
    describe("Rendering", () => {
      it("should display all required fields", () => {
        const onSubmit = jest.fn();
        render(
          <AuthForm
            formType="SIGN_IN"
            schema={SignInSchema}
            defaultValues={{ email: "", password: "" }}
            onSubmit={onSubmit}
          />
        );
        const emailInput = screen.getByLabelText("Email Address");
        const passwordInput = screen.getByLabelText("Password");
        const button = screen.getByRole("button", { name: "Sign In" });
        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(button).toBeInTheDocument();
        expect(screen.getByText("Don’t have an account?")).toBeInTheDocument();
      });
    });
    describe("Validation", () => {
      it("should show error message for invalid email", async () => {
        const onSubmit = jest.fn();
        render(
          <AuthForm
            formType="SIGN_IN"
            schema={SignInSchema}
            defaultValues={{ email: "", password: "" }}
            onSubmit={onSubmit}
          />
        );
        const emailInput = screen.getByLabelText("Email Address");
        const passwordInput = screen.getByLabelText("Password");
        const button = screen.getByRole("button", { name: "Sign In" });
        await user.type(emailInput, "tesxamplcom");
        await user.type(passwordInput, "pasaaaaaa");
        await user.click(button);
        expect(screen.getByText("Please provide a valid email address.")).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
      });
      it("should show error message for invalid password", async () => {
        const onSubmit = jest.fn();
        render(
          <AuthForm
            formType="SIGN_IN"
            schema={SignInSchema}
            defaultValues={{ email: "", password: "" }}
            onSubmit={onSubmit}
          />
        );
        const emailInput = screen.getByLabelText("Email Address");
        const passwordInput = screen.getByLabelText("Password");
        const button = screen.getByRole("button", { name: "Sign In" });
        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "saa");
        await user.click(button);
        expect(screen.getByText("Password must be at least 6 characters long.")).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });
    describe("Submission", () => {
      it("should submit the form with valid inputs", async () => {
        const onSubmit = jest
          .fn()
          .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100)));
        render(
          <AuthForm
            formType="SIGN_IN"
            schema={SignInSchema}
            defaultValues={{ email: "", password: "" }}
            onSubmit={onSubmit}
          />
        );
        const emailInput = screen.getByLabelText("Email Address");
        const passwordInput = screen.getByLabelText("Password");
        const button = screen.getByRole("button", { name: "Sign In" });
        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "Qwerty1_!");
        await user.click(button);

        expect(screen.getByText("Signing In...")).toBeInTheDocument();

        expect(onSubmit).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "Qwerty1_!",
        });
      });
    });
    describe("Success handling", () => {
      it("should navigate to the home page and show success toast on successful sign in", async () => {
        const onSubmit = jest.fn().mockResolvedValue({ success: true });
        render(
          <AuthForm
            formType="SIGN_IN"
            schema={SignInSchema}
            defaultValues={{ email: "", password: "" }}
            onSubmit={onSubmit}
          />
        );
        const emailInput = screen.getByLabelText("Email Address");
        const passwordInput = screen.getByLabelText("Password");
        const button = screen.getByRole("button", { name: "Sign In" });
        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "Qwerty1_!");
        await user.click(button);

        expect(mockRouter.replace).toHaveBeenCalledWith(ROUTES.HOME);

        expect(mockToast).toHaveBeenCalledWith({
          title: "Success",
          description: "You have successfully signed in.",
        });
      });
    });
    describe("Error handling", () => {
      it("should show error toast on failed sign in", async () => {
        jest.clearAllMocks();
        const onSubmit = jest
          .fn()
          .mockResolvedValue({ success: false, status: 401, error: { message: "Invalid credentials" } });
        render(
          <AuthForm
            formType="SIGN_IN"
            schema={SignInSchema}
            defaultValues={{ email: "", password: "" }}
            onSubmit={onSubmit}
          />
        );

        const emailInput = screen.getByLabelText("Email Address");
        const passwordInput = screen.getByLabelText("Password");
        const button = screen.getByRole("button", { name: "Sign In" });
        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "Qwerty1_!");
        await user.click(button);

        expect(mockToast).toHaveBeenCalledWith({
          title: "Error (401)",
          description: "Invalid credentials",
          variant: "destructive",
        });
        expect(mockRouter.replace).not.toHaveBeenCalled();
      });
    });
  });

  describe("Sign Up Form", () => {
    describe("Rendering", () => {
      it("should display all required fields", () => {
        const onSubmit = jest.fn();
        render(
          <AuthForm
            formType="SIGN_UP"
            schema={SignUpSchema}
            defaultValues={{ email: "", password: "", name: "", username: "" }}
            onSubmit={onSubmit}
          />
        );
        const emailInput = screen.getByLabelText("Email Address");
        const passwordInput = screen.getByLabelText("Password");
        const nameInput = screen.getByLabelText("Name");
        const usernameInput = screen.getByLabelText("Username");
        const button = screen.getByRole("button", { name: "Sign Up" });
        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(nameInput).toBeInTheDocument();
        expect(usernameInput).toBeInTheDocument();
        expect(button).toBeInTheDocument();
        expect(screen.getByText("Already have an account?")).toBeInTheDocument();
      });
    });
    describe("Validation", () => {
      it("should show error message for invalid inputs", async () => {
        const onSubmit = jest.fn();
        render(
          <AuthForm
            formType="SIGN_UP"
            schema={SignUpSchema}
            defaultValues={{ email: "", password: "", name: "", username: "" }}
            onSubmit={onSubmit}
          />
        );
        const emailInput = screen.getByLabelText("Email Address");
        const passwordInput = screen.getByLabelText("Password");
        const nameInput = screen.getByLabelText("Name");
        const usernameInput = screen.getByLabelText("Username");
        const button = screen.getByRole("button", { name: "Sign Up" });

        await user.type(emailInput, "1");
        await user.type(passwordInput, "2a");
        await user.type(nameInput, "__");
        await user.type(usernameInput, "@w-");
        await user.click(button);

        expect(screen.getByText("Please provide a valid email address.")).toBeInTheDocument();
        expect(screen.getByText("Password must be at least 6 characters long.")).toBeInTheDocument();
        expect(screen.getByText("Username can only contain letters, numbers, and underscores.")).toBeInTheDocument();
        expect(screen.getByText("Name can only contain letters and spaces.")).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();

        await user.clear(emailInput);
        await user.clear(passwordInput);
        await user.clear(nameInput);
        await user.clear(usernameInput);

        expect(screen.getByText("Password must be at least 6 characters long.")).toBeInTheDocument();
        expect(screen.getByText("Please provide a valid email address.")).toBeInTheDocument();
        expect(screen.getByText("Username must be at least 3 characters long.")).toBeInTheDocument();
        expect(screen.getByText("Name is required.")).toBeInTheDocument();
      });

      it("should show error message for weak password", async () => {
        const onSubmit = jest.fn();
        render(
          <AuthForm
            formType="SIGN_UP"
            schema={SignUpSchema}
            defaultValues={{ email: "", password: "", name: "", username: "" }}
            onSubmit={onSubmit}
          />
        );
        const emailInput = screen.getByLabelText("Email Address");
        const passwordInput = screen.getByLabelText("Password");
        const nameInput = screen.getByLabelText("Name");
        const usernameInput = screen.getByLabelText("Username");
        const button = screen.getByRole("button", { name: "Sign Up" });
        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "qwerty");
        await user.type(nameInput, "name");
        await user.type(usernameInput, "username");
        await user.click(button);
        expect(screen.getByText("Password must contain at least one uppercase letter.")).toBeInTheDocument();
        await user.clear(passwordInput);
        await user.type(passwordInput, "QWERTY");
        expect(screen.getByText("Password must contain at least one lowercase letter.")).toBeInTheDocument();
        await user.clear(passwordInput);
        await user.type(passwordInput, "Qwerty");
        expect(screen.getByText("Password must contain at least one number.")).toBeInTheDocument();
        await user.clear(passwordInput);
        await user.type(passwordInput, "Qwerty1");
        expect(screen.getByText("Password must contain at least one special character.")).toBeInTheDocument();
      });
    });
    describe("Submission", () => {
      it("should submit the form with valid inputs", async () => {
        const onSubmit = jest
          .fn()
          .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000)));
        render(
          <AuthForm
            formType="SIGN_UP"
            schema={SignUpSchema}
            defaultValues={{ email: "", password: "", name: "", username: "" }}
            onSubmit={onSubmit}
          />
        );
        const emailInput = screen.getByLabelText("Email Address");
        const passwordInput = screen.getByLabelText("Password");
        const nameInput = screen.getByLabelText("Name");
        const usernameInput = screen.getByLabelText("Username");
        const button = screen.getByRole("button", { name: "Sign Up" });
        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "Qwerty1_!");
        await user.type(nameInput, "name");
        await user.type(usernameInput, "username");
        await user.click(button);
        expect(screen.getByText("Signing Up..."));
        expect(onSubmit).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "Qwerty1_!",
          name: "name",
          username: "username",
        });
      });
    });
  });
});
