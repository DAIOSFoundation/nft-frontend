import logo from './logo.svg';
import './App.css';
import contract from './contracts/ExampleNFT.json';
import {useEffect, useState} from "react";

const { ethers } = require("ethers");

const PK = "2cda07fd36def97a9edf2b3fbd831a414c5f68a31654a34782fccf782a1d8e4c"
const NODE_URL = "/";
const PROVIDER = new ethers.providers.JsonRpcProvider(NODE_URL);
const CONTRACT_ADDRESS = "0x8cb4aDe99039868144d9F610c2781e80d7a55ccd"
const ABI = contract.abi;
const META_DATA_URL = "http://localhost:8081/metaNFTs/"

function App() {

  const [currentAccount, setCurrentAccount] = useState(null);

  const checkWalletIsConnected = async () => {
    const {ethereum} = window;
    if (!ethereum) {
      console.log(("메타마스크가 설치되어 있는지 확인하세요."));
      return;
    } else {
      console.log("지갑이 확인되었습니다.")
    }

    const accounts = await ethereum.request({method: 'eth_accounts'});
    if (accounts.left !== 0) {
      const account = accounts[0];
      console.log("인증된 계좌 : ", account);
      setCurrentAccount(account);
    } else {
      console.log("인증된 계좌가 없습니다.");
    }
  }

  const connectWalletHandler = async () => {
    const {ethereum} = window;
    if (!ethereum) {
      alert("메타마스크를 설치하세요.")
    }

    try {
      const accounts = await ethereum.request({method: 'eth_requestAccounts'});
      console.log("계좌주소 : ", accounts[0])
    } catch (err) {
      console.log(err)
    }
  }

  const mintNftHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const wallet = new ethers.Wallet(PK, PROVIDER);
        const signer = wallet.provider.getSigner(wallet.address);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        let nftTxn = await contract.mintNFT(CONTRACT_ADDRESS, META_DATA_URL);

        console.log("민팅중이니 기다리세요...");
        await nftTxn.wait();

        console.log(`성공!, 트랜젝션을 확인하세요 : https://mumbai.polygonscan.com//tx/${nftTxn.hash}`);

      } else {
        console.log("트랜젝션이 확인되지 않습니다.");
      }

    } catch (err) {
      console.log(err);
    }
  }

  const connectWalletButton = () => {
    return (
        <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
          Connect Wallet
        </button>
    )
  }

  const mintNftButton = () => {
    return (
        <button onClick={mintNftHandler} className='cta-button mint-nft-button'>
          Mint NFT
        </button>
    )
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  return (
      <div className='main-app'>
        <h1>Scrappy Squirrels Tutorial</h1>
        <div>
          {currentAccount ? mintNftButton() : connectWalletButton()}
        </div>
      </div>
  )
}

export default App;
