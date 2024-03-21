// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

/**
 * @title HandwrittenFonts
 * @dev A contract for the Handwritten Fonts project
 * @author Mahmoud Abou Eleneen
 */
contract HandwrittenFonts {
    struct MessageRelatedData {
        string cidOfEncryptedSymmetricKey;
        string filenameOfEncryptedSymmetricKey;
        string encryptedCidOfEncryptedFontFile;
        string encryptedFilenameOfEncryptedFontFile;
    }

    struct PublicKeyData {
        string publicKeyCid;
        string publicKeyFilename;
    }

    // Mapping from message hash to encrypted data relevant to the message
    mapping(string => MessageRelatedData) public messageHashToEncryptedData;

    // Mapping from account address to password creation status
    mapping(address => bool) private passwordCreated;

    // Mapping of address to their public key data
    mapping(address => PublicKeyData) public addressToPublicKeyData;

    /**
     * @dev Store the encrypted data needed to display a message in a certain font
     * @param _messageHash the hash of the message
     * @param _cidOfEncryptedSymmetricKey the IPFS CID of the encrypted symmetric key
     * @param _filenameOfEncryptedSymmetricKey the name of the symmetric key file
     * @param _encryptedCidOfEncryptedFontFile the encrypted IPFS CID of the font file this message should be displayed in
     * @param _encryptedFilenameOfEncryptedFontFile the name of the font file this message should be displayed in
     */
    function storeEncryptedData(
        string calldata _messageHash,
        string calldata _cidOfEncryptedSymmetricKey,
        string calldata _filenameOfEncryptedSymmetricKey,
        string calldata _encryptedCidOfEncryptedFontFile,
        string calldata _encryptedFilenameOfEncryptedFontFile
    ) external {
        messageHashToEncryptedData[_messageHash] = MessageRelatedData(
            _cidOfEncryptedSymmetricKey,
            _filenameOfEncryptedSymmetricKey,
            _encryptedCidOfEncryptedFontFile,
            _encryptedFilenameOfEncryptedFontFile
        );
    }

    /**
     * @dev Update the password creation status for an account
     * @param _status the new status of the account's password
     */
    function updatePasswordStatus(bool _status) external {
        passwordCreated[msg.sender] = _status;
    }

    /**
     * @dev Check the password creation status of the sender's account address
     */
    function checkPasswordStatus() external view returns (bool) {
        return passwordCreated[msg.sender];
    }

    /**
     * @dev Store the public key data of the sender's account address
     * @param _publicKeyCid the public key to be stored
     * @param _publicKeyFilename the name of the public key file
     */
    function storePublicKeyData(
        string calldata _publicKeyCid,
        string calldata _publicKeyFilename
    ) external {
        addressToPublicKeyData[msg.sender] = PublicKeyData(
            _publicKeyCid,
            _publicKeyFilename
        );
    }
}
