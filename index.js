import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { startStandaloneServer } from "@apollo/server/standalone";
import { Neo4jGraphQL } from "@neo4j/graphql";
import neo4j from "neo4j-driver";
import dotenv from "dotenv";
import fs from "fs";

const schema = fs.readFileSync("./schema.gql").toString();

dotenv.config();

const typeDefs = `#graphql

${schema}

`;

const plugins = [ApolloServerPluginLandingPageLocalDefault({ embed: true })];

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO47_PASSWORD)
);

const neoSchema = new Neo4jGraphQL({
  typeDefs,
  driver,
});

const server = new ApolloServer({
  schema: await neoSchema.getSchema(),
  plugins,
  introspection: true,
});

const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => ({ req }),
  listen: { port: process.env.PORT || 4000 },
});

console.log(`🚀 Server ready at ${url}`);
