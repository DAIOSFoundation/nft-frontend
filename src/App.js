import logo from './logo.svg';
import './App.css';
import contract from './contracts/ExampleNFT.json';
import {useEffect, useState} from "react";
import axios from 'axios';

const { ethers } = require("ethers");

const NODE_URL = 'wss://ws-mumbai.matic.today';
const PROVIDER = new ethers.providers.WebSocketProvider(NODE_URL);
const CONTRACT_ADDRESS = "0x5f42c1540390da3b2d07baf07fd4c8bde758f676"
const ABI = contract.abi;
const META_DATA_URL = "http://34.64.202.172:8081/metaNFTs"

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

        let metaDataURL = await nftContract.tokenURI(tokenId)
        console.log("metaDataURL : [" + metaDataURL + "]");

        axios.defaults.withCredentials = true;

        let metaData = await axios.get(metaDataURL,{
          withCredentials: true // 쿠키 cors 통신 설정
        }).then(response => {
          console.log(response);
        });

        let meta = metaData.data;
        console.log("metaData : [" + metaData.data + "]");
        console.log("imageURL : [" + meta.imageURL + "]");

        setMintedNFT(meta.imageURL);

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
        let value = event.args[2];
        let tokenId = value.toNumber();

        getMintedNFT(tokenId);

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
        <h1>Polygon 한국 개발자 커뮤니티 워크숍 NFT 예제</h1>
        <div>
          {currentAccount ? mintNftButton() : connectWalletButton()}
        </div>
        <div className={(mintedNFT) ? 'display' : 'hidden'}>
          <img
              src={mintedNFT}
              alt=''
              className='h-60 w-60 rounded-lg shadow-2xl shadow-[#6FFFE9] hover:scale-105 transition duration-500 ease-in-out'
          />
        </div>
      </div>
  )
}

export default App;
