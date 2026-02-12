//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GuardianForgeAgent
 * @dev AI-powered wallet guardian system with anomaly detection and social recovery
 */
contract GuardianForgeAgent {
    
    // Events
    event GuardiansSet(address[] guardians, uint256 requiredApprovals);
    event AlertTriggered(address indexed wallet, uint256 timestamp, bool isManual);
    event AnomalyReported(address indexed wallet, uint256 anomalyType, uint256 riskScore, uint256 timestamp);
    event RecoveryApproved(address indexed guardian, address indexed wallet);
    event RecoveryExecuted(address indexed wallet, address indexed newOwner, uint256 timestamp);
    event WalletFrozen(address indexed wallet, uint256 timestamp);
    event WalletUnfrozen(address indexed wallet, uint256 timestamp);
    
    // Enums
    enum AnomalyType {
        NONE,
        LARGE_TRANSACTION,
        FAILED_SIGNATURE,
        SUSPICIOUS_CONTRACT,
        RAPID_TRANSACTIONS,
        HIGH_RISK_INTERACTION
    }
    
    enum RecoveryStatus {
        NONE,
        ALERT_TRIGGERED,
        GUARDIANS_RESPONDING,
        APPROVED,
        EXECUTED
    }
    
    // Structs
    struct Guardian {
        address addr;
        bool isActive;
    }
    
    struct RecoveryRequest {
        uint256 triggeredAt;
        uint256 fastTrackDelay; // Fast-track: 24 hours instead of 7 days
        bool isManualAlert;
        AnomalyType anomalyType;
        uint256 riskScore; // 0-100
        RecoveryStatus status;
        mapping(address => bool) approvals;
        uint256 approvalCount;
        address proposedNewOwner;
    }
    
    struct WalletStatus {
        bool isFrozen;
        uint256 frozenAt;
        uint256 lastAnomalyCheck;
        uint256 highestRiskScore;
    }
    
    // State variables
    mapping(address => Guardian[]) public walletGuardians;
    mapping(address => uint256) public requiredApprovals;
    mapping(address => RecoveryRequest) public recoveryRequests;
    mapping(address => WalletStatus) public walletStatuses;
    mapping(address => bool) public authorizedAgents; // AI agents authorized to report
    
    address public owner;
    uint256 public constant FAST_TRACK_DELAY = 24 hours;
    uint256 public constant STANDARD_DELAY = 7 days;
    uint256 public constant HIGH_RISK_THRESHOLD = 70; // Auto-freeze at 70+ risk
    
    modifier onlyWalletOwner(address wallet) {
        require(msg.sender == wallet, "Not wallet owner");
        _;
    }
    
    modifier onlyGuardian(address wallet) {
        require(isGuardian(wallet, msg.sender), "Not a guardian");
        _;
    }
    
    modifier onlyAuthorizedAgent() {
        require(authorizedAgents[msg.sender] || msg.sender == owner, "Not authorized agent");
        _;
    }
    
    modifier notFrozen(address wallet) {
        require(!walletStatuses[wallet].isFrozen, "Wallet is frozen");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedAgents[msg.sender] = true; // Owner is default agent
    }
    
    // ============ GUARDIAN MANAGEMENT ============
    
    /**
     * @dev Set guardians for the caller's wallet
     * @param guardians Array of guardian addresses
     * @param required Number of approvals required for recovery
     */
    function setGuardians(address[] calldata guardians, uint256 required) external {
        require(guardians.length >= required && required > 0, "Invalid guardian config");
        require(guardians.length <= 10, "Too many guardians");
        
        // Clear existing guardians
        delete walletGuardians[msg.sender];
        
        // Add new guardians
        for (uint256 i = 0; i < guardians.length; i++) {
            require(guardians[i] != address(0), "Invalid guardian address");
            require(guardians[i] != msg.sender, "Cannot be your own guardian");
            walletGuardians[msg.sender].push(Guardian({
                addr: guardians[i],
                isActive: true
            }));
        }
        
        requiredApprovals[msg.sender] = required;
        emit GuardiansSet(guardians, required);
    }
    
    function isGuardian(address wallet, address potential) public view returns (bool) {
        Guardian[] memory guardians = walletGuardians[wallet];
        for (uint256 i = 0; i < guardians.length; i++) {
            if (guardians[i].addr == potential && guardians[i].isActive) {
                return true;
            }
        }
        return false;
    }
    
    function getGuardians(address wallet) external view returns (address[] memory) {
        Guardian[] memory guardians = walletGuardians[wallet];
        address[] memory addresses = new address[](guardians.length);
        for (uint256 i = 0; i < guardians.length; i++) {
            addresses[i] = guardians[i].addr;
        }
        return addresses;
    }
    
    // ============ ALERT & ANOMALY SYSTEM ============
    
    /**
     * @dev Manual SOS alert triggered by wallet owner
     */
    function alertGuardians() external {
        require(walletGuardians[msg.sender].length > 0, "No guardians set");
        require(recoveryRequests[msg.sender].status == RecoveryStatus.NONE, "Recovery already in progress");
        
        RecoveryRequest storage request = recoveryRequests[msg.sender];
        request.triggeredAt = block.timestamp;
        request.fastTrackDelay = FAST_TRACK_DELAY;
        request.isManualAlert = true;
        request.status = RecoveryStatus.ALERT_TRIGGERED;
        request.riskScore = 100; // Manual alert = highest priority
        
        emit AlertTriggered(msg.sender, block.timestamp, true);
    }
    
    /**
     * @dev Agent reports anomaly detected in wallet activity
     * @param wallet Wallet address being monitored
     * @param anomalyType Type of anomaly detected
     * @param riskScore AI-calculated risk score (0-100)
     */
    function reportAnomaly(
        address wallet,
        uint256 anomalyType,
        uint256 riskScore
    ) external onlyAuthorizedAgent {
        require(riskScore <= 100, "Invalid risk score");
        require(walletGuardians[wallet].length > 0, "No guardians set for wallet");
        
        WalletStatus storage status = walletStatuses[wallet];
        status.lastAnomalyCheck = block.timestamp;
        
        // Update highest risk score
        if (riskScore > status.highestRiskScore) {
            status.highestRiskScore = riskScore;
        }
        
        emit AnomalyReported(wallet, anomalyType, riskScore, block.timestamp);
        
        // Auto-freeze on high risk
        if (riskScore >= HIGH_RISK_THRESHOLD && !status.isFrozen) {
            status.isFrozen = true;
            status.frozenAt = block.timestamp;
            emit WalletFrozen(wallet, block.timestamp);
        }
        
        // Auto-trigger recovery for critical threats
        if (riskScore >= HIGH_RISK_THRESHOLD && recoveryRequests[wallet].status == RecoveryStatus.NONE) {
            RecoveryRequest storage request = recoveryRequests[wallet];
            request.triggeredAt = block.timestamp;
            request.fastTrackDelay = FAST_TRACK_DELAY;
            request.isManualAlert = false;
            request.anomalyType = AnomalyType(anomalyType);
            request.riskScore = riskScore;
            request.status = RecoveryStatus.ALERT_TRIGGERED;
            
            emit AlertTriggered(wallet, block.timestamp, false);
        }
    }
    
    // ============ RECOVERY SYSTEM ============
    
    /**
     * @dev Guardian approves recovery for a wallet
     * @param wallet Wallet to recover
     * @param newOwner Proposed new owner address
     */
    function approveRecovery(address wallet, address newOwner) external onlyGuardian(wallet) {
        RecoveryRequest storage request = recoveryRequests[wallet];
        require(request.status == RecoveryStatus.ALERT_TRIGGERED || 
                request.status == RecoveryStatus.GUARDIANS_RESPONDING, 
                "No active recovery");
        require(!request.approvals[msg.sender], "Already approved");
        require(newOwner != address(0), "Invalid new owner");
        
        // Set or validate proposed new owner
        if (request.proposedNewOwner == address(0)) {
            request.proposedNewOwner = newOwner;
        } else {
            require(request.proposedNewOwner == newOwner, "New owner mismatch");
        }
        
        request.approvals[msg.sender] = true;
        request.approvalCount++;
        request.status = RecoveryStatus.GUARDIANS_RESPONDING;
        
        emit RecoveryApproved(msg.sender, wallet);
        
        // Check if enough approvals
        if (request.approvalCount >= requiredApprovals[wallet]) {
            request.status = RecoveryStatus.APPROVED;
        }
    }
    
    /**
     * @dev Execute recovery after delay and sufficient approvals
     * @param wallet Wallet to execute recovery for
     */
    function executeRecovery(address wallet) external {
        RecoveryRequest storage request = recoveryRequests[wallet];
        require(request.status == RecoveryStatus.APPROVED, "Not approved");
        require(block.timestamp >= request.triggeredAt + request.fastTrackDelay, "Delay not passed");
        require(request.proposedNewOwner != address(0), "No new owner set");
        
        request.status = RecoveryStatus.EXECUTED;
        
        // Unfreeze wallet
        if (walletStatuses[wallet].isFrozen) {
            walletStatuses[wallet].isFrozen = false;
            emit WalletUnfrozen(wallet, block.timestamp);
        }
        
        emit RecoveryExecuted(wallet, request.proposedNewOwner, block.timestamp);
        
        // In production, this would transfer ownership/assets to proposedNewOwner
        // For demo: just emit event - actual ownership transfer depends on wallet type
    }
    
    /**
     * @dev Cancel recovery (only wallet owner or guardians can cancel)
     */
    function cancelRecovery(address wallet) external {
        require(msg.sender == wallet || isGuardian(wallet, msg.sender), "Not authorized");
        
        RecoveryRequest storage request = recoveryRequests[wallet];
        require(request.status != RecoveryStatus.NONE, "No active recovery");
        
        delete recoveryRequests[wallet];
        
        // Unfreeze if frozen
        if (walletStatuses[wallet].isFrozen) {
            walletStatuses[wallet].isFrozen = false;
            emit WalletUnfrozen(wallet, block.timestamp);
        }
    }
    
    // ============ AGENT MANAGEMENT ============
    
    function authorizeAgent(address agent) external {
        require(msg.sender == owner, "Only owner");
        authorizedAgents[agent] = true;
    }
    
    function revokeAgent(address agent) external {
        require(msg.sender == owner, "Only owner");
        authorizedAgents[agent] = false;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    function getWalletStatus(address wallet) external view returns (
        bool isFrozen,
        uint256 frozenAt,
        uint256 lastCheck,
        uint256 highestRisk,
        RecoveryStatus recoveryStatus,
        uint256 approvalCount,
        uint256 requiredCount
    ) {
        WalletStatus memory status = walletStatuses[wallet];
        RecoveryRequest storage request = recoveryRequests[wallet];
        
        return (
            status.isFrozen,
            status.frozenAt,
            status.lastAnomalyCheck,
            status.highestRiskScore,
            request.status,
            request.approvalCount,
            requiredApprovals[wallet]
        );
    }
    
    function getRecoveryDetails(address wallet) external view returns (
        uint256 triggeredAt,
        uint256 delay,
        bool isManual,
        uint256 riskScore,
        address proposedOwner,
        uint256 timeRemaining
    ) {
        RecoveryRequest storage request = recoveryRequests[wallet];
        uint256 remaining = 0;
        
        if (request.triggeredAt > 0 && block.timestamp < request.triggeredAt + request.fastTrackDelay) {
            remaining = (request.triggeredAt + request.fastTrackDelay) - block.timestamp;
        }
        
        return (
            request.triggeredAt,
            request.fastTrackDelay,
            request.isManualAlert,
            request.riskScore,
            request.proposedNewOwner,
            remaining
        );
    }
}
