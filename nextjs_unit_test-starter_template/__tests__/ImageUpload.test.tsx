import { ImageUpload } from "@/components/input-fields/ImageUpload";
import { fireEvent, render, screen } from "@testing-library/react";

describe("ImageUpload", () => {
  const mockHandleChange = jest.fn();
  it("calls handleChange when file is selected", () => {
    render(<ImageUpload handleChange={mockHandleChange} />);

    const file = new File(["content"], "test.png", { type: "image/png" });
    const input = screen.getByTestId("file-upload");

    fireEvent.change(input, { target: { files: [file] } });
    expect(mockHandleChange).toHaveBeenCalledTimes(1);
    expect(mockHandleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          files: expect.arrayContaining([file]),
        }),
      })
    );
  });

  it("calls handleChange when a single file is dropped", () => {
    render(<ImageUpload handleChange={mockHandleChange} />);

    const file = new File(["content"], "test.png", { type: "image/png" });
    const dropZone = screen.getByTestId("drop-zone");

    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });
    expect(mockHandleChange).toHaveBeenCalledTimes(1);
    expect(mockHandleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          files: expect.arrayContaining([file]),
        }),
      })
    );
  });

  it("not calls handleChange when a non-image file is dropped", () => {
    render(<ImageUpload handleChange={mockHandleChange} />);

    const file = new File(["content"], "test.txt", { type: "text/plain" });
    const dropZone = screen.getByTestId("drop-zone");

    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });
    expect(mockHandleChange).not.toHaveBeenCalled();
  });

  it("clears errorMessage when a valid file is selected", () => {
    render(<ImageUpload handleChange={mockHandleChange} />);

    const file1 = new File(["content"], "test.png", { type: "image/png" });
    const file2 = new File(["content"], "test.png", { type: "image/png" });

    const dropZone = screen.getByTestId("drop-zone");

    fireEvent.drop(dropZone, { dataTransfer: { files: [file1, file2] } });
    expect(screen.getByTestId("error-message")).toBeInTheDocument();

    const validFile = new File(["content"], "test.png", { type: "image/png" });
    fireEvent.drop(dropZone, { dataTransfer: { files: [validFile] } });
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });
});
