import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import { Navbar } from './Navbar';
import SocialNetwork from '../abis/SocialNetwork.json';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      account: '',
      socialNetwork: null,
      postCount: 0,
      posts: [],
      loading: true,
      content: '',
    };
  }

  async componentWillMount() {
    await this.loadWeb3();

    await this.loadBlockchainData();

  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  createPost(content) {
    this.setState({ loading: true });
    this.state.socialNetwork.methods.createPost(content)
      .send({ from: this.state.account })
      .once('receipt', (receipt) => {
        this.setState({ loading: false });
      });
  }

  tipPost(postId, tipAmount) {
    this.setState({ loading: true });
    this.state.socialNetwork.methods.tipPost(postId)
      .send({ from: this.state.account, value: tipAmount })
      .once('receipt', (receipt) => {
        this.setState({ loading: false });
      });
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    console.log(accounts[0]);
    this.setState({ account: accounts[0] });
    const networkId = await web3.eth.net.getId();
    const networkData = SocialNetwork.networks[networkId];
    if (networkData) {
      const socialNetwork = new web3.eth.Contract(
        SocialNetwork.abi,
        networkData.address,
      );
      this.setState({ socialNetwork });
      const postCount = await socialNetwork.methods.postCount().call();
      this.setState({ postCount });
      for (let i = 1; i <= postCount; i++) {
        const post = await socialNetwork.methods.posts(i).call();
        this.setState({
          posts: [...this.state.posts, post],
        });
      }
      this.setState({
        posts: this.state.posts.sort((a, b) => b.tipAmount - a.tipAmount),
      })
      this.setState({ loading: false });
    } else {
      window.alert('Network is not supported');
    }

  }



  render() {
    console.log(this.state.posts);
    return (
      <div>
        <Navbar account={this.state.account} />
        <p>&nbsp;</p>
        <form>
          <div className='form-group mr-sm-2' >
            <input
              type='text'
              className='form-control'
              id='post'
              placeholder='What is on your mind?'
              onChange={(event) => this.setState({ content: event.target.value })}
              required
            />

            <button  onClick={(event) => {event.preventDefault(); this.createPost(this.state.content) }} className='btn btn-primary btn-block'  >Share</button>

          </div>
        </form>
        {
          this.state.loading ? <div>Loading...</div> :

            <div className="container-fluid mt-5">
              <div className="row">
                <main role="main" className="col-lg-12 ml-auto mr-auto " style={{ maxWidth: '500px' }}>
                  <div className="content mr-auto ml-auto">
                    {this.state.posts.length > 0 && this.state.posts.map((post, index) => {
                      return (
                        <div className='card mb-4' key={index}>
                          <h3>{post.content}</h3>
                          <p>{post.author}</p>
                          <p>Tips: {window.web3.utils.fromWei(post.tipAmount.toString(), 'Ether')} Eth</p>
                          <button 
                          className='btn btn-link btn-sm float-right pt-0' 
                          name={post.id}
                          onClick={(event) => {event.preventDefault(); this.tipPost(post.id, window.web3.utils.toWei('1', 'Ether'))}}
                           >Tip 0.1 Eth</button>
                        </div>
                      );
                    })}
                  </div>
                </main>
              </div>
            </div>
        }

      </div>
    );
  }
}

export default App;
