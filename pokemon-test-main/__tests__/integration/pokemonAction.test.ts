import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import {
  getPokemons,
  getPokemonsByTypePaginated,
} from "@/actions/pokemons.action";
import { mockBulbasaurDetails } from "../mocks/mock.data";

describe("getPokemons Server Action", () => {
  it("should fetch and correctly transform the pokemon data on success", async () => {
    const pokemons = await getPokemons();
    expect(pokemons).toHaveLength(2);
    expect(pokemons[0]).toEqual({
      id: 1,
      name: "Bulbasaur",
      image: "https://example.com/bulbasaur.png",
      types: ["grass", "poison"],
      stats: {
        hp: 45,
        attack: 49,
        defense: 49,
        spAtk: 65,
        spDef: 65,
        speed: 45,
      },
    });
  });

  it("should fetch and correctly transform the pokemon data by type", async () => {
    const pokemons = await getPokemonsByTypePaginated("grass");
    expect(pokemons).toHaveLength(2);
    expect(pokemons[0]).toEqual({
      id: 1,
      name: "Bulbasaur",
      image: "https://example.com/bulbasaur.png",
      types: ["grass", "poison"],
      stats: {
        hp: 45,
        attack: 49,
        defense: 49,
        spAtk: 65,
        spDef: 65,
        speed: 45,
      },
    });
    expect(pokemons[1]).toEqual({
      id: 2,
      image:
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png",
      name: "Ivysaur",
      stats: {
        attack: 62,
        defense: 63,
        hp: 60,
        spAtk: 80,
        spDef: 80,
        speed: 60,
      },
      types: ["grass", "poison"],
    });
  });
});
