// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

type DojangAttesterId is bytes32;

interface IDojangVerifier {
    function isVerified(address account, DojangAttesterId attesterId) external view returns (bool);
}

/// @title WadangCampaigns
/// @notice Records one Dojang-verified wallet entry per campaign without holding funds or tokens.
contract WadangCampaigns {
    uint256 public constant MAX_TITLE_BYTES = 80;
    uint256 public constant MAX_DETAILS_BYTES = 280;
    uint32 public constant MAX_CAPACITY = 10_000;

    struct Campaign {
        address organizer;
        string title;
        string details;
        uint64 startsAt;
        uint64 endsAt;
        uint32 capacity;
        uint32 claimCount;
        bool canceled;
    }

    IDojangVerifier public immutable verifier;
    DojangAttesterId public immutable attesterId;
    uint256 public campaignCount;

    mapping(uint256 campaignId => Campaign campaign) private campaigns;
    mapping(uint256 campaignId => mapping(address account => bool claimed)) public hasClaimed;

    error InvalidVerifier();
    error EmptyTitle();
    error TitleTooLong();
    error DetailsTooLong();
    error InvalidWindow();
    error InvalidCapacity();
    error CampaignNotFound();
    error CampaignCanceled();
    error CampaignNotStarted();
    error CampaignEnded();
    error CampaignFull();
    error AlreadyClaimed();
    error NotVerified();
    error NotOrganizer();

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed organizer,
        string title,
        uint64 startsAt,
        uint64 endsAt,
        uint32 capacity
    );
    event CampaignClaimed(uint256 indexed campaignId, address indexed account);
    event CampaignCanceledByOrganizer(uint256 indexed campaignId, address indexed organizer);

    constructor(address verifierAddress, bytes32 configuredAttesterId) {
        if (verifierAddress == address(0)) revert InvalidVerifier();
        verifier = IDojangVerifier(verifierAddress);
        attesterId = DojangAttesterId.wrap(configuredAttesterId);
    }

    function createCampaign(
        string calldata title,
        string calldata details,
        uint64 startsAt,
        uint64 endsAt,
        uint32 capacity
    ) external returns (uint256 campaignId) {
        uint256 titleLength = bytes(title).length;
        if (titleLength == 0) revert EmptyTitle();
        if (titleLength > MAX_TITLE_BYTES) revert TitleTooLong();
        if (bytes(details).length > MAX_DETAILS_BYTES) revert DetailsTooLong();
        if (endsAt <= block.timestamp || startsAt >= endsAt) revert InvalidWindow();
        if (capacity == 0 || capacity > MAX_CAPACITY) revert InvalidCapacity();

        campaignId = ++campaignCount;
        campaigns[campaignId] = Campaign({
            organizer: msg.sender,
            title: title,
            details: details,
            startsAt: startsAt,
            endsAt: endsAt,
            capacity: capacity,
            claimCount: 0,
            canceled: false
        });

        emit CampaignCreated(campaignId, msg.sender, title, startsAt, endsAt, capacity);
    }

    function claim(uint256 campaignId) external {
        Campaign storage campaign = _campaign(campaignId);
        if (campaign.canceled) revert CampaignCanceled();
        if (block.timestamp < campaign.startsAt) revert CampaignNotStarted();
        if (block.timestamp >= campaign.endsAt) revert CampaignEnded();
        if (campaign.claimCount >= campaign.capacity) revert CampaignFull();
        if (hasClaimed[campaignId][msg.sender]) revert AlreadyClaimed();
        if (!verifier.isVerified(msg.sender, attesterId)) revert NotVerified();

        hasClaimed[campaignId][msg.sender] = true;
        unchecked {
            // capacity is capped at 10,000, so this cannot overflow uint32.
            campaign.claimCount += 1;
        }

        emit CampaignClaimed(campaignId, msg.sender);
    }

    function cancelCampaign(uint256 campaignId) external {
        Campaign storage campaign = _campaign(campaignId);
        if (msg.sender != campaign.organizer) revert NotOrganizer();
        if (campaign.canceled) revert CampaignCanceled();

        campaign.canceled = true;
        emit CampaignCanceledByOrganizer(campaignId, msg.sender);
    }

    function getCampaign(uint256 campaignId) external view returns (Campaign memory) {
        return _campaign(campaignId);
    }

    /// @notice Whether a historical entrant still has current access.
    /// @dev Past entry remains in hasClaimed even after cancellation or verification changes.
    function isEligible(uint256 campaignId, address account) external view returns (bool) {
        Campaign storage campaign = campaigns[campaignId];
        if (campaign.organizer == address(0) || campaign.canceled || !hasClaimed[campaignId][account]) {
            return false;
        }
        return verifier.isVerified(account, attesterId);
    }

    function _campaign(uint256 campaignId) private view returns (Campaign storage campaign) {
        campaign = campaigns[campaignId];
        if (campaign.organizer == address(0)) revert CampaignNotFound();
    }
}
