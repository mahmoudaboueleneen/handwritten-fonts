# Handwritten Fonts

## Table of Contents

## System Design

### Design Goals

Due to the nature of the project in dealing with font files corresponding to real individuals' handwriting, which is considered sensitive user data, the security requirements of the developed system dictated the design goals and choices.

The design goals were to implement a system that eliminated the use of server-side actions with the aforementioned sensitive user data, which would otherwise require client-server communication with back-and-forth communication to send the user data over the network, which, in turn, posed a security risk to such user data. The use of encrypted communication over HTTPS or developing a system to manually encrypt the data being sent over the network still exposes the user's data while the transfer is occurring.

Thus, the generation of the fonts needed to be done locally on the user's machine, where no outgoing network requests would be performed and all the data would be inputted and processed directly on the user's device.

The problem that follows the processing and generation of the font file would be where to store the file for retrieval and use in our application. Using a centralized database would pose the risk of potentially exposing the font files of all system users in the event of a data leak. Furthermore, a centralized database would act as a single point of failure in which the persistence of the users' data depends on the reliability of the database systems, and incidents of data loss or corruption could mean the loss of all user data. Finally, utilizing a centralized database would dictate that one entity is to be entrusted with the entirety of the user's handwritten font data, which the user has no say over in how it is stored, encrypted, or used. For these reasons, a decentralized file storage system was deemed fit, in which the user

Closely tied to the problem of storage is the problem of processing requests. Sending and receiving messages requires maintaining records of these sent messages and managing permissions to allow the intended recipient to fetch the font file that the message is intended to be displayed in, which requires the implementation of a backend that cannot be tampered with on the client-side to serve such requests. Due to the sensitive nature of handwritten font files, an immutable and predictable backend was needed to be developed, one that users would know wouldn't unexpectedly change its behavior or policies after the user data had already been collected, all of which would be violated by creating a server. Thus, smart contracts on blockchain were the solution to the problem, due to their immutable nature and the availability of their bytecode permanently on the blockchain, visible to all individuals.

What remained was a tool to be developed to provide the users with a web-based interface to interact with the rest of the system components. This would include handling the uploading of font files, sending messages, and viewing messages in handwritten fonts. A browser extension was thus seen as the solution to this problem, allowing the displaying of handwritten messages to be done on any website, utilizing the scripting privileges of browser extensions.

Thus, the design goals were to implement a security-first system with font generation on the user's local machine, store the font files on a decentralized file system, utilize smart contracts on the blockchain as an immutable, verifiable backend, and develop a browser extension acting as an interface to allow users to upload font files, send and read messages in handwritten fonts.

### Features

The developed system offered four main features: generating font files in users' handwriting, uploading generated font files, sending messages to a particular recipient in one of the user's uploaded handwritten fonts, and viewing received messages in the intended handwritten font file.

Other features include a contacts feature to allow users to easily message frequent contacts, and an export data and recover data feature to allow users to export their font files and data related to the extension to later recover their accounts if necessary.

### Implementation

A standalone desktop application was developed to handle font file generation locally on the user's machine. The user is prompted to print out a template laid out with spaces for the twenty-six lowercase letters of the English alphabet. Then the user proceeds to fill out the space for each letter with his handwritten version of the letter, before proceeding on to scan the template and upload it into the application. Then the user begins cropping a part of the image corresponding to each of the twenty-six letters, and then he clicks submit, and the application proceeds to generate a TrueType font file (TTF file) in the user's handwriting.

The desktop application's views were created with HTML, CSS, and JavaScript, and the font generation was handled by a Java application using the Fontastic library. Electron was utilized to combine the aforementioned web-based frontend technologies (HTML, CSS, and JavaScript) and the font generation logic (contained in the Java application), by allowing the JavaScript code running on the desktop application's frontend to spawn the Java application as a child process on the Operating System and pass the necessary data to it as command-line arguments.

For font file storage, the Interplanetary File System (IPFS) protocol and network was used as a decentralized, peer-to-peer file storage system. A service called "NFT.Storage" was used to connect to a node on the IPFS network. It provides a "pinning" service by running multiple dedicated nodes on the IPFS network and effectively pinning the uploaded content by creating multiple copies of it on the network.

A smart contract on the Ethereum blockchain network was created to serve as the needed backend for the system. It was written using the Solidity language and deployed on the Sepolia test network. Its details will be further discussed along with the explanations to follow.

A Chrome extension was created to act as the interface for the user to interact with the main system functionalities. It was created using the React framework. Its functionality depends on the user having the MetaMask extension installed to have an Ethereum wallet and method of interaction with the Ethereum network, and the Handwritten Fonts extension uses this MetaMask provider to connect to the Ethereum network and make calls to the deployed smart contract. The developed extension uses the "Web3.js" JavaScript library as a portal into the Ethereum network, using the MetaMask provider.

The user is first prompted in the extension to select a MetaMask account to use as his Handwritten Fonts account. The extension prompts the user, through the MetaMask popup, to select an account or more to connect to the Handwritten Fonts extension. The extension will then be able to detect the accounts that the user connected, and the user can create a Handwritten Fonts account with any of them. In essence, MetaMask accounts were used along with their account addresses as unique identifiers for accounts in the developed extension.

Once the user selects a MetaMask account to use as his Handwritten Fonts account, they are prompted to create a password, and a call to the smart contract is made to update a mapping of account addresses to account creation status. We use this mapping to later check if the user should be signing in or creating a new password for a given account address. This call, and other calls to the Ethereum network, require the use of the MetaMask provider as it will incur any gas fees on the user.

Upon creation of the password, a public and private RSA key pair is generated by the extension using a JavaScript library entitled "JSEncrypt", where the public key gets stored on the Ethereum network in a mapping of account addresses to public keys, and the private key gets encrypted by the created password and stored on the extension's local storage on the user's device.

The user is then able to upload generated font files. The upload process works by first generating a symmetric key using a JavaScript library entitled "CryptoJS", and encrypting the font file with this symmetric key. The extension then proceeds to upload the encrypted font file to the IPFS network through the API Gateway of the "NFT.Storage" service. The symmetric key is then encrypted along with the returned content identifier (CID) of the stored file on the IPFS network and the file name, and then they are all stored in the local storage of the extension.

After uploading at least one font file, the user can send messages to certain individuals who have also installed and linked an account on the developed extension, by referencing their MetaMask account address.

A contacts feature was developed to improve user experience and limit the chance of error in entering the account addresses of recipients. The user can create a contact with an account address and an easily recognizable name. The user can then select a recipient contact, type out the desired message to send, and select the font in which the message should be displayed.

The needed font file CID, filename, and symmetric key are then fetched from the user's local storage and decrypted with his password. Then, a call to the Ethereum network is made to retrieve the public key of the recipient and encrypt the aforementioned decrypted data. This data will then only be decrypted using the recipient's private key.

A mapping of message hash to encrypted font data was then utilized on the smart contract for this data retrieval by the recipient. A Universally Unique Identifier (UUID) is generated and concatenated with the message then hashed to form a unique hash using the SHA-3 algorithm through the "CryptoJS" JavaScript library. The UUID is necessary to be used in combination with the message to ensure a unique hash that only identifies this message is guaranteed.

Thus, this message hash is stored in the mapping to the data encrypted with the recipient's public key. Finally, the sender is given the message, presented in a specific format that includes the message, a special tag, and the UUID. The sender can then proceed to copy this message from the extension and send it over any web application with messaging services to the recipient.

The recipient can then load up any webpage that displays the message sent by the sender in the specified format, and it will be detected automatically by the developed extension in the background. The recipient is then prompted with the detected messages and whether they would like to view them in the handwritten font.

In such case, the recipient's private key is decrypted using his password, then the message gets combined with the UUID sent as part of the message to produce the same message hash to fetch the encrypted font data related to this message from the smart contract. The fetched font file CID, filename, and symmetric key are then decrypted using the recipient's private key, and the font file is fetched from the IPFS network using the CID and filename via the "NFT.Storage" API Gateway. Finally, the fetched font file is then decrypted using the symmetric key, and the font gets applied to the message.

![Architectural Overview](./docs/Diagrams/architectural-overview.svg)

## Getting Started

Move into the desktop application's backend directory.

```bash
cd "Desktop App/backend"
```

Add dependencies to the local Maven Repository. (These dependencies aren't present on the Maven Central Repository so they were downloaded manually, added to the lib folder of the project, then they must be added to the local Maven Repository)

```bash
mvn install:install-file -Dfile='lib/doubletype.jar' -DgroupId='com.example' -DartifactId='doubletype' -Dversion='1.0' -Dpackaging=jar
mvn install:install-file -Dfile='lib/geomerative.jar' -DgroupId='com.example' -DartifactId='geomerative' -Dversion='1.0' -Dpackaging=jar
mvn install:install-file -Dfile='lib/sfntly.jar' -DgroupId='com.example' -DartifactId='sfntly' -Dversion='1.0' -Dpackaging=jar
mvn install:install-file -Dfile='lib/sfnttool.jar' -DgroupId='com.example' -DartifactId='sfnttool' -Dversion='1.0' -Dpackaging=jar
mvn install:install-file -Dfile='lib/catalina.jar' -DgroupId='org.apache.tomcat' -DartifactId='tomcat-catalina' -Dversion='1.0' -Dpackaging=jar
```

Build the Java App into one JAR file including all dependencies

```bash
mvn clean install
```

Start the Electron App

```bash
npm start
```

## Tech Stack

**Desktop App:**

- Electron
- HTML
- CSS
- JavaScript
- Cropper.js
- Bootstrap

**Browser Extension:**

- Vite
- React
- TypeScript
- Tailwind
- DaisyUI
- Web3.js

## Tests

## Author

## Credits

## References
