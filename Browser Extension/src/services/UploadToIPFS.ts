import { config } from "../config/config";

export async function uploadToIPFS(file: File) {
  const data = new FormData();
  data.append("file", file);

  const response = await fetch(`${config.ipfsUploadApiUrl}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.ipfsApiKey}`
    },
    body: data
  });

  const { ok, value } = await response.json();

  if (!ok) {
    throw new Error(value.error.message);
  }

  const url = `${config.ipfsFetchApiUrl}/${value.cid}/${file.name}`;
  const cid = value.cid;

  return { url, cid };
}
