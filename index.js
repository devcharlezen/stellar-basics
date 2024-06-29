// Importing the Stellar SDK
const {
    Keypair,            // Allows generation of Stellar key pairs (public and secret keys)
    Server,             // Provides access to the Stellar Horizon server
    TransactionBuilder, // Helps construct Stellar transactions
    Networks,           // Defines Stellar network constants (e.g., TESTNET)
    Operation,          // Represents operations in a Stellar transaction (e.g., createAccount)
  } = require("stellar-sdk");
  
  // Horizon testnet server instance
  const server = new Server("https://horizon-testnet.stellar.org");
  
  // Secret key of the funding account (used to fund new accounts)
  const fundAccountSecret = "SDIVBUJWVISV2IKT7HTVG4XP5VJYPTETFJWOIQXNQLBX7UJFKX53CUNG";
  
  // Function to generate a new key pair and activate an account
  const createKeyPairAndActivateAccount = async () => {
    try {
      // Generate a new Stellar key pair
      const pair = Keypair.random();
      const secretKey = pair.secret(); // Retrieve the secret key from the key pair
      const publicKey = pair.publicKey(); // Retrieve the public key from the key pair
  
      console.log("New Account Created:");
      console.log("  Secret Key:", secretKey);
      console.log("  Public Key:", publicKey);
  
      // Activate the account by funding it
      console.log("Activating account...");
  
      // Call the activation function with the public key of the new account
      await activateAccount(publicKey);
  
      console.log("Account activated successfully.");
    } catch (error) {
      console.error("Error creating and activating account:", error);
    }
  };
  
  // Function to activate a Stellar account by funding it with Lumens
  const activateAccount = async (destination) => {
    try {
      // Fetch the current base fee from the Stellar network
      const fee = await server.fetchBaseFee();
  
      // Load the funding account using its secret key
      const sourceKeypair = Keypair.fromSecret(fundAccountSecret);
      const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
  
      // Build a new Stellar transaction to create and fund the destination account
      const transaction = new TransactionBuilder(sourceAccount, {
        fee,
        networkPassphrase: Networks.TESTNET, // Use the TESTNET network passphrase
      })
        .addOperation(
          Operation.createAccount({
            destination, // Public key of the account to be funded
            startingBalance: "10", // Amount of Lumens to send to the new account
          })
        )
        .setTimeout(30) // Set a transaction timeout of 30 seconds
        .build();
  
      // Sign the transaction with the funding account's secret key
      transaction.sign(sourceKeypair);
  
      // Submit the transaction to the Stellar network for processing
      console.log("Processing transaction...");
      const transactionResult = await server.submitTransaction(transaction);
  
      console.log("Transaction successful. Results:", transactionResult);
    } catch (error) {
      console.error("Error activating account:", error.response.data.extras.result_codes);
    }
  };
  
  // Invoke the function to generate a new key pair and activate the Stellar account
  createKeyPairAndActivateAccount();
  