import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GenreFilter } from "../GenreFilter";
import { GENRES } from "@/types";

describe("GenreFilter", () => {
  it("renders all genre options plus 'All genres'", () => {
    const onChange = vi.fn();
    render(<GenreFilter value={undefined} onChange={onChange} />);

    const select = screen.getByRole("combobox", { name: /filter by genre/i });
    expect(select).toBeInTheDocument();

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(GENRES.length + 1);

    expect(screen.getByRole("option", { name: "All genres" })).toBeInTheDocument();
    GENRES.forEach((genre) => {
      const capitalizedGenre = genre.charAt(0).toUpperCase() + genre.slice(1);
      expect(screen.getByRole("option", { name: capitalizedGenre })).toBeInTheDocument();
    });
  });

  it("calls onChange with undefined when 'All genres' is selected", () => {
    const onChange = vi.fn();
    render(<GenreFilter value="action" onChange={onChange} />);

    const select = screen.getByRole("combobox", { name: /filter by genre/i });
    fireEvent.change(select, { target: { value: "" } });

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("calls onChange with genre when a specific genre is selected", () => {
    const onChange = vi.fn();
    render(<GenreFilter value={undefined} onChange={onChange} />);

    const select = screen.getByRole("combobox", { name: /filter by genre/i });
    fireEvent.change(select, { target: { value: "horror" } });

    expect(onChange).toHaveBeenCalledWith("horror");
  });

  it("displays the selected genre value", () => {
    const onChange = vi.fn();
    render(<GenreFilter value="comedy" onChange={onChange} />);

    const select = screen.getByRole("combobox", { name: /filter by genre/i }) as HTMLSelectElement;
    expect(select.value).toBe("comedy");
  });
});
