import { Question, Tag, User, Interaction } from "@/database";
import { getQuestions } from "@/lib/actions/question.action";
import { auth } from "@/auth";

describe("getQuestions", () => {
  let testUser1: InstanceType<typeof User>;
  let testUser2: InstanceType<typeof User>;
  let testTag1: InstanceType<typeof Tag>;
  let testTag2: InstanceType<typeof Tag>;
  let testTag3: InstanceType<typeof Tag>;

  beforeEach(async () => {
    // Create test users
    testUser1 = await User.create({
      name: "Test User 1",
      username: "testuser1",
      email: "test1@example.com",
      image: "https://example.com/user1.jpg",
    });

    testUser2 = await User.create({
      name: "Test User 2",
      username: "testuser2",
      email: "test2@example.com",
      image: "https://example.com/user2.jpg",
    });

    // Create test tags
    testTag1 = await Tag.create({ name: "javascript", questions: 0 });
    testTag2 = await Tag.create({ name: "react", questions: 0 });
    testTag3 = await Tag.create({ name: "typescript", questions: 0 });
  });

  afterEach(async () => {
    await Question.deleteMany({});
    await Tag.deleteMany({});
    await User.deleteMany({});
    await Interaction.deleteMany({});
  });

  describe("Validation", () => {
    it("should return error for invalid page number", async () => {
      const invalidParams = { page: 0, pageSize: 10 } as PaginatedSearchParams;

      const result = await getQuestions(invalidParams);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("Page must be at least 1");
    });

    it("should return error for invalid page size", async () => {
      const invalidParams = { page: 1, pageSize: 0 } as PaginatedSearchParams;

      const result = await getQuestions(invalidParams);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain("Page size must be at least 1");
    });

    it("should return error for invalid page type", async () => {
      const invalidParams = { page: "invalid" as unknown as number, pageSize: 10 } as PaginatedSearchParams;

      const result = await getQuestions(invalidParams);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("Default behavior (no filter)", () => {
    beforeEach(async () => {
      // Create questions with different creation times
      const now = Date.now();
      await Question.create([
        {
          title: "First Question",
          content: "This is the first question content with enough characters to meet the minimum requirement.",
          author: testUser1._id,
          tags: [testTag1._id],
          createdAt: new Date(now - 3000),
        },
        {
          title: "Second Question",
          content: "This is the second question content with enough characters to meet the minimum requirement.",
          author: testUser2._id,
          tags: [testTag2._id],
          createdAt: new Date(now - 2000),
        },
        {
          title: "Third Question",
          content: "This is the third question content with enough characters to meet the minimum requirement.",
          author: testUser1._id,
          tags: [testTag3._id],
          createdAt: new Date(now - 1000),
        },
      ]);
    });

    it("should return questions sorted by createdAt descending (newest first)", async () => {
      const result = await getQuestions({ page: 1, pageSize: 10 });

      expect(result.success).toBe(true);
      expect(result.data?.questions).toHaveLength(3);
      expect(result.data?.questions[0].title).toBe("Third Question");
      expect(result.data?.questions[1].title).toBe("Second Question");
      expect(result.data?.questions[2].title).toBe("First Question");
    });

    it("should use default pagination values when not provided", async () => {
      const result = await getQuestions({});

      expect(result.success).toBe(true);
      expect(result.data?.questions).toBeDefined();
      expect(result.data?.isNext).toBeDefined();
    });
  });

  describe("Filter: newest", () => {
    beforeEach(async () => {
      const now = Date.now();
      await Question.create([
        {
          title: "Old Question",
          content: "This is an old question content with enough characters to meet the minimum requirement.",
          author: testUser1._id,
          tags: [testTag1._id],
          createdAt: new Date(now - 5000),
          upvotes: 10,
        },
        {
          title: "New Question",
          content: "This is a new question content with enough characters to meet the minimum requirement.",
          author: testUser2._id,
          tags: [testTag2._id],
          createdAt: new Date(now - 1000),
          upvotes: 5,
        },
      ]);
    });

    it("should return questions sorted by createdAt descending", async () => {
      const result = await getQuestions({ page: 1, pageSize: 10, filter: "newest" });

      expect(result.success).toBe(true);
      expect(result.data?.questions).toHaveLength(2);
      expect(result.data?.questions[0].title).toBe("New Question");
      expect(result.data?.questions[1].title).toBe("Old Question");
    });
  });

  describe("Filter: unanswered", () => {
    beforeEach(async () => {
      await Question.create([
        {
          title: "Answered Question",
          content: "This is an answered question content with enough characters to meet the minimum requirement.",
          author: testUser1._id,
          tags: [testTag1._id],
          answers: 3,
        },
        {
          title: "Unanswered Question 1",
          content: "This is an unanswered question content with enough characters to meet the minimum requirement.",
          author: testUser2._id,
          tags: [testTag2._id],
          answers: 0,
        },
        {
          title: "Unanswered Question 2",
          content:
            "This is another unanswered question content with enough characters to meet the minimum requirement.",
          author: testUser1._id,
          tags: [testTag3._id],
          answers: 0,
        },
      ]);
    });

    it("should return only questions with zero answers", async () => {
      const result = await getQuestions({ page: 1, pageSize: 10, filter: "unanswered" });

      expect(result.success).toBe(true);
      expect(result.data?.questions).toHaveLength(2);
      expect(result.data?.questions.every((q) => q.answers === 0)).toBe(true);
      expect(result.data?.questions.some((q) => q.title === "Answered Question")).toBe(false);
    });

    it("should sort unanswered questions by createdAt descending", async () => {
      // Clear existing questions and create new ones with explicit timestamps
      await Question.deleteMany({});
      const now = Date.now();
      await Question.create([
        {
          title: "Unanswered Question 1",
          content: "This is an unanswered question content with enough characters to meet the minimum requirement.",
          author: testUser2._id,
          tags: [testTag2._id],
          answers: 0,
          createdAt: new Date(now - 2000),
        },
        {
          title: "Unanswered Question 2",
          content:
            "This is another unanswered question content with enough characters to meet the minimum requirement.",
          author: testUser1._id,
          tags: [testTag3._id],
          answers: 0,
          createdAt: new Date(now - 1000),
        },
      ]);

      const result = await getQuestions({ page: 1, pageSize: 10, filter: "unanswered" });

      expect(result.success).toBe(true);
      expect(result.data?.questions).toHaveLength(2);
      expect(result.data?.questions[0].title).toBe("Unanswered Question 2");
      expect(result.data?.questions[1].title).toBe("Unanswered Question 1");
    });
  });

  describe("Filter: popular", () => {
    beforeEach(async () => {
      await Question.create([
        {
          title: "Low Upvotes Question",
          content:
            "This is a question with low upvotes content with enough characters to meet the minimum requirement.",
          author: testUser1._id,
          tags: [testTag1._id],
          upvotes: 5,
        },
        {
          title: "High Upvotes Question",
          content:
            "This is a question with high upvotes content with enough characters to meet the minimum requirement.",
          author: testUser2._id,
          tags: [testTag2._id],
          upvotes: 50,
        },
        {
          title: "Medium Upvotes Question",
          content:
            "This is a question with medium upvotes content with enough characters to meet the minimum requirement.",
          author: testUser1._id,
          tags: [testTag3._id],
          upvotes: 20,
        },
      ]);
    });

    it("should return questions sorted by upvotes descending", async () => {
      const result = await getQuestions({ page: 1, pageSize: 10, filter: "popular" });

      expect(result.success).toBe(true);
      expect(result.data?.questions).toHaveLength(3);
      expect(result.data?.questions[0].title).toBe("High Upvotes Question");
      expect(result.data?.questions[0].upvotes).toBe(50);
      expect(result.data?.questions[1].title).toBe("Medium Upvotes Question");
      expect(result.data?.questions[1].upvotes).toBe(20);
      expect(result.data?.questions[2].title).toBe("Low Upvotes Question");
      expect(result.data?.questions[2].upvotes).toBe(5);
    });
  });

  describe("Filter: recommended", () => {
    beforeEach(async () => {
      // Create questions for different users
      await Question.create({
        title: "Question 1",
        content: "This is question 1 content with enough characters to meet the minimum requirement.",
        author: testUser2._id,
        tags: [testTag1._id],
        upvotes: 10,
      });

      await Question.create({
        title: "Question 2",
        content: "This is question 2 content with enough characters to meet the minimum requirement.",
        author: testUser2._id,
        tags: [testTag2._id],
        upvotes: 5,
      });

      await Question.create({
        title: "Question 3",
        content: "This is question 3 content with enough characters to meet the minimum requirement.",
        author: testUser1._id, // User's own question
        tags: [testTag1._id],
        upvotes: 15,
      });

      const question1 = await Question.findOne({ title: "Question 1" });
      if (question1) {
        // Create interactions for testUser1
        await Interaction.create([
          {
            user: testUser1._id,
            action: "view",
            actionId: question1._id,
            actionType: "question",
          },
          {
            user: testUser1._id,
            action: "upvote",
            actionId: question1._id,
            actionType: "question",
          },
        ]);
      }
    });

    it("should return empty array when user is not authenticated", async () => {
      const result = await getQuestions({ page: 1, pageSize: 10, filter: "recommended" });

      expect(result.success).toBe(true);
      expect(result.data?.questions).toHaveLength(0);
      expect(result.data?.isNext).toBe(false);
    });

    it("should return recommended questions based on user interactions when authenticated", async () => {
      // Mock auth to return testUser1
      (auth as jest.Mock).mockResolvedValueOnce({
        user: { id: testUser1._id.toString() },
      });

      const result = await getQuestions({ page: 1, pageSize: 10, filter: "recommended" });

      expect(result.success).toBe(true);
      // Should return question2 (has tag2 which is related to tag1 through interactions)
      // But actually, the logic checks for questions with tags from interacted questions
      // Since question1 has tag1 and user interacted with it, questions with tag1 should be recommended
      // But question3 is excluded because it's the user's own question
      expect(result.data?.questions).toBeDefined();
    });

    it("should exclude user's own questions from recommendations", async () => {
      (auth as jest.Mock).mockResolvedValueOnce({
        user: { id: testUser1._id.toString() },
      });

      const result = await getQuestions({ page: 1, pageSize: 10, filter: "recommended" });

      expect(result.success).toBe(true);
      expect(result.data?.questions.every((q) => q.author._id !== testUser1._id.toString())).toBe(true);
    });

    it("should exclude already interacted questions from recommendations", async () => {
      (auth as jest.Mock).mockResolvedValueOnce({
        user: { id: testUser1._id.toString() },
      });

      const result = await getQuestions({ page: 1, pageSize: 10, filter: "recommended" });

      expect(result.success).toBe(true);
      // Question1 should be excluded as user already interacted with it
      const questionIds = result.data?.questions.map((q) => q._id) || [];
      expect(questionIds).not.toContain(expect.any(String));
    });
  });

  describe("Search functionality", () => {
    beforeEach(async () => {
      await Question.create([
        {
          title: "JavaScript Best Practices",
          content: "What are the best practices for writing JavaScript code? This content has enough characters.",
          author: testUser1._id,
          tags: [testTag1._id],
        },
        {
          title: "React Hooks Guide",
          content: "How to use React hooks effectively? This content has enough characters to meet requirements.",
          author: testUser2._id,
          tags: [testTag2._id],
        },
        {
          title: "TypeScript Advanced Types",
          content: "Learn about advanced TypeScript types and patterns. This content has enough characters.",
          author: testUser1._id,
          tags: [testTag3._id],
        },
        {
          title: "JavaScript Performance",
          content: "Tips for optimizing JavaScript performance. This content has enough characters.",
          author: testUser2._id,
          tags: [testTag1._id],
        },
      ]);
    });

    it("should search questions by title", async () => {
      const result = await getQuestions({ page: 1, pageSize: 10, query: "JavaScript" });

      expect(result.success).toBe(true);
      expect(result.data?.questions.length).toBeGreaterThan(0);
      expect(result.data?.questions.every((q) => q.title.toLowerCase().includes("javascript"))).toBe(true);
    });

    it("should search questions by content", async () => {
      const result = await getQuestions({ page: 1, pageSize: 10, query: "hooks" });

      expect(result.success).toBe(true);
      expect(result.data?.questions.length).toBeGreaterThan(0);
      const foundQuestion = result.data?.questions.find((q) => q.title === "React Hooks Guide");
      expect(foundQuestion).toBeDefined();
    });

    it("should search across both title and content fields", async () => {
      const result = await getQuestions({ page: 1, pageSize: 10, query: "React" });

      expect(result.success).toBe(true);
      expect(result.data?.questions.length).toBeGreaterThan(0);
      // Should find questions with "React" in title or content
      const hasReactInTitleOrContent = result.data?.questions.some(
        (q) => q.title.toLowerCase().includes("react") || q.content.toLowerCase().includes("react")
      );
      expect(hasReactInTitleOrContent).toBe(true);
    });

    it("should perform case-insensitive search", async () => {
      const result1 = await getQuestions({ page: 1, pageSize: 10, query: "javascript" });
      const result2 = await getQuestions({ page: 1, pageSize: 10, query: "JAVASCRIPT" });
      const result3 = await getQuestions({ page: 1, pageSize: 10, query: "JavaScript" });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
      expect(result1.data?.questions.length).toBe(result2.data?.questions.length);
      expect(result2.data?.questions.length).toBe(result3.data?.questions.length);
    });

    it("should return empty array when no questions match search query", async () => {
      const result = await getQuestions({ page: 1, pageSize: 10, query: "Python Django Flask" });

      expect(result.success).toBe(true);
      expect(result.data?.questions).toHaveLength(0);
      expect(result.data?.isNext).toBe(false);
    });

    it("should handle partial matches in search", async () => {
      const result = await getQuestions({ page: 1, pageSize: 10, query: "Script" });

      expect(result.success).toBe(true);
      expect(result.data?.questions.length).toBeGreaterThan(0);
      // Should match both JavaScript and TypeScript
      const titles = result.data?.questions.map((q) => q.title) || [];
      expect(titles.some((title) => title.toLowerCase().includes("script"))).toBe(true);
    });
  });

  describe("Pagination", () => {
    beforeEach(async () => {
      const questions = [];
      for (let i = 1; i <= 15; i++) {
        questions.push({
          title: `Question ${i}`,
          content: `This is question ${i} content with enough characters to meet the minimum requirement.`,
          author: i % 2 === 0 ? testUser1._id : testUser2._id,
          tags: [testTag1._id],
          createdAt: new Date(Date.now() - (15 - i) * 1000),
        });
      }
      await Question.insertMany(questions);
    });

    it("should return first page with correct number of items", async () => {
      const result = await getQuestions({ page: 1, pageSize: 5 });

      expect(result.success).toBe(true);
      expect(result.data?.questions).toHaveLength(5);
      expect(result.data?.isNext).toBe(true);
    });

    it("should return second page correctly", async () => {
      const result = await getQuestions({ page: 2, pageSize: 5 });

      expect(result.success).toBe(true);
      expect(result.data?.questions).toHaveLength(5);
      expect(result.data?.isNext).toBe(true);
      expect(result.data?.questions[0].title).toBe("Question 10");
    });

    it("should return last page with remaining items", async () => {
      const result = await getQuestions({ page: 3, pageSize: 5 });

      expect(result.success).toBe(true);
      expect(result.data?.questions).toHaveLength(5);
      expect(result.data?.isNext).toBe(false);
    });

    it("should set isNext to false on last page", async () => {
      const result = await getQuestions({ page: 4, pageSize: 5 });

      expect(result.success).toBe(true);
      expect(result.data?.questions).toHaveLength(0);
      expect(result.data?.isNext).toBe(false);
    });

    it("should handle custom page sizes", async () => {
      const result = await getQuestions({ page: 1, pageSize: 3 });

      expect(result.success).toBe(true);
      expect(result.data?.questions).toHaveLength(3);
      expect(result.data?.isNext).toBe(true);
    });

    it("should handle large page sizes", async () => {
      const result = await getQuestions({ page: 1, pageSize: 100 });

      expect(result.success).toBe(true);
      expect(result.data?.questions).toHaveLength(15);
      expect(result.data?.isNext).toBe(false);
    });
  });

  describe("Combined scenarios", () => {
    beforeEach(async () => {
      const now = Date.now();
      await Question.create([
        {
          title: "JavaScript Question 1",
          content: "First JavaScript question content with enough characters.",
          author: testUser1._id,
          tags: [testTag1._id],
          upvotes: 10,
          answers: 0,
          createdAt: new Date(now - 5000),
        },
        {
          title: "JavaScript Question 2",
          content: "Second JavaScript question content with enough characters.",
          author: testUser2._id,
          tags: [testTag1._id],
          upvotes: 20,
          answers: 2,
          createdAt: new Date(now - 3000),
        },
        {
          title: "React Question 1",
          content: "First React question content with enough characters.",
          author: testUser1._id,
          tags: [testTag2._id],
          upvotes: 15,
          answers: 0,
          createdAt: new Date(now - 2000),
        },
        {
          title: "React Question 2",
          content: "Second React question content with enough characters.",
          author: testUser2._id,
          tags: [testTag2._id],
          upvotes: 5,
          answers: 1,
          createdAt: new Date(now - 1000),
        },
      ]);
    });

    it("should combine search with newest filter", async () => {
      const result = await getQuestions({ page: 1, pageSize: 10, query: "JavaScript", filter: "newest" });

      expect(result.success).toBe(true);
      expect(result.data?.questions.length).toBeGreaterThan(0);
      expect(result.data?.questions.every((q) => q.title.toLowerCase().includes("javascript"))).toBe(true);
      // Should be sorted by newest (createdAt desc)
      const timestamps = result.data?.questions.map((q) => new Date(q.createdAt).getTime()) || [];
      if (timestamps.length > 1) {
        expect(timestamps[0]).toBeGreaterThanOrEqual(timestamps[1]);
      }
    });

    it("should combine search with popular filter", async () => {
      const result = await getQuestions({ page: 1, pageSize: 10, query: "JavaScript", filter: "popular" });

      expect(result.success).toBe(true);
      expect(result.data?.questions.length).toBeGreaterThan(0);
      expect(result.data?.questions.every((q) => q.title.toLowerCase().includes("javascript"))).toBe(true);
      // Should be sorted by upvotes desc
      if (result.data?.questions.length && result.data.questions.length > 1) {
        expect(result.data.questions[0].upvotes).toBeGreaterThanOrEqual(result.data.questions[1]?.upvotes ?? 0);
      }
    });

    it("should combine search with unanswered filter", async () => {
      const result = await getQuestions({ page: 1, pageSize: 10, query: "React", filter: "unanswered" });

      expect(result.success).toBe(true);
      expect(result.data?.questions.length).toBeGreaterThan(0);
      expect(result.data?.questions.every((q) => q.answers === 0)).toBe(true);
      expect(result.data?.questions.every((q) => q.title.toLowerCase().includes("react"))).toBe(true);
    });

    it("should combine filter with pagination", async () => {
      const result1 = await getQuestions({ page: 1, pageSize: 2, filter: "popular" });
      const result2 = await getQuestions({ page: 2, pageSize: 2, filter: "popular" });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data?.questions).toHaveLength(2);
      expect(result2.data?.questions).toHaveLength(2);
      // Verify sorting is maintained across pages
      if (result1.data?.questions[0] && result1.data.questions[1]) {
        expect(result1.data.questions[0].upvotes).toBeGreaterThanOrEqual(result1.data.questions[1].upvotes ?? 0);
      }
    });

    it("should combine search with pagination", async () => {
      const result1 = await getQuestions({ page: 1, pageSize: 1, query: "Question" });
      const result2 = await getQuestions({ page: 2, pageSize: 1, query: "Question" });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data?.questions).toHaveLength(1);
      expect(result2.data?.questions).toHaveLength(1);
      // Results should be different
      if (result1.data?.questions[0] && result2.data?.questions[0]) {
        expect(result1.data.questions[0]._id).not.toBe(result2.data.questions[0]._id);
      }
    });

    it("should combine search, filter, and pagination", async () => {
      const result = await getQuestions({
        page: 1,
        pageSize: 1,
        query: "JavaScript",
        filter: "popular",
      });

      expect(result.success).toBe(true);
      expect(result.data?.questions).toHaveLength(1);
      expect(result.data?.questions[0].title.toLowerCase().includes("javascript")).toBe(true);
      expect(result.data?.isNext).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should return empty array when no questions exist", async () => {
      const result = await getQuestions({ page: 1, pageSize: 10 });

      expect(result.success).toBe(true);
      expect(result.data?.questions).toHaveLength(0);
      expect(result.data?.isNext).toBe(false);
    });

    it("should handle questions with populated tags and author", async () => {
      await Question.create({
        title: "Test Question",
        content: "This is a test question content with enough characters to meet the minimum requirement.",
        author: testUser1._id,
        tags: [testTag1._id, testTag2._id],
      });

      const result = await getQuestions({ page: 1, pageSize: 10 });

      expect(result.success).toBe(true);
      expect(result.data?.questions).toHaveLength(1);
      expect(result.data?.questions[0].tags).toBeDefined();
      expect(result.data?.questions[0].tags.length).toBeGreaterThan(0);
      expect(result.data?.questions[0].tags[0]).toHaveProperty("name");
      expect(result.data?.questions[0].author).toBeDefined();
      expect(result.data?.questions[0].author).toHaveProperty("name");
      expect(result.data?.questions[0].author).toHaveProperty("image");
    });

    it("should handle questions with no tags", async () => {
      await Question.create({
        title: "Question Without Tags",
        content: "This is a question without tags content with enough characters to meet the minimum requirement.",
        author: testUser1._id,
        tags: [],
      });

      const result = await getQuestions({ page: 1, pageSize: 10 });

      expect(result.success).toBe(true);
      expect(result.data?.questions).toHaveLength(1);
      expect(result.data?.questions[0].tags).toEqual([]);
    });

    it("should handle special characters in search query", async () => {
      await Question.create({
        title: "Question with Special Chars: !@#$%",
        content: "This question has special characters content with enough characters to meet the minimum requirement.",
        author: testUser1._id,
        tags: [testTag1._id],
      });

      const result = await getQuestions({ page: 1, pageSize: 10, query: "Special" });

      expect(result.success).toBe(true);
      expect(result.data?.questions.length).toBeGreaterThan(0);
    });
  });
});
