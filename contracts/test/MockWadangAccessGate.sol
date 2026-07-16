// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IWadangEligibility {
    function isEligible(uint256 campaignId, address account) external view returns (bool);
}

/// @dev Test-only consumer that demonstrates how another app can reuse WADANG eligibility.
contract MockWadangAccessGate {
    IWadangEligibility public immutable wadang;
    uint256 public immutable campaignId;

    error AccessDenied();

    constructor(address wadangAddress, uint256 configuredCampaignId) {
        wadang = IWadangEligibility(wadangAddress);
        campaignId = configuredCampaignId;
    }

    function gatedAction() external view returns (bytes4) {
        if (!wadang.isEligible(campaignId, msg.sender)) revert AccessDenied();
        return this.gatedAction.selector;
    }
}
