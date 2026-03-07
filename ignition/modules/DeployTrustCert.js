const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TrustCertModule", (m) => {
    const trustCert = m.contract("TrustCert", []);

    return { trustCert };
});
