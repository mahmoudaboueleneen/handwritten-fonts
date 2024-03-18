// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

/**
 * @title HandwrittenFonts
 * @dev A contract for the Handwritten Fonts project
 * @author Mahmoud Abou Eleneen
 */
contract HandwrittenFonts {
    struct EncryptedData {
        bytes32 encryptedSymmetricKey;
        bytes32 encryptedCid;
    }

    // Mapping from message hash to encrypted symmetric key
    mapping(bytes32 => EncryptedData) private messageHashToEncryptedData;

    // Mapping from account address to password creation status
    mapping(address => bool) private passwordCreated;

    // Mapping of address to their Handwritten Fonts public key
    mapping(address => bytes32) public addressToPublicKey;

    /**
     * @dev Store the encrypted symmetric key used to encrypt the font file
     * @param _messageHash the hash of the message
     * @param _encryptedSymmetricKey the encrypted symmetric key
     * @param _encryptedCid the encrypted IPFS CID of the font file this message should be displayed in
     */
    function storeEncryptedData(
        bytes32 _messageHash,
        bytes32 _encryptedSymmetricKey,
        bytes32 _encryptedCid
    ) public {
        messageHashToEncryptedData[_messageHash] = EncryptedData(
            _encryptedSymmetricKey,
            _encryptedCid
        );
    }

    /**
     * @dev Get the encrypted data mapped to a message hash
     * @param _messageHash the hash of the message
     */
    function getEncryptedData(
        bytes32 _messageHash
    ) public view returns (EncryptedData memory) {
        return messageHashToEncryptedData[_messageHash];
    }

    /**
     * @dev Update the password creation status for an account
     * @param _account the account to update the password status for
     * @param _status the new status of the account's password
     */
    function updatePasswordStatus(address _account, bool _status) public {
        passwordCreated[_account] = _status;
    }

    /**
     * @dev Check the password creation status for an account
     * @param _account the account to check the status for
     */
    function checkPasswordStatus(address _account) public view returns (bool) {
        return passwordCreated[_account];
    }

    /**
     * @dev Store the public key for an account
     * @param _address the account address to store the key for
     * @param _publicKey the public key to be stored
     */
    function storePublicKey(address _address, bytes32 _publicKey) public {
        addressToPublicKey[_address] = _publicKey;
    }
}
