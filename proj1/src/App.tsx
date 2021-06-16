import * as React from 'react';
import styled from 'styled-components';

import Web3Modal from 'web3modal';
// @ts-ignore
import WalletConnectProvider from '@walletconnect/web3-provider';
import Column from './components/Column';
import Wrapper from './components/Wrapper';
import Header from './components/Header';
import Loader from './components/Loader';
import ConnectButton from './components/ConnectButton';

import { Web3Provider } from '@ethersproject/providers';
import { getChainData } from './helpers/utilities';
import {
  US_ELECTION_ADDRESS
} from './constants';
import { getContract } from './helpers/ethers';
// const USElection = require('./constants/abis/USElection.json');
import * as data from './constants/abis/USElection.json';
import { logMsg } from './helpers/dev';
import ResultsSubmitForm from './components/ResultsSubmitForm'
import TransactionDetails from './components/TransactionDetails'

const SLayout = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  text-align: center;
`;

const SContent = styled(Wrapper)`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`;

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`;

const SLanding = styled(Column)`
  height: 600px;
`;

// @ts-ignore
const SBalances = styled(SLanding)`
  height: 100%;
  & h3 {
    padding-top: 30px;
  }
`;

interface IAppState {
  fetching: boolean;
  address: string;
  library: any;
  connected: boolean;
  chainId: number;
  pendingRequest: boolean;
  result: any | null;
  electionContract: any | null;
  info: any | null;
  currentLeader: any | null;
  errorFlag: any | null;
  errorMessage: any | null;
  transactionHash: any | null
}

const INITIAL_STATE: IAppState = {
  fetching: false,
  address: '',
  library: null,
  connected: false,
  chainId: 1,
  pendingRequest: false,
  result: null,
  electionContract: null,
  info: null,
  currentLeader: null,
  errorFlag: null,
  errorMessage: null,
  transactionHash: null
};

class App extends React.Component<any, any> {
  // @ts-ignore
  public web3Modal: Web3Modal;
  public state: IAppState;
  public provider: any;

  constructor(props: any) {
    super(props);
    this.state = {
      ...INITIAL_STATE
    };

    this.web3Modal = new Web3Modal({
      network: this.getNetwork(),
      cacheProvider: true,
      providerOptions: this.getProviderOptions()
    });
  }

  public componentDidMount() {
    if (this.web3Modal.cachedProvider) {
      this.onConnect();
    }
  }

  public onConnect = async () => {
    this.provider = await this.web3Modal.connect();

    const library = new Web3Provider(this.provider);

    const network = await library.getNetwork();

    const address = this.provider.selectedAddress ? this.provider.selectedAddress : this.provider?.accounts[0];

    const electionContract = getContract(US_ELECTION_ADDRESS, data.abi, library, address);

    await this.setState({
      library,
      chainId: network.chainId,
      address,
      connected: true.valueOf,
      electionContract
    });

    await this.subscribeToProviderEvents(this.provider);

  };

  public currentLeader = async () => {
    const { electionContract } = this.state;

    const currentLeader = await electionContract.currentLeader();

    await this.setState({ currentLeader });
  };

  public submitElectionResult = async (formValues: any) => {
    const { electionContract } = this.state;

    // const dataArr = [
    //   'Idahssd22334s2s1sdwe23',
    //   votesForBiden,
    //   50,
    //   24
	  // ];
		
		await this.setState({ fetching: true });

    try {
      const transaction = await electionContract.submitStateResult(formValues);

      this.setState({ transactionHash: transaction.hash });
      
      const transactionReceipt = await transaction.wait();
      if (transactionReceipt.status !== 1) {
        // React to failure
        logMsg('nekaf fail') 

      }
      logMsg('vsi4ko to4no')
      this.setState({ fetching: false });

  } catch (e) {
      // logMsg(e)
      if(e.error) {

        this.setErrorMessage(e.error.message)
      }
      this.setState({ fetching: false });

      // this.setState({
      //   errorFlag: true,
      //   errorMessage: e
      // })
  } finally {
      this.setState({ fetching: false });

  }




};

public setErrorMessage = (message: any) => {
  if(message) {

    this.setState({errorMessage: message, errorFlag: true})
  }
}

public clearErorr = () => {
  this.setState({errorFlag: false, errorMessage: null})
}

  public subscribeToProviderEvents = async (provider:any) => {
    if (!provider.on) {
      return;
    }

    provider.on("accountsChanged", this.changedAccount);
    provider.on("networkChanged", this.networkChanged);
    provider.on("close", this.close);

    await this.web3Modal.off('accountsChanged');
  };

  public async unSubscribe(provider:any) {
    // Workaround for metamask widget > 9.0.3 (provider.off is undefined);
    window.location.reload(false);
    if (!provider.off) {
      return;
    }

    provider.off("accountsChanged", this.changedAccount);
    provider.off("networkChanged", this.networkChanged);
    provider.off("close", this.close);
  }

  public changedAccount = async (accounts: string[]) => {
    if(!accounts.length) {
      // Metamask Lock fire an empty accounts array 
      await this.resetApp();
    } else {
      await this.setState({ address: accounts[0] });
    }
  }

  public networkChanged = async (networkId: number) => {
    const library = new Web3Provider(this.provider);
    const network = await library.getNetwork();
    const chainId = network.chainId;
    await this.setState({ chainId, library });
  }
  
  public close = async () => {
    this.resetApp();
  }

  public getNetwork = () => getChainData(this.state.chainId).network;

  public getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.REACT_APP_INFURA_ID
        }
      }
    };
    return providerOptions;
  };

  public resetApp = async () => {
    await this.web3Modal.clearCachedProvider();
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
    localStorage.removeItem("walletconnect");
    await this.unSubscribe(this.provider);

    this.setState({ ...INITIAL_STATE });

  };


  public render = () => {
    const {
      address,
      connected,
      chainId,
      fetching
    } = this.state;
    return (
      <SLayout>
        <Column maxWidth={1000} spanHeight>
          <Header
            connected={connected}
            address={address}
            chainId={chainId}
            killSession={this.resetApp}
          />
          <SContent>
            {fetching ? (
              <Column center>
                <SContainer>
                  <Loader />
                  <TransactionDetails transactionHash={this.state.transactionHash}/>
                </SContainer>
              </Column>
            ) : (
                <SLanding center>
                  {!this.state.connected && <ConnectButton onClick={this.onConnect} />}
                  {
                    this.state.connected && 
                    <div>
                      <ResultsSubmitForm submitElectionResult={this.submitElectionResult}/>
                      {this.state.errorFlag && <div onClick={this.clearErorr}>{this.state.errorMessage}</div>} 

                  </div>
                  }


                </SLanding>
              )}
          </SContent>
        </Column>
      </SLayout>
    );
  };
}

export default App;
