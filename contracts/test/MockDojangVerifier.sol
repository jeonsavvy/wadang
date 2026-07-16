// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {DojangAttesterId, IDojangVerifier} from "../WadangCampaigns.sol";

/// @dev Local tests only. Never use this verifier for a public deployment.
contract MockDojangVerifier is IDojangVerifier {
    mapping(address account => mapping(bytes32 attesterId => bool verified)) private verification;
    bool public shouldRevert;

    error VerifierFailure();

    function setVerified(address account, bytes32 configuredAttesterId, bool value) external {
        verification[account][configuredAttesterId] = value;
    }

    function setShouldRevert(bool value) external {
        shouldRevert = value;
    }

    function isVerified(address account, DojangAttesterId configuredAttesterId) external view returns (bool) {
        if (shouldRevert) revert VerifierFailure();
        return verification[account][DojangAttesterId.unwrap(configuredAttesterId)];
    }
}
