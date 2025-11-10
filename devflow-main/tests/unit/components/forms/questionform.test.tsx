import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { mockRouter, mockToast, resetMocks, MockEditor } from "@/tests/mocks";
import QuestionForm from "@/components/forms/QuestionForm";
import userEvent from "@testing-library/user-event";
import { createQuestion } from "@/lib/actions/question.action";

beforeEach(() => {
  resetMocks();
});

jest.mock("@/components/editor", () => MockEditor);
jest.mock("@/lib/actions/question.action", () => ({
  createQuestion: jest.fn(),
}));

const mockCreateQuestion = createQuestion as jest.MockedFunction<typeof createQuestion>;

const user = userEvent.setup();

describe("QuestionForm", () => {
  describe("Rendering", () => {
    it("should display all required fields", async () => {
      render(<QuestionForm />);
      const titleInput = screen.getByLabelText(/Question Title/i);
      const contentInput = await screen.findByLabelText(/Detailed explanation of your problem?/i);
      const tagsInput = screen.getByPlaceholderText(/Add tags/i);
      const button = screen.getByRole("button", { name: /Ask a Question/i });
      expect(titleInput).toBeInTheDocument();
      expect(contentInput).toBeInTheDocument();
      expect(tagsInput).toBeInTheDocument();
      expect(button).toBeInTheDocument();
    });
  });

  describe("Validation", () => {
    it("should validate required fields", async () => {
      render(<QuestionForm />);
      const button = screen.getByRole("button", { name: /Ask a Question/i });
      await user.click(button);

      expect(screen.getByText(/Title must be at least 5 characters./i)).toBeInTheDocument();
      expect(screen.getByText(/Minimum of 100 characters./i)).toBeInTheDocument();
      expect(screen.getByText(/Add at least one tag./i)).toBeInTheDocument();
    });
  });

  describe("Submission", () => {
    it("should submit the form", async () => {
      mockCreateQuestion.mockResolvedValue({
        success: true,
        data: {
          _id: "1",
          title: "Question Title",
          content: "Question Content",
          tags: [
            {
              _id: "1",
              name: "tag1",
            },
            {
              _id: "2",
              name: "tag2",
            },
          ],
          author: {
            _id: "1",
            name: "author",
            image: "author",
          },
          createdAt: new Date(),
          views: 0,
          answers: 0,
          upvotes: 0,
          downvotes: 0,
        },
      });
      render(<QuestionForm />);

      const titleInput = screen.getByLabelText(/Question Title/i);
      const contentInput = await screen.findByTestId("mdx-editor");
      const tagsInput = screen.getByPlaceholderText(/Add tags/i);
      const button = screen.getByRole("button", { name: /Ask a Question/i });

      await user.type(titleInput, "Question Title");
      await user.click(contentInput);
      await user.type(
        contentInput,
        "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Facere ullam expedita laudantium aut asperiores rem qui corrupti est dolor voluptate voluptatibus error id iste nemo dolore, quibusdam dignissimos nulla numquam? Officiis ipsam amet itaque consequuntur iusto."
      );
      fireEvent.change(tagsInput, { target: { value: "tag" } });
      fireEvent.keyDown(tagsInput, { key: "Enter" });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockCreateQuestion).toHaveBeenCalledWith({
          title: "Question Title",
          content:
            "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Facere ullam expedita laudantium aut asperiores rem qui corrupti est dolor voluptate voluptatibus error id iste nemo dolore, quibusdam dignissimos nulla numquam? Officiis ipsam amet itaque consequuntur iusto.",
          tags: ["tag"],
        });
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Success",
          description: "Your question has been posted successfully.",
        })
      );

      expect(mockRouter.push).toHaveBeenCalledWith("/questions/1");
    });

    it("should show error toast on failure", async () => {
      mockCreateQuestion.mockResolvedValue({
        success: false,
        status: 500,
        error: {
          message: "Failed to create the question",
        },
      });
      render(<QuestionForm />);

      const titleInput = screen.getByLabelText(/Question Title/i);
      const contentInput = await screen.findByTestId("mdx-editor");
      const tagsInput = screen.getByPlaceholderText(/Add tags/i);
      const button = screen.getByRole("button", { name: /Ask a Question/i });

      await user.type(titleInput, "Question Title");
      await user.click(contentInput);
      await user.type(
        contentInput,
        "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Facere ullam expedita laudantium aut asperiores rem qui corrupti est dolor voluptate voluptatibus error id iste nemo dolore, quibusdam dignissimos nulla numquam? Officiis ipsam amet itaque consequuntur iusto."
      );
      fireEvent.change(tagsInput, { target: { value: "tag" } });
      fireEvent.keyDown(tagsInput, { key: "Enter" });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockCreateQuestion).toHaveBeenCalledWith({
          title: "Question Title",
          content:
            "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Facere ullam expedita laudantium aut asperiores rem qui corrupti est dolor voluptate voluptatibus error id iste nemo dolore, quibusdam dignissimos nulla numquam? Officiis ipsam amet itaque consequuntur iusto.",
          tags: ["tag"],
        });
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error (500)",
          description: "Failed to create the question",
          variant: "destructive",
        })
      );

      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});
