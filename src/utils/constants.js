// Receiver address for payments
export const FIXED_RECEIVER_ADDRESS = "0x826F389be2A72c80A8406fB967269c584e00b0Fa";

// Network configuration
export const SUPPORTED_NETWORKS = {
  1: "Ethereum Mainnet",
  3: "Ropsten Testnet",
  4: "Rinkeby Testnet",
  5: "Goerli Testnet",
  42: "Kovan Testnet",
  56: "Binance Smart Chain",
  137: "Polygon Mainnet",
  80001: "Mumbai Testnet",
  1337: "Local Network"
};

// Default fallback network
export const DEFAULT_NETWORK = 1337; // Local network

// Product categories
export const CATEGORIES = [
  { id: "cricket", name: "Cricket" },
  { id: "football", name: "Football" },
  { id: "badminton", name: "Badminton" }
];

// Mock products for fallback when blockchain is not available
export const MOCK_PRODUCTS = {
  cricket: [
    {
      id: 1,
      name: "Signed Virat Kohli Bat",
      description: "Official bat signed by Virat Kohli from 2023 World Cup",
      image: "https://via.placeholder.com/300x200?text=Kohli+Bat",
      price: "0.5",
      category: "cricket",
      seller: "0x0000000000000000000000000000000000000000",
      sold: false
    },
    {
      id: 2,
      name: "India Team Jersey 2023",
      description: "Official India cricket team jersey from 2023 season",
      image: "https://via.placeholder.com/300x200?text=India+Jersey",
      price: "0.2",
      category: "cricket",
      seller: "0x0000000000000000000000000000000000000000",
      sold: false
    },
    {
      id: 3,
      name: "Cricket World Cup Ticket",
      description: "Commemorative ticket from 2023 Cricket World Cup Final",
      image: "https://via.placeholder.com/300x200?text=WC+Ticket",
      price: "0.3",
      category: "cricket",
      seller: "0x0000000000000000000000000000000000000000",
      sold: false
    }
  ],
  football: [
    {
      id: 4,
      name: "Signed Messi Jersey",
      description: "Official Barcelona jersey signed by Lionel Messi",
      image: "https://via.placeholder.com/300x200?text=Messi+Jersey",
      price: "0.8",
      category: "football",
      seller: "0x0000000000000000000000000000000000000000",
      sold: false
    },
    {
      id: 5,
      name: "Champions League Final Ball",
      description: "Match ball used in 2022 Champions League final",
      image: "https://via.placeholder.com/300x200?text=UCL+Ball",
      price: "0.4",
      category: "football",
      seller: "0x0000000000000000000000000000000000000000",
      sold: false
    },
    {
      id: 6,
      name: "World Cup Memorabilia Set",
      description: "Collection of items from the 2022 World Cup in Qatar",
      image: "https://via.placeholder.com/300x200?text=WC+Set",
      price: "0.6",
      category: "football",
      seller: "0x0000000000000000000000000000000000000000",
      sold: false
    }
  ],
  badminton: [
    {
      id: 7,
      name: "PV Sindhu Signed Racket",
      description: "Competition racket signed by Olympic medalist PV Sindhu",
      image: "https://via.placeholder.com/300x200?text=Sindhu+Racket",
      price: "0.4",
      category: "badminton",
      seller: "0x0000000000000000000000000000000000000000",
      sold: false
    },
    {
      id: 8,
      name: "Olympic Badminton Shuttlecock",
      description: "Official shuttlecock used in Olympic badminton finals",
      image: "https://via.placeholder.com/300x200?text=Olympic+Shuttlecock",
      price: "0.2",
      category: "badminton",
      seller: "0x0000000000000000000000000000000000000000",
      sold: false
    },
    {
      id: 9,
      name: "Autographed Championship Photo",
      description: "Signed photo from the World Badminton Championship",
      image: "https://via.placeholder.com/300x200?text=Championship+Photo",
      price: "0.3",
      category: "badminton",
      seller: "0x0000000000000000000000000000000000000000",
      sold: false
    }
  ]
};

// Placeholder contract addresses (will be overwritten by deployment)
export const DEFAULT_CONTRACT_ADDRESSES = {
  SportsMarketplace: "0x0000000000000000000000000000000000000000"
};