import colors from "../config/colors";
import Player from "../models/playerModel";
import Game from "../models/gameModel";
import Pick from "../models/pickModel";
import Entry from "../models/entryModel";

// Seed database with players, game, and picks - runs once on startup
export const seedDatabase = async () => {
  try {
    // Clear everything first
    await Entry.deleteMany({});
    await Pick.deleteMany({});
    await Game.deleteMany({});
    await Player.deleteMany({});

    // Create players
    const luka = await Player.create({
      firstName: "Luka",
      lastName: "Dončić",
      team: "Los Angeles Lakers",
      position: "PG",
      imageUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1629029.png",
    });

    const lebron = await Player.create({
      firstName: "LeBron",
      lastName: "James",
      team: "Los Angeles Lakers",
      position: "SF",
      imageUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/2544.png",
    });

    const jaylen = await Player.create({
      firstName: "Jaylen",
      lastName: "Brown",
      team: "Boston Celtics",
      position: "SF",
      imageUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1627759.png",
    });

    const jayson = await Player.create({
      firstName: "Jayson",
      lastName: "Tatum",
      team: "Boston Celtics",
      position: "SF",
      imageUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1628369.png",
    });

    // Add three more players
    const anfernee = await Player.create({
      firstName: "Anfernee",
      lastName: "Simons",
      team: "Boston Celtics",
      position: "PG",
      imageUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1629014.png",
    });

    const austin = await Player.create({
      firstName: "Austin",
      lastName: "Reaves",
      team: "Los Angeles Lakers",
      position: "SG",
      imageUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1630559.png",
    });

    const deandre = await Player.create({
      firstName: "Deandre",
      lastName: "Ayton",
      team: "Los Angeles Lakers",
      position: "C",
      imageUrl: "https://cdn.nba.com/headshots/nba/latest/260x190/1629028.png",
    });

    // Create game between Lakers and Celtics for December 2026
    const game = await Game.create({
      homeTeam: "Los Angeles Lakers",
      awayTeam: "Boston Celtics",
      startTime: new Date("2026-12-25T20:00:00.000Z"), // Christmas Day 2026
    });

    // Create picks for each player
    const lukaPick = await Pick.create({
      player: luka._id,
      game: game._id,
      statType: "points",
      line: 28.5,
    });

    const lebronPick = await Pick.create({
      player: lebron._id,
      game: game._id,
      statType: "points",
      line: 25.0,
    });

    const jaylenPick = await Pick.create({
      player: jaylen._id,
      game: game._id,
      statType: "points",
      line: 23.5,
    });

    const jaysonPick = await Pick.create({
      player: jayson._id,
      game: game._id,
      statType: "points",
      line: 26.5,
    });

    // Add picks for the new players
    const anferneePick = await Pick.create({
      player: anfernee._id,
      game: game._id,
      statType: "assists",
      line: 6.5,
    });

    const austinPick = await Pick.create({
      player: austin._id,
      game: game._id,
      statType: "assists",
      line: 5.5,
    });

    const deandrePick = await Pick.create({
      player: deandre._id,
      game: game._id,
      statType: "rebounds",
      line: 10.5,
    });
  } catch (error) {
    console.error(colors.red("❌ Error during database seeding:"), error);
  }
};
