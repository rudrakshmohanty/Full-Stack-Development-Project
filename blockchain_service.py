from web3 import Web3
import os
import json

# Connect to local blockchain (e.g., Ganache, Hardhat, or Infura)
WEB3_PROVIDER = os.environ.get('WEB3_PROVIDER', 'http://127.0.0.1:7545')
web3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER))

# Load contract ABI and address
CONTRACT_PATH = os.path.join(os.path.dirname(__file__), 'blockchain', 'artifacts', 'blockchain', 'contracts', 'CredentialRegistry.sol', 'CredentialRegistry.json')
with open(CONTRACT_PATH) as f:
    contract_json = json.load(f)
    abi = contract_json['abi']
    # You may need to set the address manually after deployment
    contract_address = os.environ.get('CREDENTIAL_REGISTRY_ADDRESS')

credential_registry = web3.eth.contract(address=contract_address, abi=abi)

# Example function to register a credential on-chain
def register_credential_on_chain(issuer_address, recipient_address, verification_code, metadata):
    # You must unlock the account or use a private key
    # For demo, use the first account
    account = web3.eth.accounts[0]
    tx = credential_registry.functions.registerCredential(
        issuer_address,
        recipient_address,
        verification_code,
        metadata
    ).build_transaction({
        'from': account,
        'nonce': web3.eth.get_transaction_count(account)
    })
    signed_tx = web3.eth.account.sign_transaction(tx, private_key=os.environ.get('PRIVATE_KEY'))
    tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    return web3.toHex(tx_hash)

# Example function to verify credential on-chain
def verify_credential_on_chain(verification_code):
    return credential_registry.functions.isCredentialValid(verification_code).call()
