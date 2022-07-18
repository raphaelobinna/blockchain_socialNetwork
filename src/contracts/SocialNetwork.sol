pragma solidity ^0.5.0;

contract SocialNetwork {
    string public name; 
    uint public postCount = 0;
    mapping(uint => Post) public posts;

    struct Post {
        uint id; 
        string content;
        uint tipAmount;
        address payable author;
    }

    event PostCreated(
        uint id,
        string  content,
        uint  tipAmount,
        address payable  author
    );

     event PostTipped(
        uint id,
        string  content,
        uint  tipAmount,
        address payable author
    );
    

    constructor() public {
        name = "Raphael SocialNetwork";
    }

    function createPost(string memory _content ) public {
        require(bytes(_content).length > 0);

        postCount ++;
        posts[postCount] = Post(postCount, _content, 0, msg.sender);

        //Trigger the event
       emit PostCreated(postCount, _content, 0, msg.sender);

    }

    function tipPost(uint _id) public payable {
        //make sure id is valid
        require(_id > 0 && _id <= postCount);
        //fetch the post
        Post memory _post = posts[_id];
        //fetch the author of the post
        address payable _author = _post.author;
        //pay the author
        address(_author).transfer(msg.value);
        //increment the tip amount
        _post.tipAmount = _post.tipAmount + msg.value;
        //update the post
        posts[_id] = _post;
        //Trigger the event
        emit PostTipped(_id, _post.content, _post.tipAmount, _post.author);
    }


} 