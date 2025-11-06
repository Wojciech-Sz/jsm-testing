import { Button } from "@/components/ui/button";
import { fireEvent, render, screen } from "@testing-library/react";

describe("Button - TDD approach", () => {
  it("should render a button with text", () => {
    render(<Button>Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Button");
  });

  it("should call the onClick function when clicked", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Button</Button>);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should render a button with the correct variant", () => {
    render(<Button variant="destructive">Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-red-500");
  });

  it("should render a button with disabled state", () => {
    render(<Button disabled>Button</Button>);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });
});
