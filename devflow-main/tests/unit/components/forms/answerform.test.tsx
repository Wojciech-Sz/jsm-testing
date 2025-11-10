import AnswerForm from "@/components/forms/AnswerForm";
import { createAnswer } from "@/lib/actions/answer.action";
import { api } from "@/lib/api";
import { MockEditor, mockSession, mockToast, mockUseSession, resetMocks } from "@/tests/mocks";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const user = userEvent.setup();

jest.mock("@/components/editor", () => MockEditor);
jest.mock("@/lib/actions/answer.action", () => ({
  createAnswer: jest.fn(),
}));
jest.mock("@/lib/api", () => ({
  api: {
    ai: {
      getAnswer: jest.fn(),
    },
  },
}));

const mockCreateAnswer = createAnswer as jest.MockedFunction<typeof createAnswer>;
const mockApiAiAnswer = api.ai.getAnswer as jest.MockedFunction<typeof api.ai.getAnswer>;

beforeEach(() => {
  resetMocks();
});

describe("AnswerForm", () => {
  describe("AI Generation", () => {
    it("should generate an AI answer for authenticated user", async () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: jest.fn(),
      });
      mockApiAiAnswer.mockResolvedValue({
        success: true,
        data: "AI Answer",
      });

      const mockQuestion = {
        questionId: "1",
        questionTitle: "Question Title",
        questionContent: "Question Content",
      };
      render(<AnswerForm {...mockQuestion} />);

      const button = screen.getByRole("button", { name: /Generate AI answer/i });
      await user.click(button);

      expect(mockApiAiAnswer).toHaveBeenCalledWith(mockQuestion.questionTitle, mockQuestion.questionContent, "");
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "AI Answer Generated",
          description: "The AI has successfully generated an answer.",
        })
      );
    });

    it("should not generate an AI answer for unauthenticated user", async () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
        update: jest.fn(),
      });

      const mockQuestion = {
        questionId: "1",
        questionTitle: "Question Title",
        questionContent: "Question Content",
      };
      render(<AnswerForm {...mockQuestion} />);

      const button = screen.getByRole("button", { name: /Generate AI answer/i });
      await user.click(button);

      expect(mockApiAiAnswer).not.toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Please log in",
          description: "You must log in to generate an AI answer.",
        })
      );
    });
  });

  describe("Submission", () => {
    it("should create an answer for authenticated user", async () => {
      mockCreateAnswer.mockResolvedValue({
        success: true,
      });

      render(<AnswerForm questionId="1" questionTitle="Question Title" questionContent="Question Content" />);

      await user.type(await screen.findByTestId("mdx-editor"), "Answer Content".repeat(10));

      const button = screen.getByRole("button", { name: /Post Answer/i });
      await user.click(button);

      expect(mockCreateAnswer).toHaveBeenCalledWith({
        content: "Answer Content".repeat(10),
        questionId: "1",
      });
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Success",
          description: "Your answer has been created successfully.",
        })
      );
    });

    it("should disable the submit button when the form is submitting", async () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: jest.fn(),
      });
      mockCreateAnswer.mockImplementationOnce(() => {
        return new Promise(() => {});
      });
      mockApiAiAnswer.mockImplementationOnce(() => {
        return new Promise(() => {});
      });

      render(<AnswerForm questionId="1" questionTitle="Question Title" questionContent="Question Content" />);

      await user.type(await screen.findByTestId("mdx-editor"), "Answer Content".repeat(10));

      const button = screen.getByRole("button", { name: /Post Answer/i });
      const aiButton = screen.getByRole("button", { name: /Generate AI answer/i });
      await user.click(button);
      await user.click(aiButton);

      await waitFor(() => {
        expect(button).toBeDisabled();
        expect(screen.getByText("Posting..."));
        expect(aiButton).toBeDisabled();
        expect(screen.getByText("Generating..."));
      });
    });

    it("should show error toast when submission fails", async () => {
      mockUseSession.mockReturnValue({
        data: mockSession,
        status: "authenticated",
        update: jest.fn(),
      });
      mockCreateAnswer.mockResolvedValue({
        success: false,
        status: 500,
        error: {
          message: "Error creating answer",
        },
      });

      render(<AnswerForm questionId="1" questionTitle="Question Title" questionContent="Question Content" />);

      await user.type(await screen.findByTestId("mdx-editor"), "Answer Content".repeat(10));

      const button = screen.getByRole("button", { name: /Post Answer/i });
      await user.click(button);

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: `Error (500)`,
          description: "Error creating answer",
          variant: "destructive",
        })
      );
    });
  });
});
