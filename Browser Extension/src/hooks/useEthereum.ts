/* eslint-disable @typescript-eslint/no-explicit-any */
interface Options {
  type?: string;
  methodArgs?: any[];
  callArgs?: any[];
  sendArgs?: any[];
}

const useEthereum = () => {
  const callMethodInTabContext = (method: string, options?: Options) => {
    return new Promise<any>((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id!, { method, options }, (response) => {
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
    request: (...args: any[]) => callMethodInTabContext("request", { methodArgs: args }),
    contractCall: (method: string, methodArgs: any[], callArgs: any[]) =>
      callMethodInTabContext(method, { type: "call", methodArgs, callArgs }),
    contractSend: (method: string, methodArgs: any[], sendArgs: any[]) =>
      callMethodInTabContext(method, { type: "send", methodArgs, sendArgs })
  };

  return ethereum;
};

export default useEthereum;
