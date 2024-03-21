import { config } from "../config/config";

export async function fetchFromIPFS(cid: string, filename: string) {
  const response = await fetch(`${config.ipfsFetchApiUrl}/${cid}/${filename}`);

  return await response.blob();
}
