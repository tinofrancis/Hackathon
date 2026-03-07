import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const BlockchainContext = createContext();

// NOTE: You will need to replace this with your actual contract address after deploying
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";
const POLYGON_AMOY_CHAIN_ID = "0x13882"; // 80002 in hex

// Simplified ABI for the basic read/write functions we need
const CONTRACT_ABI = [
    "function issueCertificate(bytes32 _certId, bytes32 _dataHash) public",
    "function verifyCertificate(bytes32 _certId) public view returns (bytes32 dataHash, address issuer, string memory institutionName, uint256 timestamp, bool isRevoked, string memory revocationReason)"
];

export const BlockchainProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [networkError, setNetworkError] = useState(false);

    async function setupContract() {
        if (window.ethereum) {
            const tempProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(tempProvider);

            const signer = await tempProvider.getSigner();
            const tempContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            setContract(tempContract);
        }
    }

    function handleAccountsChanged(accounts) {
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            setupContract();
        } else {
            setAccount(null);
            setContract(null);
        }
    }

    function handleChainChanged() {
        window.location.reload();
    }

    async function checkNetwork() {
        if (window.ethereum.chainId !== POLYGON_AMOY_CHAIN_ID) {
            setNetworkError(true);
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: POLYGON_AMOY_CHAIN_ID }],
                });
                setNetworkError(false);
            } catch (switchError) {
                console.error("Failed to switch network", switchError);
            }
        } else {
            setNetworkError(false);
        }
    }

    async function checkIfWalletIsConnected() {
        try {
            if (!window.ethereum) return;
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                await checkNetwork();
                setupContract();
            }
        } catch (error) {
            console.error("Error checking wallet connection", error);
        }
    }

    async function connectWallet() {
        try {
            setIsConnecting(true);
            if (!window.ethereum) {
                alert("Please install MetaMask!");
                setIsConnecting(false);
                return;
            }

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            await checkNetwork();
            setAccount(accounts[0]);
            setupContract();
            setIsConnecting(false);
        } catch (error) {
            console.error("Connection failed", error);
            setIsConnecting(false);
        }
    }

    useEffect(() => {
        // Automatically check if wallet is already connected
        checkIfWalletIsConnected();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <BlockchainContext.Provider value={{
            account,
            provider,
            contract,
            connectWallet,
            isConnecting,
            networkError
        }}>
            {children}
        </BlockchainContext.Provider>
    );
};

export const useBlockchain = () => useContext(BlockchainContext);
