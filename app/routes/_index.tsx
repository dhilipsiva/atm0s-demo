import { useEffect, useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import { generate_random_token } from "../actions/token";
import Content from "./content";

export const meta: MetaFunction = () => {
  return [
    { title: "Atm0s Demo App" },
    { name: "description", content: "Welcome to Atm0s Demo!" },
  ];
};

const IndexComponent = () => {
  const [room, setRoom] = useState<string | null>(null);
  const [peer, setPeer] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const [room, peer, token] = await generate_random_token();
        setRoom(room);
        setPeer(peer);
        setToken(token);
      } catch (error) {
        console.log("FREAKING ERROR HAPPENED!");
        console.log(error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <Content room={room!} peer={peer!} token={token!} />;
};

export default IndexComponent;
