import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";
import axios from "axios";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());
  var lastReceivedMessage: any = null;
  var LastSentMessage: any = null;
  // TODO implement the status route
  _user.get("/status/", (req, res) => {
    res.send("live");
  });

  _user.get("/getLastReceivedMessage", (req, res) => {
    res.json({ result: lastReceivedMessage });
  });
  _user.get("/getLastSentMessage", (req, res) => {
  res.json({ result: LastSentMessage });
  }
  );
  _user.post("/message", (req, res) => {
    const { message } = req.body;
    lastReceivedMessage = message;
    res.send("success");
  });

  _user.post("/sendMessage", async (req, res) => {
    const { message, destinationUserId } = req.body;
    LastSentMessage = message;

    // get the registry
    const response = await axios.get("http://localhost:8080/getNodeRegistry");
    const registry = response.data;

    // choose 3 random nodes
    const nodes = registry.nodes;
    const chosenNodes = [];
    while (chosenNodes.length < 3) {
      const randomIndex = Math.floor(Math.random() * nodes.length);
      const randomNode = nodes[randomIndex];
      if (randomNode.nodeId !== userId) {
        chosenNodes.push(randomNode);
      }
    }

    // send the message to the first node
    const firstNode = chosenNodes[0];
    await axios.post(`localhost:${BASE_USER_PORT + firstNode.nodeId}/message`, {
      message,
    });
  });

  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
      `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}
