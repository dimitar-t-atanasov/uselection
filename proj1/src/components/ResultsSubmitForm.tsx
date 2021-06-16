import * as React from 'react';
// import styled from 'styled-components';
import './form.css'
import { logMsg } from '../helpers/dev';
// const MyInput = styled.div`
//     width: 100%;
//     padding: 12px 20px;
//     margin: 8px 0;
//     display: inline-block;
//     border: 1px solid #ccc;
//     border-radius: 4px;
//     box-sizing: border-box;
// `;

interface IAppState {
    votesForBiden: number;
    votesForTrump: number;
    stateName: string;
    stateSeats: number;
  }
  
  const INITIAL_STATE: IAppState = {
    votesForBiden: 0,
    votesForTrump: 0,
    stateName: '',
    stateSeats: 0
  };
  
  class ResultsSubmitForm extends React.Component<any, any> {
    // @ts-ignore
    public state: IAppState;
  
    constructor(props: any) {
      super(props);
      this.state = {
        ...INITIAL_STATE
      };

      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    // public componentDidMount() {
    //   if (this.web3Modal.cachedProvider) {
    //     this.onConnect();
    //   }
    // }

    public handleSubmit(event: any) {
        const {
            votesForBiden,
            votesForTrump,
            stateName,
            stateSeats
        } = this.state;
        logMsg('form submitted')
        event.preventDefault();
        this.props.submitElectionResult([stateName, votesForBiden, votesForTrump, stateSeats])
    }

    public handleChange(event: any) {
        const nam = event.target.name;
        const val = event.target.value;
        this.setState({[nam]: val});
    }
  

    public render = () => {
        const { votesForBiden, votesForTrump, stateName, stateSeats } = this.state
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                State Name:
                <input className={'formInput'} type="text" name="stateName" value={stateName} onChange={this.handleChange} />
                </label>
                <label>
                Votes for Biden:
                <input className={'formInput'} type="number" name="votesForBiden" value={votesForBiden} onChange={this.handleChange} />
                </label>
                <label>
                Votes for Trump:
                <input className={'formInput'} type="number" name="votesForTrump" value={votesForTrump} onChange={this.handleChange} />
                </label>
                <label>
                State seats:
                <input className={'formInput'} type="number" name="stateSeats" value={stateSeats} onChange={this.handleChange} />
                </label>
                <input type="submit" value="Submit" />
            </form>
        );
    };
  }

  export default ResultsSubmitForm;