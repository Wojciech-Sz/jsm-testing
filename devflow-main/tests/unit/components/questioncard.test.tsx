import { getTimeStamp } from "@/lib/utils";
import { MockEditDeleteAction, MockImage, MockLink, MockMetric } from "@/tests/mocks";
import QuestionCard from "@/components/cards/QuestionCard";
import ROUTES from "@/constants/routes";
import { render, screen } from "@testing-library/react";

jest.mock("next/link", () => MockLink);
jest.mock("next/image", () => MockImage);
jest.mock("@/components/user/EditDeleteAction", () => MockEditDeleteAction);
jest.mock("@/components/Metric", () => ({
  Metric: MockMetric,
}));

const mockQuestion: Question = {
  _id: "1",
  title: "Question Title",
  content: "Question Content",
  tags: [{ _id: "1", name: "Tag 1" }],
  author: { _id: "1", name: "Author", image: "https://github.com/shadcn.png" },
  createdAt: new Date(),
  upvotes: 10,
  downvotes: 0,
  answers: 5,
  views: 100,
};

const mockTimeStamp = getTimeStamp(mockQuestion.createdAt);

describe("QuestionCard", () => {
  describe("Rendering", () => {
    it("should render the QuestionCard with all elements", () => {
      render(<QuestionCard question={mockQuestion} />);

      expect(screen.getByText(mockQuestion.title)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: mockQuestion.title })).toHaveAttribute(
        "href",
        ROUTES.QUESTION(mockQuestion._id)
      );

      expect(screen.getByText(mockQuestion.tags[0].name)).toBeInTheDocument();

      expect(screen.getByRole("img", { name: `${mockQuestion.author.name}'s avatar` })).toBeInTheDocument();
      expect(screen.getByText(mockQuestion.author.name)).toBeInTheDocument();

      expect(screen.getByText(mockTimeStamp)).toBeInTheDocument();

      expect(screen.getByText(`${mockQuestion.upvotes} Votes`)).toBeInTheDocument();
      expect(screen.getByText(`${mockQuestion.answers} Answers`)).toBeInTheDocument();
      expect(screen.getByText(`${mockQuestion.views} Views`)).toBeInTheDocument();
    });

    it("should render edit/delete action buttons when showActionBtns is true", () => {
      render(<QuestionCard question={mockQuestion} showActionBtns={true} />);

      expect(screen.getByText(/Edit Question/i)).toBeInTheDocument();
      expect(screen.getByText(/Delete Question/i)).toBeInTheDocument();
    });

    it("should not render edit/delete action buttons when showActionBtns is false", () => {
      render(<QuestionCard question={mockQuestion} showActionBtns={false} />);
      expect(screen.queryByText(/Edit Question/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Delete Question/i)).not.toBeInTheDocument();
    });
  });

  describe("Responsiveness", () => {
    it("should hide timestamp on mobile", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 500,
      });
      window.dispatchEvent(new Event("resize"));

      render(<QuestionCard question={mockQuestion} />);
      expect(screen.getByText(mockTimeStamp, { selector: "span" })).toHaveClass("sm:hidden");
    });

    it("should show timestamp on desktop", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 800,
      });
      window.dispatchEvent(new Event("resize"));
      render(<QuestionCard question={mockQuestion} />);
      expect(screen.getByText(/• asked/i, { selector: "div" })).toBeVisible();
      const metric = screen.getAllByTestId("metric")[0];
      expect(metric).toBeVisible();
    });
  });
});
