import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());
  const registry : RegisterNodeBody[] = [];

  // TODO implement the status route
  _registry.get("/status/", (req, res) => {
    res.send("live");
  });

  _registry.post("/registerNode", (req: Request<{}, {}, RegisterNodeBody>, res: Response) => {
    const { nodeId, pubKey } = req.body;
  
    // Check if the node is already registered
    const nodeExists = registry.some(node => node.nodeId === nodeId);
  
    if (nodeExists) {
      res.status(400).send("Node is already registered");
    } else {
      // Add the node to the registry
      registry.push({ nodeId, pubKey });
      console.log(`Node ${nodeId} registered with public key ${pubKey}`);
      res.send("Node registered successfully");
    }
  });

  _registry.get("/getNodeRegistry", (req, res) => {
    const payload: GetNodeRegistryBody = {
      nodes: registry
    };
    res.json(payload);
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
