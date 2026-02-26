import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GenreFilter } from "../GenreFilter";
import { GENRES } from "@/types";

describe("GenreFilter", () => {
  it("renders all genre buttons plus 'All'", () => {
    const onChange = vi.fn();
    render(<GenreFilter value={undefined} onChange={onChange} />);

    const group = screen.getByRole("group", { name: /filter by genre/i });
    expect(group).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(GENRES.length + 1);

    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    GENRES.forEach((genre) => {
      expect(screen.getByRole("button", { name: genre })).toBeInTheDocument();
    });
  });

  it("calls onChange with undefined when 'All' is clicked", () => {
    const onChange = vi.fn();
    render(<GenreFilter value="action" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "All" }));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("calls onChange with genre when a specific genre is clicked", () => {
    const onChange = vi.fn();
    render(<GenreFilter value={undefined} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "horror" }));

    expect(onChange).toHaveBeenCalledWith("horror");
  });

  it("highlights the selected genre button", () => {
    const onChange = vi.fn();
    render(<GenreFilter value="comedy" onChange={onChange} />);

    const comedyButton = screen.getByRole("button", { name: "comedy" });
    expect(comedyButton).toHaveClass("bg-blue-600");

    const allButton = screen.getByRole("button", { name: "All" });
    expect(allButton).not.toHaveClass("bg-blue-600");
  });
});
