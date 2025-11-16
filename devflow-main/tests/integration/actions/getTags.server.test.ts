import { Tag } from "@/database";
import { getTags } from "@/lib/actions/tag.action";

describe("getTags", () => {
  describe("Validation", () => {
    it("should return error if invalid params", async () => {
      const invalidParams = { page: "invalid", pageSize: -10 } as unknown as PaginatedSearchParams;

      const result = await getTags(invalidParams);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error && result.error.message).toContain(
        "expected number, received string, Page size must be at least 1"
      );
    });
  });

  describe("Pagination and Sorting", () => {
    beforeEach(async () => {
      const testTags = [
        { name: "javascript", questions: 10, createdAt: Date.now() },
        { name: "typescript", questions: 20, createdAt: Date.now() - 1000 },
        { name: "react", questions: 30, createdAt: Date.now() - 2000 },
      ];
      await Tag.insertMany(testTags);
    });
    afterEach(async () => {
      await Tag.deleteMany({});
    });

    it("should return the 1st page of tags by question count", async () => {
      const { success, data } = await getTags({ page: 1, pageSize: 2 });

      expect(success).toBe(true);
      expect(data?.tags).toHaveLength(2);
      expect(data?.isNext).toBe(true);
      expect(data?.tags?.at(0)?.name).toBe("react");
      expect(data?.tags?.at(1)?.name).toBe("typescript");
    });

    it("should return the 2nd page of tags when paginated", async () => {
      const { success, data } = await getTags({ page: 2, pageSize: 2 });

      expect(success).toBe(true);
      expect(data?.tags).toHaveLength(1);
      expect(data?.isNext).toBe(false);
      expect(data?.tags?.at(0)?.name).toBe("javascript");
    });
  });

  describe("Search", () => {
    beforeEach(async () => {
      const testTags = [
        { name: "javascript", questions: 10, createdAt: Date.now() },
        { name: "java", questions: 20, createdAt: Date.now() - 1000 },
        { name: "react", questions: 30, createdAt: Date.now() - 2000 },
      ];
      await Tag.insertMany(testTags);
    });
    afterEach(async () => {
      await Tag.deleteMany({});
    });
    it("should filter tags by partial name match", async () => {
      const { success, data } = await getTags({ page: 1, pageSize: 10, query: "java" });
      expect(success).toBe(true);
      expect(data?.tags).toHaveLength(2);
      expect(data?.tags?.map((tag) => tag.name)).toEqual(["java", "javascript"]);
    });
    it("should return empty array if no tags found", async () => {
      const { success, data } = await getTags({ page: 1, pageSize: 10, query: "python" });
      expect(success).toBe(true);
      expect(data?.tags).toHaveLength(0);
    });
  });
});
