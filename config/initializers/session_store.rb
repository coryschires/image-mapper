# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_imagemapper_session',
  :secret      => '3c286fbb306d764235fc1548b5d7247b102406bf8c7a941e52f203e5e8b57ea9c9feef2f32ac264c2324ae174ae041d8152e5d26d5a7eeeb452e0ee81f103a24'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
