// SPDX-License-Identifier: GPL-3.0
pragma solidity >0.7.0 <= 0.9.0;

import "./model/rcx-nft-vehicle-gallery.model.sol";


    struct Project {
    string projectId;
    string name;
    string mobile;
    string email;
    string color;
    string version;
    string model;
    string make;
    string engineNo;
    string chasisNo;
    string fcDate;

    address owner;
    address[] pastOwners;
    NftCategory nftCategory;
    uint[] galleryIdKeys; // list of answer galleryBytes so we can look them up
}

enum NftCategory {
    SALE,
    RECYCLE
}

contract RcxNft {
    //projectId string is used in project mapping also for ref.
    mapping(string => Project) nfts;
    uint nftCount;

    mapping(string => mapping(uint => VehicleGallery)) gallery;
    mapping(string => uint) galleryProjectCount;
    // mapping(uint => VehicleGallery) gallery;


    constructor() {
        nftCount = 0;
    }

    modifier isEmpty(string memory input) {
        if(bytes(input).length == 0) {
            revert("Error: Mandatory fields missing");
        }
        _;
    }

    modifier isProjectIdExists(string memory projectId) {
        if(bytes(nfts[projectId].projectId).length != 0) {
            revert("Error: ProjectId already exists");
        }
        _;
    }

    modifier isProjectOwner(string memory projectId, address sender) {
        if(nfts[projectId].owner != sender) {
            revert("Error: You are not allowed for ownership transfer");
        }
        _;
    }

    modifier isValidProjectId(string memory projectId) {
        string memory id = nfts[projectId].projectId;
        bool matches = keccak256(bytes(id)) == keccak256(bytes(projectId));
        require(matches, "Error: ProjectId does not exists");
        _;
    }

    event NftCreated(address indexed owner, string indexed nftCoverName, uint totalNftCount);
    event NftOwnerTransferred(address indexed oldOwner, address indexed newOwner, string indexed projectId);
    receive() external payable {}
    fallback() external payable {}

    function createNft(
        string memory _projectId, string memory _color, string memory _version, string memory _model,
        string memory _make,string memory _engineNo, string memory _chasisNo, string memory _fcDate, NftCategory _nftCategory)
    isEmpty(_color) isEmpty(_version) isEmpty(_model) isEmpty(_make) isEmpty(_engineNo) isEmpty(_chasisNo)
    isProjectIdExists(_projectId) public {
        Project memory obj;
        obj.projectId = _projectId;
        obj.color = _color;
        obj.version = _version;
        obj.model = _model;
        obj.make = _make;
        obj.engineNo = _engineNo;
        obj.chasisNo = _chasisNo;
        obj.fcDate = _fcDate;
        obj.owner = msg.sender;
        obj.galleryIdKeys = getAllKeyInProjectGallery(_projectId);
        nfts[_projectId] = obj;
        nftCount = nftCount + 1;
        emit NftCreated(obj.owner, obj.engineNo, nftCount);
    }

    function getTotalNft() public view returns(uint) {
        return nftCount;
    }

    function getNftByProjectId(string memory projectId) public view returns(Project memory) {
        return nfts[projectId];
    }

    function addItemToGallery(string memory _projectId, string memory _fileName, string memory _fileUrl)
    isEmpty(_projectId) isEmpty(_fileName) isEmpty(_fileUrl) public {
        VehicleGallery memory obj;
        obj.fileName = _fileName;
        obj.fileUrl = _fileUrl;
        uint index = galleryProjectCount[_projectId];
        galleryProjectCount[_projectId] = index + 1;
        gallery[_projectId][index] = obj;
    }

    function getAllItemsInProjectGallery(string memory _projectId) isEmpty(_projectId) public view returns (VehicleGallery[] memory) {
        uint total = galleryProjectCount[_projectId];
        VehicleGallery[] memory galleryList = new VehicleGallery[](total);
        for (uint i = 0; i < total; i++) {
            VehicleGallery storage g = gallery[_projectId][i];
            galleryList[i] = g;
        }
        return galleryList;
    }

    function getAllKeyInProjectGallery(string memory _projectId) isEmpty(_projectId) private view returns (uint[] memory) {
        uint total = galleryProjectCount[_projectId];
        uint[] memory galleryList = new uint[](total);
        for (uint i = 0; i < total; i++) {
            galleryList[i] = i;
        }
        return galleryList;
    }

    function transferNftProjectOwnerShip(address newOwner, string memory projectId) isValidProjectId(projectId) isProjectOwner(projectId, msg.sender) public  {
        nfts[projectId].owner = newOwner;
        nfts[projectId].pastOwners.push(msg.sender);
        emit NftOwnerTransferred(newOwner, msg.sender, projectId);
    }

    function payout(address payable _to) public payable {
        (bool sent, ) = _to.call{value: msg.value}("");
        require(sent, "Failed! Error while processing");
    }
}
