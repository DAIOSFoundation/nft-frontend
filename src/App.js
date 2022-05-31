import logo from './logo.svg';
import twitterLogo from './assets/twitter-logo.svg';
import nxdfLogo from './assets/NXDF-logo.png'
import './App.css';
import contract from './contracts/ExampleNFT.json';
import React, {useEffect, useState} from "react";
import axios from 'axios';

const { ethers } = require("ethers");

const NODE_URL = 'wss://ws-mumbai.matic.today';
const PROVIDER = new ethers.providers.WebSocketProvider(NODE_URL);
const CONTRACT_ADDRESS = "0x5f42c1540390da3b2d07baf07fd4c8bde758f676"
const ABI = contract.abi;
const META_DATA_URL = "http://34.64.202.172:8081/metaNFTs";
const IMG_URL = "http://34.64.202.172:8081/00.png";

const TWITTER_HANDLE = 'nxdf16';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

function App() {

  const [mintedNFT, setMintedNFT] = useState(null);
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
      console.log("계좌주소 : [" + accounts[0] + "]");
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err)
    }
  }

  // 민팅된 토큰의 정보를 가져옴
  const getMintedNFT = async (tokenId) => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const nftContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            ABI,
            signer
        )

        console.log("tokenID : [" + tokenId + "]");
        let openSeaURL = "https://testnets.opensea.io/assets/mumbai/0x5f42c1540390da3b2d07baf07fd4c8bde758f676/"+tokenId
        setMintedNFT(openSeaURL);

      } else {
        console.log("이더리움 계열 블록체인이 확인되지 않습니다.")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const mintNftHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            ABI,
            signer
        )

        let nftTxn = await nftContract.mintNFT('0xA9e018881796Bf2bb2721346807a0e3fb82D99f8', META_DATA_URL);
        console.log('Mining....', nftTxn.hash);

        console.log("민팅중이니 기다리세요...");
        const tx = await nftTxn.wait();

        console.log(`성공!, 트랜젝션을 확인하세요 : https://mumbai.polygonscan.com//tx/${nftTxn.hash}`);

        let event = tx.events[0];

        console.log("event : ["+JSON.stringify(event)+"]")
        getMintedNFT(event.args[2].toString(10));

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
        <a href="https://nxdf.io"><img src={nxdfLogo} width="500" /></a>
          <h1>Polygon 한국 개발자 커뮤니티 워크숍 NFT 예제</h1>
        <br/>
        <div>
          <img src={IMG_URL} width="700" />
        </div>
        <br/>
        <br/>
        <div>
          {currentAccount ? mintNftButton() : connectWalletButton()}
        </div>
        <br/>
        <div className={(mintedNFT) ? 'display' : 'hidden'}>
          <a href={mintedNFT}><h1>{mintedNFT}</h1></a>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
  )
}

export default App;
