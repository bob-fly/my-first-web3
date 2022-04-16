import React, { useEffect, useState } from 'react';
import './App.css';
import { ethers } from 'ethers';
import abi from './utils/WavePortal.json';

const App = () => {
	const [currentAccount, setCurrentAccount] = useState('');
	const [contractBalance, setContractBalance] = useState('');
	const contractAddress = '0xB3824fF7c895E8BFD5EAca0260aA183627860869';
	const [allWaves, setAllWaves] = useState([]);
	/**
	 * Create a variable here that references the abi content!
	 */
	const contractABI = abi.abi;

	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log('Make sure you have metamask!');
				return;
			} else {
				console.log('We have the ethereum object', ethereum);
			}

			const accounts = await ethereum.request({ method: 'eth_accounts' });

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log('Found an authorized account:', account);
				setCurrentAccount(account[0]);
			} else {
				console.log('No authorized account found');
			}
			getAllWaves();
      getContractBalance();
		} catch (error) {
			console.log(error);
		}
	};

	/**
	 * Implement your connectWallet method here
	 */
	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert('Get MetaMask!');
				return;
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts'
			});

			console.log('Connected', accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	};

	const wave = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				let count = await wavePortalContract.getTotalWaves();
				console.log('Retrieved total wave count...', count.toNumber());

				/*
        * Execute the actual wave from your smart contract
        */
				const waveTxn = await wavePortalContract.wave('This is wave #1',{gasLimit: 300000});
				console.log('Mining...', waveTxn.hash);

				let receipt = await waveTxn.wait();
				console.log('Mined -- ', waveTxn.hash);
        console.log('wave result:',waveTxn);
        let event = receipt.events.find(event => event.event === "NewWave");
    if (event != null) {
        const [from, timestamp, message, success] = event.args;
        console.log("success:%s", success);
    }
        // let filter = {
        //   address: contractAddress,
        //   topics: [
        //     ethers.utils.id("NewWave(address,uint256,string,bool)")
        // ]}
        // provider.on(filter, (log,event) => {
        //       console.log("log:", log);
        //       console.log("event:",event);
        // });
    //     let event = receipt.events.find(event => event.event === "NewWave");
    // if (event != null) {
    //     const [from, timestamp, message, success] = event.args;
    //     console.log("event----->> from:%s, timestamp:%s, message:%s, success:%s", from, timestamp, message, success);
    // }
        // wavePortalContract.on("NewWave", (from, timestamp, message, success) => {
        //     console.log(from, timestamp, message, success);
        // });
        /**ethers.on({
            address: contractAddress,
            topics: [
                ethers.utils.id("NewWave(address,uint256,string,bool)")
            ]
        }, (from, timestamp, message, success) => {
            console.log(from, timestamp, message, success);
        });**/
				count = await wavePortalContract.getTotalWaves();
				console.log('Retrieved total wave count...', count.toNumber());
			}
		} catch (error) {
			console.log(error);
		}
	};

	/*
   * Create a method that gets all waves from your contract
   */
	const getContractBalance = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				let balance = await provider.getBalance(contractAddress);
       setContractBalance(ethers.utils.formatEther(balance)); console.log("contractBalance:",ethers.utils.formatEther(balance));
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};
	const getAllWaves = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				/*
         * Call the getAllWaves method from your Smart Contract
         */
				const waves = await wavePortalContract.getAllWaves();

				/*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
				let wavesCleaned = [];
				waves.forEach(wave => {
					wavesCleaned.push({
						address: wave.waver,
						timestamp: new Date(wave.timestamp * 1000),
						message: wave.message
					});
				});

				/*
         * Store our data in React State
         */
				setAllWaves(wavesCleaned);
			} else {
				console.log("Ethereum object doesn't exist!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	// useEffect(() => {
	// 	checkIfWalletIsConnected();
	// }, []);

  useEffect(() => {
    checkIfWalletIsConnected();
  let wavePortalContract;

  const onNewWave = (from, timestamp, message, success) => {
    console.log("NewWave", from, timestamp, message, success);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };
}, []);

	return (
		<div className="mainContainer">
			<div className="dataContainer">
				<div className="header">👋 Hey there!</div>

				<div className="bio">
					I am farza and I worked on self-driving cars so that's pretty cool
					right? Connect your Ethereum wallet and wave at me!
				</div>

				<button className="waveButton" onClick={wave}>
					Wave at Me
				</button>

				{/*
        * If there is no currentAccount render this button
        */}
				{!currentAccount && (
					<button className="waveButton" onClick={connectWallet}>
						Connect Wallet
					</button>
				)}
        {currentAccount && (
					<div className="bio">currentAccount:{currentAccount}
          </div>
				)}
					<div className="bio">contractBalance:{contractBalance}
          </div>
				{allWaves.map((wave, index) => {
					return (
						<div
							key={index}
							style={{
								backgroundColor: 'OldLace',
								marginTop: '16px',
								padding: '8px'
							}}
						>
							<div>Address: {wave.address}</div>
							<div>Time: {wave.timestamp.toString()}</div>
							<div>Message: {wave.message}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default App;
