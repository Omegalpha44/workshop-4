import bodyParser from "body-parser";
import express from "express";
import { BASE_ONION_ROUTER_PORT } from "../config";
import { generateRsaKeyPair , exportPrvKey, exportPubKey, exportSymKey} from "../crypto";
import axios from "axios";


export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());
  const lastReceivedMessage = null;
  const lastReceivedDecryptedMessage = null;
  const lastMessageDestination = null;
  const publicKeyBase64 = null;
  const privateKeyBase64 = null;
  // TODO implement the status route
  onionRouter.get("/status/", (req, res) => {
    res.send("live");
  });

  onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
    // TODO: Retrieve the last received encrypted message
    res.json({ result: lastReceivedMessage });
  });

  onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
    // TODO: Retrieve the last received decrypted message
    res.json({ result: lastReceivedDecryptedMessage });
  });

  onionRouter.get("/getLastMessageDestination", (req, res) => {
    // TODO: Retrieve the destination of the last received message
    res.json({ result: lastMessageDestination });
  });

  onionRouter.post("/registerNode", async (req, res) => {
    const { id, name } = req.body;
    
    // Generate RSA key pair
    const { publicKey, privateKey } = await generateRsaKeyPair();
  
    // Convert keys to base64 strings for storage
    const publicKeyBase64 = await exportPubKey(publicKey);
    const privateKeyBase64 = await exportPrvKey(privateKey);
    // Send the public key to the registry
    await axios.post("http://localhost:8080/registerNode", {
      id,
      publicKey: publicKeyBase64,
    });
    console.log(`Node ${id} registered with name ${name}`);
    res.send("Node registered successfully");
  });

    onionRouter.get("/getPrivateKey", async (req, res) => {
      
      res.json({ result: privateKeyBase64 });
    });

    const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
      console.log(
        `Onion router ${nodeId} is listening on port ${
          BASE_ONION_ROUTER_PORT + nodeId
        }`
      );
    });

    return server;
  }

  