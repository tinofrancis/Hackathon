const hre = require("hardhat");

async main() {
    console.log("Deploying TrustCert...");

    const TrustCert = await hre.ethers.getContractFactory("TrustCert");
    const trustCert = await TrustCert.deploy();

    await trustCert.waitForDeployment();

    const address = await trustCert.getAddress();
    console.log("TrustCert deployed to:", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
