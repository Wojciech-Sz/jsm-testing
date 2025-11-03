import { render, screen } from "@testing-library/react";
import { useState } from "react";
import { userEvent } from "@testing-library/user-event";
import { SocialFields } from "@/components/input-fields/SocialFields";
import { SocialLink } from "@/types/global";
import {
  GitHubIcon,
  LinkedInIcon,
  TwitterIcon,
} from "@/components/input-fields/Icons";

const TestWrapper = ({ initialSocials }: { initialSocials: SocialLink[] }) => {
  const [value, setValue] = useState(initialSocials);

  const handleChange = (index: number, value: string) => {
    setValue((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], url: value };
      return updated;
    });
  };
  return <SocialFields socials={value} onChange={handleChange} />;
};

describe("SocialFields", () => {
  const user = userEvent.setup();
  const initialSocials = [
    {
      platform: "x",
      url: "",
      Icon: TwitterIcon,
    },
    {
      platform: "github",
      url: "",
      Icon: GitHubIcon,
    },
    {
      platform: "linkedin",
      url: "",
      Icon: LinkedInIcon,
    },
  ];

  it("show error message for invalid url", async () => {
    render(<TestWrapper initialSocials={initialSocials} />);

    const linkedinInput = screen.getByPlaceholderText(
      /linkedin\.com\/username/i
    );
    await user.type(linkedinInput, "invalid-url");

    expect(linkedinInput).toHaveValue("invalid-url");
    expect(
      screen.getByText(
        "Please enter a valid linkedin URL (must contain linkedin.com)"
      )
    ).toBeInTheDocument();
  });

  it("clear error message when valid url is entered", async () => {
    render(<TestWrapper initialSocials={initialSocials} />);

    const linkedinInput = screen.getByPlaceholderText(
      /linkedin\.com\/username/i
    );
    await user.type(linkedinInput, "linkedin.com/username");

    expect(linkedinInput).toHaveValue("linkedin.com/username");
    expect(
      screen.queryByText(
        "Please enter a valid linkedin URL (must contain linkedin.com)"
      )
    ).not.toBeInTheDocument();

    await user.clear(linkedinInput);
    expect(linkedinInput).toHaveValue("");
    expect(
      screen.queryByText(
        "Please enter a valid linkedin URL (must contain linkedin.com)"
      )
    ).not.toBeInTheDocument();
  });
  it("not show error message when url is empty", async () => {
    render(<TestWrapper initialSocials={initialSocials} />);

    const linkedinInput = screen.getByPlaceholderText(
      /linkedin\.com\/username/i
    );
    await user.type(linkedinInput, "sasa");

    expect(linkedinInput).toHaveValue("sasa");
    await user.clear(linkedinInput);
    expect(linkedinInput).toHaveValue("");
    expect(
      screen.queryByText(
        "Please enter a valid linkedin URL (must contain linkedin.com)"
      )
    ).not.toBeInTheDocument();
  });
});
