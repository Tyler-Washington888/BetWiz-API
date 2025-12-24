import mongoose from "mongoose";
import colors from "../config/colors";
import Player from "../models/playerModel";
import Game from "../models/gameModel";
import Pick from "../models/pickModel";
import Entry from "../models/entryModel";
import OAuthClient from "../models/oauthClientModel";


export const seedDatabase = async () => {
  try {
    
    if (mongoose.connection.readyState !== 1) {
      console.log("⚠️  Database not connected, skipping seeding".yellow);
      return;
    }

    
    await Entry.deleteMany({});
    await Pick.deleteMany({});
    await Game.deleteMany({});
    await Player.deleteMany({});

    
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

    
    const game = await Game.create({
      homeTeam: "Los Angeles Lakers",
      awayTeam: "Boston Celtics",
      startTime: new Date("2026-12-25T20:00:00.000Z"), 
    });

    
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

    
    const bet360ClientId = process.env.BET360_CLIENT_ID || "bet360_client_id";
    const bet360ClientSecret = process.env.BET360_CLIENT_SECRET || "bet360_client_secret";
    const bet360RedirectUri = process.env.BET360_UI_URL 
      ? `${process.env.BET360_UI_URL}/oauth/callback`
      : "http://localhost:5173/oauth/callback";

    
    let oauthClient = await OAuthClient.findOne({ clientId: bet360ClientId });
    
    if (!oauthClient) {
      oauthClient = await OAuthClient.create({
        clientId: bet360ClientId,
        clientSecret: bet360ClientSecret,
        clientName: "Bet360",
        redirectUris: [bet360RedirectUri],
        allowedScopes: ["betting_events:read", "betting_events:subscribe"],
        isActive: true,
      });
      console.log(colors.green("✅ OAuth client created for Bet360"));
    } else {
      
      if (!oauthClient.redirectUris.includes(bet360RedirectUri)) {
        oauthClient.redirectUris.push(bet360RedirectUri);
        await oauthClient.save();
        console.log(colors.yellow("⚠️  Updated OAuth client redirect URI"));
      }
    }
  } catch (error) {
    console.error(colors.red("❌ Error during database seeding:"), error);
  }
};
