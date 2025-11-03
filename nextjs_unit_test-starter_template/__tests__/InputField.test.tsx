import { InputField } from "@/components/input-fields/InputField";
import { render, screen, fireEvent } from "@testing-library/react";

describe("InputField", () => {
  const label = "First Name";
  const name = "firstName";
  const placeholder = "John";
  it("renders correctly with label and placeholder", () => {
    render(
      <InputField
        label={label}
        name={name}
        placeholder={placeholder}
        value=""
        onChange={() => {}}
        required
      />
    );
    const input = screen.getByPlaceholderText(placeholder);
    expect(input).toBeInTheDocument();
    const labelElement = screen.getByText(label);
    expect(labelElement).toBeInTheDocument();
  });

  it("calls onChange when typing", () => {
    const onChange = jest.fn();
    render(
      <InputField
        label={label}
        name={name}
        placeholder={placeholder}
        value=""
        onChange={onChange}
        required
      />
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Jane" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("shows error message when required value is empty", () => {
    render(
      <InputField
        label={label}
        name={name}
        placeholder={placeholder}
        value=""
        onChange={() => {}}
        required
      />
    );
    const input = screen.getByRole("textbox");
    fireEvent.blur(input);

    const errorMessage = screen.getByText(`${label} is required.`);
    expect(errorMessage).toBeInTheDocument();
  });

  it("not renders error message when required value is not empty", () => {
    render(
      <InputField
        label={label}
        name={name}
        placeholder={placeholder}
        value="John"
        onChange={() => {}}
        required
      />
    );
    const input = screen.getByRole("textbox");
    fireEvent.blur(input);

    const errorMessage = screen.queryByText(`${label} is required.`);
    expect(errorMessage).not.toBeInTheDocument();
  });
});
