#!/usr/bin/env bash

# Function to prompt for input with a default value
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local response

    read -p "$prompt [$default]: " response
    echo "${response:-$default}"
}

# Function to create or update .env file
update_env_file() {
    local key="$1"
    local value="$2"
    local env_file=".env"

    if grep -q "^$key=" "$env_file" 2>/dev/null; then
        sed -i "s|^$key=.*|$key=$value|" "$env_file"
    else
        echo "$key=$value" >> "$env_file"
    fi
}

echo ""
sleep 1
echo "Welcome to Kickstart Saas Configuration Wizard!"
sleep 1
echo "This script will guide you through setting up your project's configuration."
sleep 1
echo "Press Enter to use default values where available."
sleep 1
echo ""

sleep 2
# Database Configuration
echo "Database Configuration (Kickstart Saas only supports MongoDB at the moment.):"
# db_type=$(prompt_with_default "Enter database type (mysql/postgresql)" "postgresql")
# db_host=$(prompt_with_default "Enter database host" "localhost")
# db_port=$(prompt_with_default "Enter database port" "5432")
# db_name=$(prompt_with_default "Enter database name" "myproject")
# db_user=$(prompt_with_default "Enter database username" "admin")
# read -s -p "Enter database password: " db_password

sleep 1
db_url=$(prompt_with_default "Enter node.js mongodb connection string" "")
echo ""

# db_url="${db_type}://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}"
update_env_file "DATABASE_URL" "$db_url"

# Domain Configuration
echo ""
echo "Domain Configuration:"
domain=$(prompt_with_default "Enter your domain URL" "https://example.com")
update_env_file "NEXT_PUBLIC_APP_URL" "$domain"

# OpenAI API Configuration
echo ""
echo "OpenAI API Configuration:"
echo "To get your OpenAI API key, visit: https://platform.openai.com/account/api-keys"
read -s -p "Enter your OpenAI API key: " openai_key
echo ""
update_env_file "OPENAI_API_KEY" "$openai_key"

# Stripe Configuration
echo ""
echo "Stripe Configuration:"
echo "To get your Stripe API keys, visit: https://dashboard.stripe.com/apikeys"
read -s -p "Enter your Stripe publishable key: " stripe_pub_key
echo ""
read -s -p "Enter your Stripe secret key: " stripe_secret_key
echo ""
read -s -p "Enter your Stripe webhook secret: " stripe_webhook_secret
echo ""
update_env_file "STRIPE_PUBLISHABLE_KEY" "$stripe_pub_key"
update_env_file "STRIPE_SECRET_KEY" "$stripe_secret_key"
update_env_file "STRIPE_WEBHOOK_SECRET" "$stripe_webhook_secret"

# Additional configurations can be added here

echo ""
echo "Configuration complete. Your settings have been saved to .env"
echo ".env has been added to your .gitignore file to keep your secrets safe."
echo ""
echo "You may need to restart your application for changes to take effect."

# Optionally, display the contents of the .env file
read -p "Would you like to view your .env file? (y/n) " show_env
if [[ $show_env == "y" ]]; then
    echo ""
    echo "Contents of .env:"
    cat .env
fi

echo ""
echo "Thank you for using Kickstart Saas! Now go kickstart your project! 🚀"