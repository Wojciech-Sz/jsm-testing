import {
  GitHubIcon,
  LinkedInIcon,
  TwitterIcon,
} from "@/components/input-fields/Icons";
import ProfilePreview from "@/components/ProfilePreview";
import { render } from "@testing-library/react";

describe("ProfilePreview", () => {
  const mockProfile = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    description: "Software Engineer",
    imageUrl: "/test/sample-image.webp",
  };
  const mockSocials = [
    {
      platform: "x",
      url: "x.com/username",
      Icon: TwitterIcon,
    },
    {
      platform: "github",
      url: "github.com/username",
      Icon: GitHubIcon,
    },
    {
      platform: "linkedin",
      url: "linkedin.com/username",
      Icon: LinkedInIcon,
    },
  ];

  it("should render correctly and match snapshot", () => {
    const { asFragment } = render(
      <ProfilePreview profile={mockProfile} socials={mockSocials} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
