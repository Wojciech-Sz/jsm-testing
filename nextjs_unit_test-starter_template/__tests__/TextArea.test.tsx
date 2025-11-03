import { TextArea } from "@/components/input-fields/TextArea";
import { render, screen } from "@testing-library/react";
import { useState } from "react";
import { userEvent } from "@testing-library/user-event";

const TestWrapper = ({
  initialValue,
  maxWords,
}: {
  initialValue: string;
  maxWords?: number;
}) => {
  const [value, setValue] = useState(initialValue);
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };
  return (
    <TextArea
      label="Description"
      name="description"
      value={value}
      onChange={handleChange}
      maxWords={maxWords}
    />
  );
};

describe("TextArea", () => {
  it("updates value and does not show error when maxWords is not exceeded", async () => {
    const user = userEvent.setup();
    const maxWords = 5;
    render(<TestWrapper initialValue="" maxWords={maxWords} />);
    const textarea = screen.getByRole("textbox");
    const text = "test test test test test";
    await user.type(textarea, text);
    expect(textarea).toHaveValue(text);
    expect(
      screen.queryByText(`Maximum ${maxWords} words allowed`)
    ).not.toBeInTheDocument();
  });

  it("clears error message when maxWords is exceeded and then the value is reset", async () => {
    const user = userEvent.setup();
    const maxWords = 5;
    render(<TestWrapper initialValue="" maxWords={maxWords} />);
    const textarea = screen.getByRole("textbox");
    const text = "test test test test test test";
    await user.type(textarea, text);
    expect(textarea).toHaveValue(text);
    expect(screen.findByText(`Maximum ${maxWords} words allowed`));
    await user.clear(textarea);
    expect(textarea).toHaveValue("");
    expect(
      screen.queryByText(`Maximum ${maxWords} words allowed`)
    ).not.toBeInTheDocument();
  });
});
