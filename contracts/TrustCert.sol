// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract TrustCert {
    struct Certificate {
        bytes32 dataHash;
        address issuer;
        uint256 timestamp;
        bool isRevoked;
        string revocationReason;
    }

    struct Institution {
        string name;
        bool isActive;
    }

    address public owner;
    mapping(bytes32 => Certificate) public certificates;
    mapping(address => Institution) public institutions;
    mapping(address => bool) public admins;

    event CertificateIssued(bytes32 indexed certId, bytes32 dataHash, address indexed issuer);
    event CertificateRevoked(bytes32 indexed certId, string reason, uint256 timestamp);
    event InstitutionAdded(address indexed institutionAddress, string name);
    event AdminAdded(address indexed adminAddress);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyInstitution() {
        require(institutions[msg.sender].isActive, "Only active institutions can perform this action");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner, "Only admins can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
    }

    function addInstitution(address _institution, string memory _name) public onlyAdmin {
        institutions[_institution] = Institution(_name, true);
        emit InstitutionAdded(_institution, _name);
    }

    function removeInstitution(address _institution) public onlyAdmin {
        institutions[_institution].isActive = false;
    }

    function addAdmin(address _admin) public onlyOwner {
        admins[_admin] = true;
        emit AdminAdded(_admin);
    }

    function issueCertificate(bytes32 _certId, bytes32 _dataHash) public onlyInstitution {
        require(certificates[_certId].issuer == address(0), "Certificate already issued");
        
        certificates[_certId] = Certificate({
            dataHash: _dataHash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            isRevoked: false,
            revocationReason: ""
        });

        emit CertificateIssued(_certId, _dataHash, msg.sender);
    }

    function bulkIssueCertificates(bytes32[] memory _certIds, bytes32[] memory _dataHashes) public onlyInstitution {
        require(_certIds.length == _dataHashes.length, "Arrays length mismatch");
        require(_certIds.length > 0, "Empty arrays");

        for (uint256 i = 0; i < _certIds.length; i++) {
            issueCertificate(_certIds[i], _dataHashes[i]);
        }
    }

    function revokeCertificate(bytes32 _certId, string memory _reason) public onlyInstitution {
        require(certificates[_certId].issuer == msg.sender, "Only issuer can revoke");
        require(!certificates[_certId].isRevoked, "Already revoked");

        certificates[_certId].isRevoked = true;
        certificates[_certId].revocationReason = _reason;

        emit CertificateRevoked(_certId, _reason, block.timestamp);
    }

    function verifyCertificate(bytes32 _certId) public view returns (
        bytes32 dataHash,
        address issuer,
        string memory institutionName,
        uint256 timestamp,
        bool isRevoked,
        string memory revocationReason
    ) {
        Certificate memory cert = certificates[_certId];
        require(cert.issuer != address(0), "Certificate not found");

        return (
            cert.dataHash,
            cert.issuer,
            institutions[cert.issuer].name,
            cert.timestamp,
            cert.isRevoked,
            cert.revocationReason
        );
    }
}