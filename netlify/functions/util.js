const fs = require("fs").promises;
require("dotenv").config();
const clientPromise = require("./mongodb.js");

let tierMap = new Map([
  ["IRON", 1000],
  ["BRONZE", 2000],
  ["SILVER", 3000],
  ["GOLD", 4000],
  ["PLATINUM", 5000],
  ["EMERALD", 6000],
  ["DIAMOND", 7000],
  ["MASTER", 8000],
  ["GRANDMASTER", 8000],
  ["CHALLENGER", 8000],
]);
module.exports.tierMap = tierMap;

let rankMap = new Map([
  ["IV", 100],
  ["III", 200],
  ["II", 300],
  ["I", 400],
]);

module.exports.rankMap = rankMap;

// Fetch Data from a API Link
const fetchID = async (link) => {
  const response = await fetch(link);
  if (!response.ok) {
    throw new Error("Network response was not ok for link: " + link);
  }
  const data = await response.json();
  return data;
};

module.exports.fetchID = fetchID;

const fetchData = async (link) => {
  const response = await fetch(link);
  if (!response.ok) {
    throw new Error("Network response was not ok for link: " + link);
  }
  const data = await response.json();
  for (const obj of data) {
    if (obj.queueType === "RANKED_TFT") {
      console.log(obj);
      return obj;
    }
  }
};

module.exports.fetchData = fetchData;

// ENV variable api key
let api_key = process.env.API_KEY;
module.exports.fetchAPIKey = api_key;

const getData = async () => {
  const client = await clientPromise;
  const isConnected = await client.topology.isConnected();
  const db = client.db("userdata");
  const collection = db.collection("info");
  const info = await collection.find({}).toArray();

  // client.close();

  return {
    info: {
      isConnected,
      userinfo: JSON.stringify(info),
    },
  };
};

module.exports.getData = getData;

const updateDatabaseSnapshotPoints = async (username, newSnapshotPoints) => {
  // getting data
  const client = await clientPromise;
  const isConnected = await client.topology.isConnected();
  const db = client.db("userdata");
  const collection = db.collection("info");

  try {
    // Updating data
    const filter = { username: username };
    const update = { $set: { snapshotPoints: newSnapshotPoints } };
    const result = await collection.updateOne(filter, update);

    // console.log(`Matched count: ${result.matchedCount}`);
    // console.log(`Modified count: ${result.modifiedCount}`);

    // Fetch updated data
    const updatedInfo = await collection.find({}).toArray();
    // client.close();

    return {
      info: {
        isConnected,
        userinfo: JSON.stringify(updatedInfo),
      },
    };
  } catch (error) {
    console.log("Error updating data:", error);
    throw error; // Rethrow the error for proper error handling
  }
};
module.exports.updateDatabaseSnapshotPoints = updateDatabaseSnapshotPoints;

const insertUser = async (username, tag, tier, rank, lp, orderingScore) => {
  const client = await clientPromise;
  const isConnected = await client.topology.isConnected();
  const db = client.db("userdata");
  const collection = db.collection("info");

  try {
    const user = {
      username: username,
      tag: tag,
      tier: tier,
      rank: rank,
      leaguePoints: lp,
      orderingScore: orderingScore,
      snapshotPoints: 0,
    };
    const result = collection.insertOne(user);
    console.log(
      `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`
    );
    return {
      info: {
        isConnected,
      },
    };
  } catch (error) {
    console.log("Error updating data:", error);
    throw error; // Rethrow the error for proper error handling
  }
};
module.exports.insertUser = insertUser;

const updateDatabaseStats = async (
  username,
  tag,
  newTier,
  newRank,
  newLeaguePoints,
  newOrderingScore
) => {
  console.log(username);
  console.log(newTier);
  console.log(newOrderingScore);
  // getting data
  const client = await clientPromise;
  const isConnected = await client.topology.isConnected();
  const db = client.db("userdata");
  const collection = db.collection("info");

  try {
    // Updating data
    const filter = { username: username };
    const newProperties = {
      tier: newTier,
      rank: newRank,
      leaguePoints: newLeaguePoints,
      orderingScore: newOrderingScore,
    };
    const update = { $set: newProperties };
    const result = await collection.updateOne(filter, update);

    console.log(`Matched count: ${result.matchedCount}`);
    console.log(`Modified count: ${result.modifiedCount}`);

    // Fetch updated data
    const updatedInfo = await collection.find({}).toArray();
    // client.close();

    return {
      info: {
        isConnected,
        userinfo: JSON.stringify(updatedInfo),
      },
    };
  } catch (error) {
    console.log("Error updating data:", error);
    throw error; // Rethrow the error for proper error handling
  }
};

module.exports.updateDatabaseStats = updateDatabaseStats;

// async function test() {
//   try {
//     const data = await updateDatabaseSnapshotPoints("mattjzhou", 1);
//     console.log(data);
//   } catch (error) {
//     console.log("error fetching data", error);
//   }
// }
// test();

// const sortDatabase = async () => {
//   const client = await clientPromise;
//   const isConnected = await client.topology.isConnected();
//   const db = client.db("userdata");
//   const collection = db.collection("info");

//   try {
//     // Fetch data and sort it by leaguePoints
//     const sortedInfo = await collection
//       .find({})
//       .sort({ orderingScore: -1 })
//       .toArray();

//     // Delete existing data
//     const deleteResult = await collection.deleteMany({});
//     console.log(`Deleted ${deleteResult.deletedCount} documents`);
//     console.log(deleteResult);

//     // Reinsert sorted data
//     const insertResult = await collection.insertMany(sortedInfo);
//     console.log(`Inserted ${insertResult.insertedCount} documents`);

//     return {
//       info: {
//         isConnected,
//         userinfo: JSON.stringify(sortedInfo),
//       },
//     };
//   } catch (error) {
//     console.log("Error deleting, sorting, and reinserting data:", error);
//     throw error;
//   }
// };

// module.exports.sortDatabase = sortDatabase;
