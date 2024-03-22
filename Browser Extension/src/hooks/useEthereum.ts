/* eslint-disable @typescript-eslint/no-explicit-any */
const useEthereum = () => {
  const callEthereumMethod = (method: string, type: string, ...args: any[]) => {
    return new Promise<any>((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id!, { method, type, args }, (response) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.result);
          }
        });
      });
    });
  };

  const ethereum = {
    request: (...args: any[]) => callEthereumMethod("request", "call", ...args),
    call: (method: string, ...args: any[]) => callEthereumMethod(method, "call", ...args),
    send: (method: string, ...args: any[]) => callEthereumMethod(method, "send", ...args)
  };

  return ethereum;
};

export default useEthereum;
