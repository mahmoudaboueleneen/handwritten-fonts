const config = {
  deployedContractAddress: import.meta.env.VITE_DEPLOYED_CONTRACT_ADDRESS,
  ipfsUploadApiUrl: import.meta.env.VITE_IPFS_UPLOAD_API_URL,
  ipfsFetchApiUrl: import.meta.env.VITE_IPFS_FETCH_API_URL,
  ipfsApiKey: import.meta.env.VITE_IPFS_API_KEY
};

export { config };
