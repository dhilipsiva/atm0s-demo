"use server";

import { GATEWAY } from "~/consts";

export async function generate_token(
  room: string,
  peer: string,
): Promise<string> {
  const url = `${GATEWAY}/token/webrtc`;
  console.log("Creating token with url:", url);
  const rawResponse = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer insecure",
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      room,
      peer,
      record: false,
      ttl: 7200,
      extra_data: "Created from server at " + new Date().getTime(),
    }),
    cache: "no-cache",
  });
  if (rawResponse.status == 200) {
    const content = await rawResponse.json();
    if (content.data?.token) {
      return content.data.token;
    } else {
      console.log("create token error", content);
      throw new Error(content.error_code);
    }
  } else {
    const content = await rawResponse.text();
    console.log("create token error", rawResponse.status, content);
    throw new Error(rawResponse.statusText);
  }
}

export async function generate_random_token() {
  const now = new Date().getTime();
  const room = "demo-room";
  const peer = "peer-" + now;
  return [room, peer, await generate_token(room, peer)];
}
